<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentSigner;
use App\Models\FixedSigner;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WorkflowService
{
    /**
     * เริ่มต้นกระบวนการเอกสาร (Phase 1)
     */
    public function startDocumentWorkflow(Document $document): bool
    {
        try {
            DB::beginTransaction();

            // ค้นหารองผู้อำนวยการคนแรก
            $firstDeputyDirector = FixedSigner::where('position_type', 'deputy_director')
                ->where('is_active', true)
                ->orderBy('priority_order')
                ->first();

            if (!$firstDeputyDirector) {
                throw new \Exception('ไม่พบรองผู้อำนวยการในระบบ');
            }

            // สร้าง DocumentSigner สำหรับรองผู้อำนวยการ
            DocumentSigner::create([
                'document_id' => $document->id,
                'user_id' => $firstDeputyDirector->user_id,
                'step' => 1,
                'signer_type' => 'admin_phase',
                'status' => 'waiting',
            ]);

            // อัพเดตสถานะเอกสาร
            $document->update([
                'status' => 'pending_deputy_director_1',
                'current_step' => 1,
            ]);

            // ส่งการแจ้งเตือน
            $this->sendNotification(
                $firstDeputyDirector->user_id,
                'เอกสารรอลงนาม',
                "เอกสาร \"{$document->title}\" รออนุมัติและลงนามจากท่าน",
                'document_pending',
                ['document_id' => $document->id, 'step' => 1]
            );

            DB::commit();
            Log::info('เริ่มต้น workflow สำเร็จ', ['document_id' => $document->id]);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('เริ่มต้น workflow ล้มเหลว', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * ดำเนินการลงนาม (Phase 2, 3, 6)
     */
    public function processSignature(Document $document, User $signer, string $signatureData, string $action = 'approve', ?string $rejectionReason = null): bool
    {
        try {
            DB::beginTransaction();

            // ค้นหา DocumentSigner
            $documentSigner = DocumentSigner::where('document_id', $document->id)
                ->where('user_id', $signer->id)
                ->where('step', $document->current_step)
                ->where('status', 'waiting')
                ->first();

            if (!$documentSigner) {
                throw new \Exception('ไม่พบข้อมูลผู้ลงนามหรือได้ลงนามแล้ว');
            }

            if ($action === 'reject') {
                // กรณีปฏิเสธ
                $documentSigner->update([
                    'status' => 'rejected',
                    'rejection_reason' => $rejectionReason,
                ]);

                $rejectStatus = $this->getRejectStatus($document->status);
                $document->update(['status' => $rejectStatus]);

                // แจ้งผู้สร้างเอกสาร
                $this->sendNotification(
                    $document->user_id,
                    'เอกสารถูกปฏิเสธ',
                    "เอกสาร \"{$document->title}\" ถูกปฏิเสธโดย {$signer->fname} {$signer->lname}",
                    'document_rejected',
                    ['document_id' => $document->id, 'reason' => $rejectionReason]
                );
            } else {
                // กรณีอนุมัติ
                $documentSigner->update([
                    'status' => 'signed',
                    'signed_at' => now(),
                    'signature_data' => $signatureData,
                ]);

                // ดำเนินการขั้นตอนถัดไป
                $this->proceedToNextStep($document);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('ดำเนินการลงนามล้มเหลว', [
                'document_id' => $document->id,
                'signer_id' => $signer->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * ดำเนินการไปขั้นตอนถัดไป
     */
    private function proceedToNextStep(Document $document): void
    {
        switch ($document->status) {
            case 'pending_deputy_director_1':
                $this->moveToDirectorApproval($document);
                break;

            case 'pending_director':
                $this->moveToDistribution($document);
                break;

            case 'pending_deputy_director_2':
                $this->moveToFinalReview($document);
                break;

            default:
                throw new \Exception('สถานะเอกสารไม่ถูกต้อง');
        }
    }

    /**
     * ย้ายไปขั้นตอนอนุมัติผู้อำนวยการ (Phase 3)
     */
    private function moveToDirectorApproval(Document $document): void
    {
        $director = FixedSigner::where('position_type', 'director')
            ->where('is_active', true)
            ->orderBy('priority_order')
            ->first();

        if (!$director) {
            throw new \Exception('ไม่พบผู้อำนวยการในระบบ');
        }

        DocumentSigner::create([
            'document_id' => $document->id,
            'user_id' => $director->user_id,
            'step' => 2,
            'signer_type' => 'admin_phase',
            'status' => 'waiting',
        ]);

        $document->update([
            'status' => 'pending_director',
            'current_step' => 2,
        ]);

        $this->sendNotification(
            $director->user_id,
            'เอกสารรอลงนาม',
            "เอกสาร \"{$document->title}\" รออนุมัติและลงนามจากผู้อำนวยการ",
            'document_pending',
            ['document_id' => $document->id, 'step' => 2]
        );
    }

    /**
     * ย้ายไปขั้นตอนกระจายเอกสาร (Phase 4)
     */
    private function moveToDistribution(Document $document): void
    {
        $document->update([
            'status' => 'pending_distribution',
            'current_step' => 3,
        ]);

        // แจ้งเตือนสารบัญ (ผู้สร้างเอกสาร)
        $this->sendNotification(
            $document->user_id,
            'เอกสารพร้อมกระจาย',
            "เอกสาร \"{$document->title}\" ผ่านการอนุมัติแล้ว พร้อมสำหรับกระจายไปยังผู้รับผิดชอบ",
            'document_signed',
            ['document_id' => $document->id, 'step' => 3]
        );
    }

    /**
     * ย้ายไปขั้นตอนตรวจสอบสุดท้าย (Phase 7)
     */
    private function moveToFinalReview(Document $document): void
    {
        // ค้นหาผู้จัดการตราประทับ (ผู้ที่ทำขั้นตอนที่ 4 - operational_phase)
        $stampManager = DocumentSigner::where('document_id', $document->id)
            ->where('step', 4)
            ->where('signer_type', 'operational_phase')
            ->where('status', 'completed')
            ->first();

        if ($stampManager) {
            // ใช้ผู้จัดการตราประทับเป็นผู้ตรวจสอบขั้นสุดท้าย
            $reviewerId = $stampManager->user_id;
        } else {
            // Fallback: ใช้ viewer คนแรก หรือผู้สร้างเอกสาร
            $viewers = $document->viewers()->get();
            if ($viewers->isNotEmpty()) {
                $reviewerId = $viewers->first()->id;
            } else {
                $reviewerId = $document->user_id;
            }
        }

        $document->update([
            'status' => 'pending_final_review',
            'current_step' => 6, // ขั้นตอนที่ 6: ตรวจสอบขั้นสุดท้าย
        ]);

        $this->sendNotification(
            $reviewerId,
            'เอกสารพร้อมตรวจสอบ',
            "เอกสาร \"{$document->title}\" ลงนามครบถ้วนแล้ว รอการตรวจสอบและกำหนดสิทธิ์การเข้าถึงขั้นสุดท้าย",
            'document_signed',
            ['document_id' => $document->id, 'step' => 6]
        );
    }

    /**
     * กระจายเอกสารไปยังผู้รับผิดชอบ (Phase 4)
     */
    public function distributeDocument(Document $document, array $recipientIds): bool
    {
        try {
            DB::beginTransaction();

            // เพิ่มผู้รับเอกสารใน document_viewers
            foreach ($recipientIds as $userId) {
                $document->viewers()->attach($userId);
            }

            $document->update([
                'status' => 'pending_stamp',
                'current_step' => 4,
            ]);

            // แจ้งเตือนผู้รับทุกคน
            foreach ($recipientIds as $userId) {
                $this->sendNotification(
                    $userId,
                    'ได้รับเอกสารใหม่',
                    "ได้รับมอบหมายให้จัดการเอกสาร \"{$document->title}\"",
                    'document_pending',
                    ['document_id' => $document->id, 'step' => 4]
                );
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('กระจายเอกสารล้มเหลว', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * จัดการตราประทับและเลือกผู้ลงนาม (Phase 5)
     */
    public function processStampAndSelectSigner(Document $document, User $user, int $selectedSignerId, array $stampData = []): bool
    {
        try {
            DB::beginTransaction();

            // บันทึกข้อมูลตราประทับ (ถ้ามี)
            if (!empty($stampData)) {
                foreach ($stampData as $stamp) {
                    \App\Models\DocumentStamp::create([
                        'document_id' => $document->id,
                        'stamp_id' => $stamp['stamp_id'],
                        'user_id' => $user->id,
                        'position_data' => $stamp['position_data'],
                        'page_number' => $stamp['page_number'] ?? 1,
                    ]);
                }
            }

            // สร้าง DocumentSigner สำหรับรองผู้อำนวยการที่เลือก
            DocumentSigner::create([
                'document_id' => $document->id,
                'user_id' => $selectedSignerId,
                'step' => 5,
                'signer_type' => 'deputy_director_2',
                'status' => 'waiting',
            ]);

            $document->update([
                'status' => 'pending_deputy_director_2',
                'current_step' => 5,
            ]);

            // แจ้งเตือนรองผู้อำนวยการที่เลือก
            $selectedSigner = User::find($selectedSignerId);
            $this->sendNotification(
                $selectedSignerId,
                'เอกสารรอลงนาม',
                "เอกสาร \"{$document->title}\" รอการลงนามจากท่าน (ขั้นตอนสุดท้าย)",
                'document_pending',
                ['document_id' => $document->id, 'step' => 5]
            );

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('จัดการตราและเลือกผู้ลงนามล้มเหลว', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * เสร็จสิ้นกระบวนการ (Phase 7)
     */
    public function completeDocument(Document $document, bool $isPublic = false, array $finalViewerIds = []): bool
    {
        try {
            DB::beginTransaction();

            // เพิ่มผู้ดูเอกสารขั้นสุดท้าย
            if (!empty($finalViewerIds)) {
                foreach ($finalViewerIds as $userId) {
                    if (!$document->viewers->contains($userId)) {
                        $document->viewers()->attach($userId);
                    }
                }
            }

            $document->update([
                'status' => 'completed',
                'is_public' => $isPublic,
                'is_fully_signed' => true,
            ]);

            // แจ้งเตือนผู้ที่เกี่ยวข้องทั้งหมด
            $allRecipients = $finalViewerIds ?: $document->viewers()->pluck('user_id')->toArray();

            foreach ($allRecipients as $userId) {
                $this->sendNotification(
                    $userId,
                    'เอกสารเสร็จสิ้น',
                    "เอกสาร \"{$document->title}\" ผ่านกระบวนการทั้งหมดเรียบร้อยแล้ว",
                    'document_completed',
                    ['document_id' => $document->id]
                );
            }

            DB::commit();

            Log::info('เอกสารเสร็จสิ้นกระบวนการ', ['document_id' => $document->id]);
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('เสร็จสิ้นกระบวนการล้มเหลว', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * ส่งการแจ้งเตือน
     */
    private function sendNotification(int $userId, string $title, string $message, string $type, array $data = []): void
    {
        $notification = Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
        ]);

        // ส่งการแจ้งเตือนแบบ real-time
        try {
            broadcast(new \App\Events\DocumentNotification($notification))->toOthers();
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast notification', [
                'notification_id' => $notification->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * กำหนดสถานะการปฏิเสธ
     */
    private function getRejectStatus(string $currentStatus): string
    {
        return match ($currentStatus) {
            'pending_deputy_director_1' => 'rejected_by_deputy_1',
            'pending_director' => 'rejected_by_director',
            'pending_deputy_director_2' => 'rejected_by_deputy_2',
            default => 'rejected_by_deputy_1'
        };
    }

    /**
     * ตรวจสอบสิทธิ์ในการลงนาม
     */
    public function canUserSign(Document $document, User $user): bool
    {
        return DocumentSigner::where('document_id', $document->id)
            ->where('user_id', $user->id)
            ->where('step', $document->current_step)
            ->where('status', 'waiting')
            ->exists();
    }

    /**
     * ดึงข้อมูลขั้นตอนปัจจุบัน
     */
    public function getCurrentWorkflowStep(Document $document): array
    {
        $signer = DocumentSigner::where('document_id', $document->id)
            ->where('step', $document->current_step)
            ->where('status', 'waiting')
            ->with('user')
            ->first();

        return [
            'status' => $document->status,
            'step' => $document->current_step,
            'current_signer' => $signer?->user,
            'can_proceed' => !is_null($signer),
        ];
    }
}
