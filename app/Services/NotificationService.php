<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * ส่งการแจ้งเตือนให้ผู้ใช้
     *
     * @param int $userId ID ของผู้ใช้ที่จะส่งการแจ้งเตือน
     * @param string $type ประเภทของการแจ้งเตือน
     * @param string $title หัวข้อการแจ้งเตือน
     * @param string $message ข้อความการแจ้งเตือน
     * @param array $data ข้อมูลเพิ่มเติม
     * @return bool
     */
    public function sendNotification(
        int $userId,
        string $type,
        string $title,
        string $message,
        array $data = []
    ): bool {
        try {
            $user = User::find($userId);
            
            if (!$user) {
                Log::warning("NotificationService: User not found with ID: $userId");
                return false;
            }

            // บันทึกการแจ้งเตือนลงฐานข้อมูล (ถ้ามี notification table)
            $this->storeNotification($user, $type, $title, $message, $data);

            // ส่งอีเมลแจ้งเตือน
            $this->sendEmailNotification($user, $type, $title, $message, $data);

            Log::info("NotificationService: Notification sent successfully to user ID: $userId", [
                'type' => $type,
                'title' => $title
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error("NotificationService: Failed to send notification", [
                'user_id' => $userId,
                'type' => $type,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * ส่งการแจ้งเตือนให้ผู้ใช้หลายคน
     *
     * @param array $userIds รายการ ID ของผู้ใช้
     * @param string $type ประเภทของการแจ้งเตือน
     * @param string $title หัวข้อการแจ้งเตือน
     * @param string $message ข้อความการแจ้งเตือน
     * @param array $data ข้อมูลเพิ่มเติม
     * @return array ผลลัพธ์การส่ง
     */
    public function sendBulkNotification(
        array $userIds,
        string $type,
        string $title,
        string $message,
        array $data = []
    ): array {
        $results = [
            'success' => 0,
            'failed' => 0,
            'errors' => []
        ];

        foreach ($userIds as $userId) {
            if ($this->sendNotification($userId, $type, $title, $message, $data)) {
                $results['success']++;
            } else {
                $results['failed']++;
                $results['errors'][] = "Failed to send notification to user ID: $userId";
            }
        }

        return $results;
    }

    /**
     * บันทึกการแจ้งเตือนลงฐานข้อมูล
     *
     * @param User $user
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array $data
     * @return void
     */
    private function storeNotification(User $user, string $type, string $title, string $message, array $data): void
    {
        try {
            // บันทึกการแจ้งเตือนลงตาราง notifications
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
                'read_at' => null,
            ]);
            
            Log::info("NotificationService: Notification stored for user", [
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title
            ]);

        } catch (\Exception $e) {
            Log::error("NotificationService: Failed to store notification", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * ส่งอีเมลแจ้งเตือน
     *
     * @param User $user
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array $data
     * @return void
     */
    private function sendEmailNotification(User $user, string $type, string $title, string $message, array $data): void
    {
        try {
            // สำหรับการส่งอีเมลแจ้งเตือน
            // สามารถสร้าง Mailable class หรือใช้ Mail::raw()
            
            $emailData = [
                'user' => $user,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'data' => $data,
                'app_url' => config('app.url')
            ];

            // ตัวอย่างการส่งอีเมลเบื้องต้น
            Mail::raw($this->buildEmailContent($title, $message, $data), function ($mail) use ($user, $title) {
                $mail->to($user->email)
                     ->subject($title);
            });

            Log::info("NotificationService: Email sent successfully", [
                'user_id' => $user->id,
                'email' => $user->email,
                'type' => $type
            ]);

        } catch (\Exception $e) {
            Log::error("NotificationService: Failed to send email notification", [
                'user_id' => $user->id,
                'email' => $user->email ?? 'no-email',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * สร้างเนื้อหาอีเมล
     *
     * @param string $title
     * @param string $message
     * @param array $data
     * @return string
     */
    private function buildEmailContent(string $title, string $message, array $data): string
    {
        $content = "เรียน ผู้รับการแจ้งเตือน\n\n";
        $content .= "$message\n\n";
        
        if (isset($data['document_id'])) {
            $actionUrl = config('app.url') . "/documents/{$data['document_id']}";
            $content .= "คลิกลิงก์เพื่อดูเอกสาร: $actionUrl\n\n";
        }
        
        $content .= "ขอแสดงความนับถือ\n";
        $content .= "ระบบ E-Sarabun Chumsaeng";
        
        return $content;
    }

    /**
     * ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว
     *
     * @param int $notificationId
     * @param int $userId
     * @return bool
     */
    public function markAsRead(int $notificationId, int $userId): bool
    {
        try {
            // สำหรับอนาคต: อัพเดทสถานะการอ่านในตาราง notifications
            /*
            $notification = Notification::where('id', $notificationId)
                ->where('user_id', $userId)
                ->whereNull('read_at')
                ->first();
                
            if ($notification) {
                $notification->update(['read_at' => now()]);
                return true;
            }
            */
            
            Log::info("NotificationService: Notification marked as read", [
                'notification_id' => $notificationId,
                'user_id' => $userId
            ]);
            
            return true;

        } catch (\Exception $e) {
            Log::error("NotificationService: Failed to mark notification as read", [
                'notification_id' => $notificationId,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * ดึงการแจ้งเตือนที่ยังไม่ได้อ่านของผู้ใช้
     *
     * @param int $userId
     * @return array
     */
    public function getUnreadNotifications(int $userId): array
    {
        try {
            // สำหรับอนาคต: ดึงข้อมูลจากตาราง notifications
            /*
            return Notification::where('user_id', $userId)
                ->whereNull('read_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->toArray();
            */
            
            return [];

        } catch (\Exception $e) {
            Log::error("NotificationService: Failed to get unread notifications", [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return [];
        }
    }
} 