<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentSigner;
use App\Models\DocumentStamp;
use App\Models\Stamp;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\WorkflowService;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentStampController extends Controller
{
    public function __construct(
        private NotificationService $notificationService,
        private WorkflowService $workflowService,
        private PdfService $pdfService
    ) {}

    /**
     * แสดงหน้าจัดการตราประทับ
     */
    public function show(Document $document)
    {
        // ตรวจสอบสิทธิ์การเข้าถึง
        $currentSigner = DocumentSigner::where('document_id', $document->id)
            ->where('user_id', Auth::id())
            ->where('step', 4) // Step 4: Stamp Management
            ->where('status', 'waiting')
            ->first();

        if (!$currentSigner) {
            abort(403, 'ไม่มีสิทธิ์เข้าถึงเอกสารนี้');
        }

        // ตรวจสอบสถานะเอกสาร
        if ($document->status !== 'pending_stamp') {
            return redirect()->route('documents.index')
                ->with('error', 'เอกสารนี้ไม่อยู่ในสถานะที่สามารถจัดการตราประทับได้');
        }

        // ดึงข้อมูลตราประทับที่มีอยู่
        $availableStamps = Stamp::where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(function ($stamp) {
                return [
                    'id' => $stamp->id,
                    'name' => $stamp->name,
                    'file_path' => $stamp->file_path,
                    'category' => $stamp->category,
                    'preview_url' => Storage::url($stamp->file_path)
                ];
            });

        // ดึงรองผู้อำนวยการ
        $deputyDirectors = User::whereHas('position', function ($query) {
                $query->where('name', 'รองผู้อำนวยการ');
            })
            ->where('is_active', true)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'fname' => $user->fname,
                    'lname' => $user->lname,
                    'email' => $user->email,
                    'priority' => 1 // หรือจะใช้ ID หรือวิธีอื่นในการจัดลำดับ
                ];
            });

        // URL ไฟล์ PDF
        $fileUrl = Storage::url($document->current_file_path ?? $document->file_path);

        return Inertia::render('documents/manage-stamps', [
            'document' => $document->load(['documentType', 'user']),
            'availableStamps' => $availableStamps,
            'deputyDirectors' => $deputyDirectors,
            'fileUrl' => $fileUrl
        ]);
    }

    /**
     * บันทึกตราประทับและเลือกผู้ลงนาม
     */
    public function save(Request $request, Document $document)
    {
        // Log request data for debugging
        \Illuminate\Support\Facades\Log::info('=== STAMP SAVE REQUEST DEBUG ===');
        \Illuminate\Support\Facades\Log::info('Request data:', $request->all());

        // Validate input
        $request->validate([
            'stamps' => 'required|array|min:1',
            'stamps.*.id' => 'required|string',
            'stamps.*.stampId' => 'required|integer',
            'stamps.*.imageUrl' => 'required|string',
            'stamps.*.position' => 'required|array',
            'deputy_director_id' => 'required|exists:users,id'
        ]);

        // ตรวจสอบสิทธิ์การเข้าถึง
        $currentSigner = DocumentSigner::where('document_id', $document->id)
            ->where('user_id', Auth::id())
            ->where('step', 4)
            ->where('status', 'waiting')
            ->first();

        if (!$currentSigner) {
            abort(403, 'ไม่มีสิทธิ์เข้าถึงเอกสารนี้');
        }

        // ตรวจสอบสถานะเอกสาร
        if ($document->status !== 'pending_stamp') {
            return back()->withErrors([
                'general' => 'เอกสารนี้ไม่อยู่ในสถานะที่สามารถจัดการตราประทับได้'
            ]);
        }

        try {
            DB::beginTransaction();

            // บันทึกตราประทับ
            $stamps = $request->stamps;
            foreach ($stamps as $stampData) {
                // ใช้ stampId ที่ส่งมาจาก frontend
                $stampId = $stampData['stampId'] ?? null;
                
                \Illuminate\Support\Facades\Log::info('Processing stamp:', [
                    'stampId' => $stampId,
                    'position' => $stampData['position'] ?? null
                ]);
                
                if ($stampId) {
                    DocumentStamp::create([
                        'document_id' => $document->id,
                        'stamp_id' => $stampId,
                        'user_id' => Auth::id(),
                        'position_data' => $stampData['position']
                    ]);
                }
            }

            // สร้าง PDF ใหม่ที่มีตราประทับ
            $stampDataForPdf = [];
            foreach ($stamps as $stampData) {
                $stampId = $stampData['stampId'] ?? null;
                if ($stampId) {
                    $stamp = Stamp::find($stampId);
                    if ($stamp) {
                        $stampDataForPdf[] = [
                            'id' => $stampData['id'],
                            'imageUrl' => Storage::url($stamp->file_path),
                            'position' => $stampData['position']
                        ];
                    }
                }
            }

            if (!empty($stampDataForPdf)) {
                \Illuminate\Support\Facades\Log::info('Creating PDF with stamps:', [
                    'document_id' => $document->id,
                    'stamps_count' => count($stampDataForPdf)
                ]);

                $newFilePath = $this->pdfService->insertStampsToPdf($document, $stampDataForPdf);
                
                // อัพเดท current_file_path ของเอกสาร
                $document->update([
                    'current_file_path' => $newFilePath
                ]);

                \Illuminate\Support\Facades\Log::info('PDF with stamps created successfully:', [
                    'document_id' => $document->id,
                    'new_file_path' => $newFilePath
                ]);
            }

            // อัพเดทสถานะ current signer (ผู้จัดการตรา)
            if ($currentSigner) {
                $currentSigner->update([
                    'status' => 'completed',
                    'signed_at' => now(),
                    'signature_data' => json_encode([
                        'stamps' => $stamps,
                        'deputy_director_selected' => $request->deputy_director_id
                    ])
                ]);
            }

            // สร้าง DocumentSigner สำหรับรองผู้อำนวยการที่เลือก
            DocumentSigner::create([
                'document_id' => $document->id,
                'user_id' => $request->deputy_director_id,
                'step' => 5, // Step 5: Final Deputy Director Signing
                'signer_type' => 'deputy_director_2',
                'status' => 'waiting',
                'signing_order' => 1
            ]);

            // อัพเดทสถานะเอกสาร
            $document->update([
                'status' => 'pending_deputy_director_2',
                'current_step' => 5
            ]);

            // ส่งการแจ้งเตือน
            $deputyDirector = User::find($request->deputy_director_id);
            $this->notificationService->sendNotification(
                userId: $deputyDirector->id,
                type: 'document_signing_required',
                title: 'เอกสารรอลงนามขั้นสุดท้าย',
                message: "เอกสาร \"{$document->title}\" รอการลงนามขั้นสุดท้ายจากคุณ",
                data: [
                    'document_id' => $document->id,
                    'document_title' => $document->title,
                    'step' => 5,
                    'action_required' => 'final_signing'
                ]
            );

            DB::commit();

            return redirect()->route('documents.index')
                ->with('success', 'บันทึกตราประทับและส่งต่อให้รองผู้อำนวยการลงนามเรียบร้อยแล้ว');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'general' => 'เกิดข้อผิดพลาดในการบันทึก: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * หา stamp_id จากข้อมูลตรา
     */
    private function getStampIdFromData(array $stampData): ?int
    {
        // สามารถใช้วิธีการต่างๆ เช่น parse จาก imageUrl หรือใช้ ID ที่ส่งมา
        // ในที่นี้สมมติว่าใช้ preview_url เพื่อหา stamp
        $imageUrl = $stampData['imageUrl'];
        
        $stamp = Stamp::get()->first(function ($stamp) use ($imageUrl) {
            return Storage::url($stamp->file_path) === $imageUrl;
        });

        return $stamp?->id;
    }
}
