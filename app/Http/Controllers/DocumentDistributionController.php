<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentSigner;
use App\Models\User;
use App\Models\Department;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DocumentDistributionController extends Controller
{
    /**
     * แสดงหน้าเลือกผู้รับเอกสาร
     */
    public function show(Document $document)
    {
        // ตรวจสอบสิทธิ์การเข้าถึง (เฉพาะสารบัญหรือเจ้าของเอกสาร)
        $currentUser = User::with('role')->find(Auth::id());
        if ($document->user_id !== Auth::id() && !in_array($currentUser->role?->name, ['admin', 'สารบัญ'])) {
            abort(403, 'ไม่มีสิทธิ์เข้าถึงเอกสารนี้');
        }

        // ตรวจสอบสถานะเอกสาร
        if ($document->status !== 'pending_distribution') {
            return redirect()->route('documents.index')
                ->with('error', 'เอกสารนี้ไม่อยู่ในสถานะที่สามารถกระจายได้');
        }

        // ดึงข้อมูลแผนกและผู้ใช้
        $departments = Department::orderBy('name')->get();
        $users = User::with(['department', 'position', 'role'])
            ->whereHas('role', function ($query) {
                $query->whereIn('name', ['ครู', 'user', 'manager']); // ใช้ role relationship แทน roles
            })
            ->where('is_active', true)
            ->orderBy('fname')
            ->orderBy('lname')
            ->get();

        return Inertia::render('documents/distribute', [
            'document' => $document->load(['documentType', 'user'])->toArray(),
            'departments' => $departments,
            'users' => $users
        ]);
    }

    /**
     * บันทึกการกระจายเอกสาร
     */
    public function store(Request $request, Document $document)
    {
        // Debug: Log received data
        Log::info('=== DOCUMENT DISTRIBUTION STORE ===');
        Log::info('Document ID: ' . $document->id);
        Log::info('Request data: ', $request->all());
        Log::info('User IDs: ', $request->get('user_ids', []));
        Log::info('Document status: ' . $document->status);
        Log::info('Current user ID: ' . Auth::id());

        try {
            // Validate input
            $validatedData = $request->validate([
                'user_ids' => 'required|array|min:1',
                'user_ids.*' => 'exists:users,id'
            ]);
            Log::info('Validation passed');
        } catch (\Exception $validationError) {
            Log::error('Validation failed: ' . $validationError->getMessage());
            throw $validationError;
        }

        // ตรวจสอบสิทธิ์การเข้าถึง
        $currentUser = User::with('role')->find(Auth::id());
        if ($document->user_id !== Auth::id() && !in_array($currentUser->role?->name, ['admin', 'สารบัญ'])) {
            abort(403, 'ไม่มีสิทธิ์เข้าถึงเอกสารนี้');
        }

        // ตรวจสอบสถานะเอกสาร
        if ($document->status !== 'pending_distribution') {
            return back()->withErrors([
                'general' => 'เอกสารนี้ไม่อยู่ในสถานะที่สามารถกระจายได้'
            ]);
        }

        try {
            DB::beginTransaction();

            // สร้าง DocumentSigner สำหรับผู้รับเอกสารแต่ละคน
            $userIds = $request->user_ids;
            foreach ($userIds as $userId) {
                DocumentSigner::create([
                    'document_id' => $document->id,
                    'user_id' => $userId,
                    'step' => 4, // Step 4: Stamp Management
                    'signer_type' => 'operational_phase', // ใช้ค่าที่ถูกต้องจาก ENUM
                    'status' => 'waiting' // ใช้ค่าที่ถูกต้องจาก ENUM
                ]);
            }

            // อัพเดทสถานะเอกสาร
            $document->update([
                'status' => 'pending_stamp',
                'current_step' => 4
            ]);

            // ส่งการแจ้งเตือน
            $recipients = User::whereIn('id', $userIds)->get();
            foreach ($recipients as $recipient) {
                Notification::create([
                    'user_id' => $recipient->id,
                    'title' => 'ได้รับเอกสารใหม่สำหรับจัดการตราประทับ',
                    'message' => "คุณได้รับเอกสาร \"{$document->title}\" สำหรับการจัดการตราประทับและเลือกผู้ลงนามขั้นสุดท้าย",
                    'type' => 'document_pending',
                    'data' => [
                        'document_id' => $document->id,
                        'document_title' => $document->title,
                        'action_required' => 'stamp_management'
                    ]
                ]);
            }

            DB::commit();

            Log::info('Document distributed successfully to ' . $recipients->count() . ' users');

            return redirect()->route('documents.index')
                ->with('success', "กระจายเอกสารให้ {$recipients->count()} คนเรียบร้อยแล้ว");

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error distributing document: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return back()->withErrors([
                'general' => 'เกิดข้อผิดพลาดในการกระจายเอกสาร: ' . $e->getMessage()
            ]);
        }
    }
}
