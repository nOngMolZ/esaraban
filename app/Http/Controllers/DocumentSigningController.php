<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentSigner;
use App\Services\WorkflowService;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DocumentSigningController extends Controller
{
    private WorkflowService $workflowService;
    private PdfService $pdfService;

    public function __construct(WorkflowService $workflowService, PdfService $pdfService)
    {
        $this->workflowService = $workflowService;
        $this->pdfService = $pdfService;
    }



    /**
     * แสดงหน้าลงนาม
     */
    public function showSignForm(Document $document): Response
    {
        $user = Auth::user();

        // ตรวจสอบสิทธิ์ในการลงนาม
        if (!$this->workflowService->canUserSign($document, $user)) {
            abort(403, 'คุณไม่มีสิทธิ์ลงนามเอกสารนี้ในขณะนี้');
        }

        // ดึงข้อมูลผู้ลงนามปัจจุบัน
        $currentSigner = DocumentSigner::where('document_id', $document->id)
            ->where('user_id', $user->id)
            ->where('step', $document->current_step)
            ->where('status', 'waiting')
            ->first();

        if (!$currentSigner) {
            abort(404, 'ไม่พบข้อมูลการลงนาม');
        }

        // ดึงประวัติการลงนามที่ผ่านมา
        $previousSignatures = DocumentSigner::where('document_id', $document->id)
            ->where('status', 'signed')
            ->with('user')
            ->orderBy('step')
            ->get();

        $workflowStep = $this->workflowService->getCurrentWorkflowStep($document);

        return Inertia::render('documents/sign', [
            'document' => $document->load(['documentType', 'user']),
            'currentSigner' => $currentSigner,
            'previousSignatures' => $previousSignatures,
            'workflowStep' => $workflowStep,
            'fileUrl' => Storage::url($document->current_file_path),
            'stepLabels' => $this->getStepLabels(),
        ]);
    }

    /**
     * บันทึกลายเซ็น
     */
    public function saveSignature(Request $request, Document $document)
    {
        $validated = $request->validate([
            'signatures' => 'required|array|min:1',
            'signatures.*.id' => 'required|string',
            'signatures.*.imageData' => 'required|string',
            'signatures.*.position' => 'required|array',
            'signatures.*.position.x' => 'required|numeric',
            'signatures.*.position.y' => 'required|numeric',
            'signatures.*.position.width' => 'required|numeric|min:1',
            'signatures.*.position.height' => 'required|numeric|min:1',
            'signatures.*.position.pageIndex' => 'required|integer|min:0',
            'signatures.*.position.rotation' => 'numeric',
            'signatures.*.position.frontendPdfViewWidthPx' => 'numeric|min:1',
            'signatures.*.position.frontendPdfViewHeightPx' => 'numeric|min:1',
            'action' => 'required|in:approve,reject',
            'rejection_reason' => 'required_if:action,reject|string|max:500',
        ]);

        $user = Auth::user();

        // ตรวจสอบสิทธิ์
        if (!$this->workflowService->canUserSign($document, $user)) {
            return response()->json(['error' => 'คุณไม่มีสิทธิ์ลงนามเอกสารนี้'], 403);
        }

        try {
            if ($validated['action'] === 'approve') {
                // สร้าง PDF ใหม่ที่มีลายเซ็น
                $newPdfPath = $this->pdfService->insertSignaturesToPdf($document, $validated['signatures']);

                // อัปเดต current_file_path
                $document->update(['current_file_path' => $newPdfPath]);

                // บันทึกข้อมูลลายเซ็น (บีบอัดข้อมูลเพื่อประหยัดพื้นที่)
                $signatureData = $this->compressSignatureData([
                    'signatures' => $validated['signatures'],
                    'signed_at' => now(),
                    'pdf_path' => $newPdfPath,
                ]);

                $this->workflowService->processSignature(
                    $document,
                    $user,
                    $signatureData,
                    'approve'
                );

                return redirect()->route('documents.index')
                    ->with('success', 'ลงนามเอกสารเรียบร้อยแล้ว');
            } else {
                // กรณีปฏิเสธ
                $this->workflowService->processSignature(
                    $document,
                    $user,
                    '',
                    'reject',
                    $validated['rejection_reason']
                );

                return redirect()->route('documents.index')
                    ->with('success', 'ปฏิเสธเอกสารเรียบร้อยแล้ว');
            }
        } catch (\Exception $e) {
            Log::error('บันทึกลายเซ็นล้มเหลว', [
                'document_id' => $document->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'error' => 'เกิดข้อผิดพลาดในการบันทึกลายเซ็น: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * ปฏิเสธเอกสาร
     */
    public function rejectSignature(Request $request, Document $document)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $user = Auth::user();

        // ตรวจสอบสิทธิ์
        if (!$this->workflowService->canUserSign($document, $user)) {
            return response()->json(['error' => 'คุณไม่มีสิทธิ์ปฏิเสธเอกสารนี้'], 403);
        }

        try {
            $this->workflowService->processSignature(
                $document,
                $user,
                '',
                'reject',
                $validated['rejection_reason']
            );

            return redirect()->route('documents.index')
                ->with('success', 'ปฏิเสธเอกสารเรียบร้อยแล้ว');
        } catch (\Exception $e) {
            Log::error('ปฏิเสธเอกสารล้มเหลว', [
                'document_id' => $document->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors([
                'error' => 'เกิดข้อผิดพลาดในการปฏิเสธเอกสาร: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * ดูประวัติการลงนาม
     */
    public function signatureHistory(Request $request): Response
    {
        $user = Auth::user();

        $query = DocumentSigner::with(['document.documentType', 'document.user'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['signed', 'rejected']);

        // กรองตามช่วงวันที่
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        // กรองตามสถานะ
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $signatures = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // สถิติการลงนาม
        $stats = [
            'total_signed' => DocumentSigner::where('user_id', $user->id)
                ->where('status', 'signed')
                ->count(),
            'total_rejected' => DocumentSigner::where('user_id', $user->id)
                ->where('status', 'rejected')
                ->count(),
            'pending_count' => DocumentSigner::where('user_id', $user->id)
                ->where('status', 'waiting')
                ->count(),
        ];

        return Inertia::render('documents/signature-history', [
            'signatures' => $signatures,
            'statistics' => $stats,
            'filters' => [
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
                'status' => $request->input('status'),
            ],
        ]);
    }

    /**
     * ดูรายละเอียดลายเซ็น
     */
    public function showSignatureDetail(DocumentSigner $documentSigner): Response
    {
        // ตรวจสอบสิทธิ์
        if ($documentSigner->user_id !== Auth::id() && Auth::user()->role?->name !== 'แอดมิน') {
            abort(403, 'คุณไม่มีสิทธิ์ดูรายละเอียดนี้');
        }

        $documentSigner->load(['document.documentType', 'document.user', 'user']);

        // ดึงลายเซ็นอื่นๆ ในเอกสารเดียวกัน
        $allSignatures = DocumentSigner::where('document_id', $documentSigner->document_id)
            ->with('user')
            ->orderBy('step')
            ->get();

        return Inertia::render('documents/signature-detail', [
            'signature' => $documentSigner,
            'allSignatures' => $allSignatures,
            'fileUrl' => Storage::url($documentSigner->document->current_file_path),
        ]);
    }

    /**
     * ดาวน์โหลดเอกสารที่ลงนามแล้ว
     */
    public function downloadSignedDocument(DocumentSigner $documentSigner)
    {
        // ตรวจสอบสิทธิ์
        if ($documentSigner->user_id !== Auth::id() && Auth::user()->role?->name !== 'แอดมิน') {
            abort(403, 'คุณไม่มีสิทธิ์ดาวน์โหลดไฟล์นี้');
        }

        if ($documentSigner->status !== 'signed') {
            abort(404, 'ยังไม่มีเอกสารที่ลงนามแล้ว');
        }

        $document = $documentSigner->document;
        $filePath = storage_path('app/public/' . $document->current_file_path);

        if (!file_exists($filePath)) {
            abort(404, 'ไม่พบไฟล์เอกสาร');
        }

        $fileName = $document->title . '_signed_step_' . $documentSigner->step . '.pdf';
        return response()->download($filePath, $fileName);
    }

    /**
     * บีบอัดข้อมูลลายเซ็น
     */
    private function compressSignatureData(array $data): string
    {
        // ลบข้อมูล base64 ที่ไม่จำเป็นออกเพื่อประหยัดพื้นที่
        $compressedData = $data;
        
        if (isset($compressedData['signatures'])) {
            foreach ($compressedData['signatures'] as &$signature) {
                // เก็บเฉพาะข้อมูลที่จำเป็น
                if (isset($signature['imageData'])) {
                    // สามารถเก็บเฉพาะ metadata แทนข้อมูล base64 ทั้งหมด
                    $signature['has_image'] = true;
                    $signature['image_size'] = strlen($signature['imageData']);
                    // เก็บ base64 ไว้สำหรับการแสดงผล (อาจจะบีบอัดได้ในอนาคต)
                }
            }
        }
        
        return json_encode($compressedData);
    }

    /**
     * รับป้ายขั้นตอน
     */
    private function getStepLabels(): array
    {
        return [
            'pending_deputy_director_1' => [
                'title' => 'รออนุมัติรองผู้อำนวยการ (ขั้นที่ 1)',
                'description' => 'เอกสารรออนุมัติและลงนามจากรองผู้อำนวยการ',
                'step_number' => 1,
            ],
            'pending_director' => [
                'title' => 'รออนุมัติผู้อำนวยการ',
                'description' => 'เอกสารรออนุมัติและลงนามจากผู้อำนวยการ',
                'step_number' => 2,
            ],
            'pending_deputy_director_2' => [
                'title' => 'รออนุมัติรองผู้อำนวยการ (ขั้นที่ 2)',
                'description' => 'เอกสารรอการลงนามขั้นสุดท้ายจากรองผู้อำนวยการ',
                'step_number' => 5,
            ],
        ];
    }

    /**
     * ตรวจสอบสถานะเอกสาร (AJAX)
     */
    public function checkDocumentStatus(Document $document)
    {
        $workflowStep = $this->workflowService->getCurrentWorkflowStep($document);
        $canSign = $this->workflowService->canUserSign($document, Auth::user());

        return response()->json([
            'status' => $document->status,
            'current_step' => $document->current_step,
            'workflow_step' => $workflowStep,
            'can_sign' => $canSign,
            'updated_at' => $document->updated_at,
        ]);
    }

    /**
     * ดึงข้อมูลลายเซ็นที่บันทึกไว้ (สำหรับ auto-fill)
     */
    public function getUserSignatureTemplates()
    {
        $user = Auth::user();

        // ดึงลายเซ็นล่าสุด 5 รายการ
        $recentSignatures = DocumentSigner::where('user_id', $user->id)
            ->where('status', 'signed')
            ->whereNotNull('signature_data')
            ->orderBy('signed_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($signer) {
                $signatureData = json_decode($signer->signature_data, true);
                return [
                    'id' => $signer->id,
                    'document_title' => $signer->document->title,
                    'signed_at' => $signer->signed_at,
                    'signature_preview' => $signatureData['signatures'][0]['imageData'] ?? null,
                ];
            });

        return response()->json([
            'recent_signatures' => $recentSignatures,
        ]);
    }
}
