<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * แสดงรายการการแจ้งเตือนทั้งหมด
     */
    public function index(Request $request): Response
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * ดึงการแจ้งเตือนล่าสุดสำหรับ notification bell
     */
    public function recent()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $unreadCount = Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว
     */
    public function markAsRead(Notification $notification)
    {
        // ตรวจสอบสิทธิ์
        if ($notification->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * ลบการแจ้งเตือน
     */
    public function destroy(Notification $notification)
    {
        // ตรวจสอบสิทธิ์
        if ($notification->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $notification->delete();

        return response()->json(['success' => true]);
    }

    /**
     * ลบการแจ้งเตือนทั้งหมด
     */
    public function destroyAll()
    {
        Notification::where('user_id', Auth::id())->delete();

        return response()->json(['success' => true]);
    }

    /**
     * ดึงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
     */
    public function getUnreadCount()
    {
        $count = Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }
} 