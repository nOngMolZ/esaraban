<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentType;
use App\Models\Department;
use App\Models\User;
use App\Models\FixedSigner;
use App\Services\WorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    private WorkflowService $workflowService;

    public function __construct(WorkflowService $workflowService)
    {
        $this->workflowService = $workflowService;
    }

    /**
     * แสดงรายการเอกสารทั้งหมด
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $type = $request->input('document_type');

        $query = Document::with(['documentType', 'user'])
            ->when($search, function ($query, $search) {
                return $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($type, function ($query, $type) {
                return $query->where('document_type_id', $type);
            })
            ->orderBy('created_at', 'desc');

        // ผู้ใช้ทั่วไปเห็นเฉพาะเอกสารที่เกี่ยวข้อง
        if (!Auth::user()->role || Auth::user()->role->name !== 'แอดมิน') {
            $query->where(function ($q) {
                $q->where('user_id', Auth::id())
                    ->orWhere('is_public', true)
                    ->orWhereHas('viewers', function ($q) {
                        $q->where('user_id', Auth::id());
                    })
                    ->orWhereHas('signers', function ($q) {
                        $q->where('user_id', Auth::id());
                    })
                    ->orWhereHas('recipients', function ($q) {
                        $q->where('user_id', Auth::id());
                    });
            });
        }

        $documents = $query->paginate(10)->withQueryString();

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'documentTypes' => DocumentType::all(),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'document_type' => $type,
            ],
        ]);
    }

    /**
     * แสดงหน้าเพิ่มเอกสาร (Phase 1)
     */
    public function create(): Response
    {
        return Inertia::render('documents/create', [
            'documentTypes' => DocumentType::all(),
        ]);
    }

    /**
     * บันทึกเอกสารใหม่และเริ่ม workflow (Phase 1)
     */
    public function store(Request $request)
    {
        // Debug: ตรวจสอบ authentication
        Log::info('เริ่มสร้างเอกสาร', [
            'user_id' => Auth::id(),
            'user_authenticated' => Auth::check(),
            'user_data' => Auth::user() ? Auth::user()->toArray() : null,
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'document_type_id' => 'required|exists:document_types,id',
            'file' => 'required|file|mimes:pdf|max:10240', // 10MB
        ]);

        Log::info('Validation passed', [
            'validated_data' => $validated,
        ]);

        try {
            // อัปโหลดไฟล์
            $file = $request->file('file');
            $dateFolderName = 'documents/' . date('Y/m');
            $fileName = uniqid() . '_' . $file->getClientOriginalName();
            
            Log::info('การอัปโหลดไฟล์', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'temp_path' => $file->getPathname(),
                'date_folder' => $dateFolderName,
                'file_name' => $fileName
            ]);
            
            // สร้าง folder ถ้าไม่มี
            $fullPath = storage_path('app/public/' . $dateFolderName);
            if (!is_dir($fullPath)) {
                mkdir($fullPath, 0755, true);
            }
            
            // ใช้วิธีเดียวกับโค้ดเก่าที่ทำงานได้
            $filePath = $file->storeAs($dateFolderName, $fileName, 'public');
            
            Log::info('ผลการอัปโหลด', [
                'file_path' => $filePath,
                'full_storage_path' => storage_path('app/public/' . $filePath),
                'file_exists' => file_exists(storage_path('app/public/' . $filePath)),
                'storage_disk_exists' => Storage::disk('public')->exists($filePath)
            ]);

            // สร้างเอกสาร
            $document = Document::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'document_type_id' => $validated['document_type_id'],
                'file_path' => $filePath,
                'current_file_path' => $filePath,
                'user_id' => Auth::id(),
                'status' => 'pending_deputy_director_1',
                'current_step' => 1,
            ]);

            // เริ่ม workflow
            $this->workflowService->startDocumentWorkflow($document);

            return redirect()->route('documents.index')
                ->with('success', 'เอกสารถูกสร้างและส่งเข้าสู่กระบวนการอนุมัติเรียบร้อยแล้ว');
        } catch (\Exception $e) {
            Log::error('สร้างเอกสารล้มเหลว', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return back()->withErrors(['error' => 'เกิดข้อผิดพลาดในการสร้างเอกสาร: ' . $e->getMessage()]);
        }
    }

    /**
     * แสดงรายละเอียดเอกสาร
     */
    public function show(Document $document): Response
    {
        $document->load(['documentType', 'user', 'signers.user', 'viewers']);

        // ตรวจสอบสิทธิ์การเข้าถึง
        if (!$this->canUserAccessDocument($document)) {
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงเอกสารนี้');
        }

        $workflowStep = $this->workflowService->getCurrentWorkflowStep($document);
        $canSign = $this->workflowService->canUserSign($document, Auth::user());

        // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
        $fileUrl = null;
        if ($document->current_file_path && Storage::disk('public')->exists($document->current_file_path)) {
            $fileUrl = Storage::url($document->current_file_path);
        }

        // Debug logging to help identify data issues
        Log::info('Document show data', [
            'document_id' => $document->id,
            'has_document_type' => !is_null($document->documentType),
            'has_user' => !is_null($document->user),
            'signers_count' => $document->signers->count(),
        ]);

        return Inertia::render('documents/show', [
            'document' => $document,
            'canSign' => $canSign,
            'fileUrl' => $fileUrl,
        ]);
    }

    /**
     * แสดงหน้ากระจายเอกสาร (Phase 4)
     */
    public function showDistribution(Document $document): Response
    {
        // ตรวจสอบสิทธิ์ - เฉพาะผู้สร้างเอกสารและเมื่อสถานะถูกต้อง
        if ($document->user_id !== Auth::id() || $document->status !== 'pending_distribution') {
            abort(403, 'คุณไม่มีสิทธิ์กระจายเอกสารนี้');
        }

        return Inertia::render('documents/distribute', [
            'document' => $document->load(['documentType', 'signers.user']),
            'departments' => Department::with('users')->get(),
            'users' => User::with(['department', 'position'])->where('is_active', true)->get(),
        ]);
    }

    /**
     * ดำเนินการกระจายเอกสาร (Phase 4)
     */
    public function distributeDocument(Request $request, Document $document)
    {
        $validated = $request->validate([
            'recipient_ids' => 'required|array|min:1',
            'recipient_ids.*' => 'exists:users,id',
        ]);

        try {
            $this->workflowService->distributeDocument($document, $validated['recipient_ids']);

            return redirect()->route('documents.index')
                ->with('success', 'กระจายเอกสารเรียบร้อยแล้ว');
        } catch (\Exception $e) {
            Log::error('กระจายเอกสารล้มเหลว', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'เกิดข้อผิดพลาดในการกระจายเอกสาร: ' . $e->getMessage()]);
        }
    }

    /**
     * แสดงหน้าจัดการตราประทับ (Phase 5)
     */
    public function showStampManagement(Document $document): Response
    {
        // ตรวจสอบสิทธิ์ - เฉพาะผู้ที่ได้รับมอบหมายและสถานะถูกต้อง
        if (!$document->viewers->contains(Auth::id()) || $document->status !== 'pending_stamp') {
            abort(403, 'คุณไม่มีสิทธิ์จัดการเอกสารนี้');
        }

        $deputyDirectors = FixedSigner::where('position_type', 'deputy_director')
            ->where('is_active', true)
            ->with('user')
            ->orderBy('priority_order')
            ->get();

        return Inertia::render('documents/manage-stamps', [
            'document' => $document->load(['documentType', 'user']),
            'deputyDirectors' => $deputyDirectors,
            'stamps' => \App\Models\Stamp::where('is_active', true)->get(),
            'fileUrl' => Storage::url($document->current_file_path),
        ]);
    }

    /**
     * บันทึกตราประทับและเลือกผู้ลงนาม (Phase 5)
     */
    public function saveStampAndSigner(Request $request, Document $document)
    {
        $validated = $request->validate([
            'selected_signer_id' => 'required|exists:users,id',
            'stamps' => 'array',
            'stamps.*.stamp_id' => 'exists:stamps,id',
            'stamps.*.position_data' => 'required|array',
            'stamps.*.page_number' => 'integer|min:1',
        ]);

        try {
            $this->workflowService->processStampAndSelectSigner(
                $document,
                Auth::user(),
                $validated['selected_signer_id'],
                $validated['stamps'] ?? []
            );

            return redirect()->route('documents.index')
                ->with('success', 'จัดการตราและส่งให้ผู้ลงนามเรียบร้อยแล้ว');
        } catch (\Exception $e) {
            Log::error('จัดการตราและเลือกผู้ลงนามล้มเหลว', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()]);
        }
    }

    /**
     * แสดงหน้าตรวจสอบสุดท้าย (Phase 7)
     */
    public function showFinalReview(Document $document): Response
    {
        // ตรวจสอบสิทธิ์
        if (!$document->viewers->contains(Auth::id()) || $document->status !== 'pending_final_review') {
            abort(403, 'คุณไม่มีสิทธิ์ตรวจสอบเอกสารนี้');
        }

        return Inertia::render('documents/final-review', [
            'document' => $document->load(['documentType', 'user', 'signers.user']),
            'users' => User::with(['department', 'position'])->where('is_active', true)->get(),
            'departments' => Department::with('users')->get(),
            'fileUrl' => Storage::url($document->current_file_path),
        ]);
    }

    /**
     * เสร็จสิ้นกระบวนการ (Phase 7)
     */
    public function completeDocument(Request $request, Document $document)
    {
        $validated = $request->validate([
            'is_public' => 'boolean',
            'final_viewer_ids' => 'array',
            'final_viewer_ids.*' => 'exists:users,id',
        ]);

        try {
            $this->workflowService->completeDocument(
                $document,
                $validated['is_public'] ?? false,
                $validated['final_viewer_ids'] ?? []
            );

            return redirect()->route('documents.index')
                ->with('success', 'เอกสารผ่านกระบวนการทั้งหมดเรียบร้อยแล้ว');
        } catch (\Exception $e) {
            Log::error('เสร็จสิ้นกระบวนการล้มเหลว', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()]);
        }
    }

    /**
     * แสดงเอกสารสาธารณะ
     */
    public function publicIndex(Request $request): Response
    {
        $search = $request->input('search');
        $type = $request->input('document_type');

        $documents = Document::with(['documentType', 'user'])
            ->where('is_public', true)
            ->where('status', 'completed')
            ->when($search, function ($query, $search) {
                return $query->where('title', 'like', "%{$search}%");
            })
            ->when($type, function ($query, $type) {
                return $query->where('document_type_id', $type);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('documents/public', [
            'documents' => $documents,
            'documentTypes' => DocumentType::all(),
            'filters' => [
                'search' => $search,
                'document_type' => $type,
            ],
        ]);
    }

    /**
     * แก้ไขเอกสาร (เฉพาะก่อนเข้าสู่กระบวนการ)
     */
    public function edit(Document $document): Response
    {
        // ตรวจสอบสิทธิ์ - เฉพาะผู้สร้างและยังไม่เริ่มกระบวนการ
        if ($document->user_id !== Auth::id() || $document->status !== 'draft') {
            abort(403, 'ไม่สามารถแก้ไขเอกสารนี้ได้');
        }

        return Inertia::render('documents/edit', [
            'document' => $document,
            'documentTypes' => DocumentType::all(),
        ]);
    }

    /**
     * อัปเดตเอกสาร
     */
    public function update(Request $request, Document $document)
    {
        // ตรวจสอบสิทธิ์
        if ($document->user_id !== Auth::id() || $document->status !== 'draft') {
            abort(403, 'ไม่สามารถแก้ไขเอกสารนี้ได้');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'document_type_id' => 'required|exists:document_types,id',
            'file' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        try {
            // อัปเดตไฟล์ถ้ามีการอัปโหลดใหม่
            if ($request->hasFile('file')) {
                // ลบไฟล์เก่า
                if (Storage::disk('public')->exists($document->file_path)) {
                    Storage::disk('public')->delete($document->file_path);
                }

                // อัปโหลดไฟล์ใหม่
                $file = $request->file('file');
                $dateFolderName = 'documents/' . date('Y/m');
                $fileName = uniqid() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs($dateFolderName, $fileName, 'public');

                $validated['file_path'] = $filePath;
                $validated['current_file_path'] = $filePath;
            }

            $document->update($validated);

            return redirect()->route('documents.show', $document)
                ->with('success', 'แก้ไขเอกสารเรียบร้อยแล้ว');
        } catch (\Exception $e) {
            Log::error('แก้ไขเอกสารล้มเหลว', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'เกิดข้อผิดพลาดในการแก้ไขเอกสาร']);
        }
    }

    /**
     * ลบเอกสาร
     */
    public function destroy(Document $document)
    {
        // ตรวจสอบสิทธิ์ - เฉพาะแอดมินหรือผู้สร้างเอกสาร (และยังไม่เริ่มกระบวนการ)
        if (
            Auth::user()->role?->name !== 'แอดมิน' &&
            ($document->user_id !== Auth::id() || $document->status !== 'draft')
        ) {
            abort(403, 'ไม่สามารถลบเอกสารนี้ได้');
        }

        try {
            // ลบไฟล์
            if (Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }
            if (
                $document->current_file_path !== $document->file_path &&
                Storage::disk('public')->exists($document->current_file_path)
            ) {
                Storage::disk('public')->delete($document->current_file_path);
            }

            $document->delete();

            return redirect()->route('documents.index')
                ->with('success', 'ลบเอกสารเรียบร้อยแล้ว');
        } catch (\Exception $e) {
            Log::error('ลบเอกสารล้มเหลว', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'เกิดข้อผิดพลาดในการลบเอกสาร']);
        }
    }

    /**
     * ตรวจสอบสิทธิ์การเข้าถึงเอกสาร
     */
    private function canUserAccessDocument(Document $document): bool
    {
        $user = Auth::user();

        // แอดมินเข้าถึงได้ทุกเอกสาร
        if ($user->role?->name === 'แอดมิน') {
            return true;
        }

        // ผู้สร้างเอกสาร
        if ($document->user_id === $user->id) {
            return true;
        }

        // เอกสารสาธารณะ
        if ($document->is_public && $document->status === 'completed') {
            return true;
        }

        // ผู้ที่ได้รับมอบหมายดูเอกสาร
        if ($document->viewers->contains($user->id)) {
            return true;
        }

        // ผู้ลงนาม
        if ($document->signers->contains('user_id', $user->id)) {
            return true;
        }

        return false;
    }

    /**
     * ดาวน์โหลดเอกสาร
     */
    public function download(Document $document)
    {
        $user = Auth::user();
        
        if (!$document->userCanAccess($user)) {
            abort(403, 'คุณไม่มีสิทธิ์ดาวน์โหลดเอกสารนี้');
        }

        $filePath = Storage::disk('public')->path($document->current_file_path);

        if (!file_exists($filePath)) {
            abort(404, 'ไม่พบไฟล์เอกสาร');
        }

        return response()->download($filePath, $document->title . '.pdf');
    }

    /**
     * ดูสถิติเอกสาร (สำหรับแอดมิน)
     */
    public function statistics(): Response
    {
        if (Auth::user()->role?->name !== 'แอดมิน') {
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงสถิติ');
        }

        $stats = [
            'total_documents' => Document::count(),
            'completed_documents' => Document::where('status', 'completed')->count(),
            'pending_documents' => Document::whereIn('status', [
                'pending_deputy_director_1',
                'pending_director',
                'pending_distribution',
                'pending_stamp',
                'pending_deputy_director_2',
                'pending_final_review'
            ])->count(),
            'rejected_documents' => Document::whereIn('status', [
                'rejected_by_deputy_1',
                'rejected_by_director',
                'rejected_by_deputy_2'
            ])->count(),
            'documents_by_type' => Document::with('documentType')
                ->get()
                ->groupBy('documentType.name')
                ->map->count(),
            'recent_activities' => Document::with(['user', 'documentType'])
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get(),
        ];

        return Inertia::render('documents/statistics', [
            'statistics' => $stats,
        ]);
    }
}
