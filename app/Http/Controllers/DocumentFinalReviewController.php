<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentRecipient;
use App\Models\DocumentSigner;
use App\Models\User;
use App\Models\Department;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentFinalReviewController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * แสดงหน้าตรวจสอบเอกสารขั้นสุดท้าย
     */
    public function show(Document $document)
    {
        // ตรวจสอบสิทธิ์การเข้าถึง
        $currentSigner = DocumentSigner::where('document_id', $document->id)
            ->where('user_id', Auth::id())
            ->where('step', 4) // Step 4: Stamp Management
            ->where('status', 'completed')
            ->first();

        if (!$currentSigner) {
            abort(403, 'ไม่มีสิทธิ์เข้าถึงเอกสารนี้');
        }

        // ตรวจสอบสถานะเอกสาร
        if ($document->status !== 'pending_final_review') {
            return redirect()->route('documents.index')
                ->with('error', 'เอกสารนี้ไม่อยู่ในสถานะที่สามารถตรวจสอบขั้นสุดท้ายได้');
        }

        // ดึงข้อมูลลายเซ็นทั้งหมด
        $signatures = DocumentSigner::where('document_id', $document->id)
            ->where('status', 'completed')
            ->with('user')
            ->orderBy('step')
            ->get()
            ->map(function ($signer) {
                return [
                    'id' => $signer->id,
                    'user_name' => $signer->user->fname . ' ' . $signer->user->lname,
                    'position' => $signer->user->position->name ?? '',
                    'step' => $signer->step,
                    'signer_type' => $signer->signer_type,
                    'signed_at' => $signer->signed_at,
                    'signature_data' => json_decode($signer->signature_data, true)
                ];
            });

        // ดึงข้อมูลตราประทับ
        $stamps = $document->stamps()->with('stamp')->get()->map(function ($docStamp) {
            return [
                'id' => $docStamp->id,
                'stamp_name' => $docStamp->stamp->name,
                'position_data' => $docStamp->position_data,
                'user_name' => $docStamp->user->fname . ' ' . $docStamp->user->lname,
                'stamp_url' => Storage::url($docStamp->stamp->file_path)
            ];
        });

        // ดึงข้อมูลแผนกและผู้ใช้
        $departments = Department::orderBy('name')->get();
        $users = User::with('department', 'position')
            ->where('is_active', true)
            ->orderBy('fname')
            ->orderBy('lname')
            ->get();

        // URL ไฟล์ PDF
        $fileUrl = Storage::url($document->current_file_path ?? $document->file_path);

        // Load relationships
        $document->load(['documentType', 'user']);

        return Inertia::render('documents/final-review', [
            'document' => $document,
            'signatures' => $signatures,
            'stamps' => $stamps,
            'departments' => $departments,
            'users' => $users,
            'fileUrl' => $fileUrl
        ]);
    }

    /**
     * เสร็จสิ้นกระบวนการ
     */
    public function complete(Request $request, Document $document)
    {
        // Validate input
        $request->validate([
            'access_type' => 'required|in:public,restricted',
            'is_public' => 'required|boolean',
            'recipient_ids' => 'required_if:access_type,restricted|array',
            'recipient_ids.*' => 'exists:users,id'
        ]);

        // ตรวจสอบสิทธิ์การเข้าถึง
        $currentSigner = DocumentSigner::where('document_id', $document->id)
            ->where('user_id', Auth::id())
            ->where('step', 4)
            ->where('status', 'completed')
            ->first();

        if (!$currentSigner) {
            abort(403, 'ไม่มีสิทธิ์เข้าถึงเอกสารนี้');
        }

        // ตรวจสอบสถานะเอกสาร
        if ($document->status !== 'pending_final_review') {
            return back()->withErrors([
                'general' => 'เอกสารนี้ไม่อยู่ในสถานะที่สามารถเสร็จสิ้นได้'
            ]);
        }

        try {
            DB::beginTransaction();

            // อัพเดทสถานะเอกสาร
            $document->update([
                'status' => 'completed',
                'access_type' => $request->access_type,
                'is_public' => $request->is_public,
                'completed_at' => now(),
                'is_fully_signed' => true
            ]);

            // บันทึกผู้รับเอกสารขั้นสุดท้าย
            if ($request->access_type === 'restricted' && !empty($request->recipient_ids)) {
                foreach ($request->recipient_ids as $userId) {
                    DocumentRecipient::create([
                        'document_id' => $document->id,
                        'user_id' => $userId,
                        'recipient_type' => 'viewer'
                    ]);
                }

                // ส่งการแจ้งเตือนให้ผู้รับเอกสาร
                $recipients = User::whereIn('id', $request->recipient_ids)->get();
                foreach ($recipients as $recipient) {
                    $this->notificationService->sendNotification(
                        userId: $recipient->id,
                        type: 'document_completed',
                        title: 'ได้รับเอกสารใหม่',
                        message: "คุณได้รับเอกสาร \"{$document->title}\" ที่เสร็จสิ้นกระบวนการแล้ว",
                        data: [
                            'document_id' => $document->id,
                            'document_title' => $document->title,
                            'action_required' => 'view_document'
                        ]
                    );
                }
            }

            DB::commit();

            return redirect()->route('documents.index')
                ->with('success', 'เสร็จสิ้นกระบวนการเอกสารเรียบร้อยแล้ว');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'general' => 'เกิดข้อผิดพลาดในการเสร็จสิ้นกระบวนการ: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * แสดงเอกสารแบบ view-only
     */
    public function viewOnly(Document $document)
    {
        $user = Auth::user();

        // ตรวจสอบสิทธิ์การเข้าถึง
        if (!$document->userCanAccess($user)) {
            abort(403, 'ไม่มีสิทธิ์เข้าถึงเอกสารนี้');
        }

        // Mark ว่าเข้าถึงแล้ว (ถ้าเป็นผู้รับเอกสาร)
        $recipient = DocumentRecipient::where('document_id', $document->id)
            ->where('user_id', $user->id)
            ->first();

        if ($recipient) {
            $recipient->markAsAccessed();
        }

        // ดึงข้อมูลลายเซ็นและตรา
        $signatures = DocumentSigner::where('document_id', $document->id)
            ->where('status', 'completed')
            ->with('user')
            ->orderBy('step')
            ->get();

        $stamps = $document->stamps()->with('stamp')->get();

        // URL ไฟล์ PDF
        $fileUrl = Storage::url($document->current_file_path ?? $document->file_path);

        // Load relationships
        $document->load(['documentType', 'user']);

        return Inertia::render('documents/view-only', [
            'document' => $document,
            'signatures' => $signatures,
            'stamps' => $stamps,
            'fileUrl' => $fileUrl,
            'isPublic' => $document->is_public && $document->access_type === 'public'
        ]);
    }
}
