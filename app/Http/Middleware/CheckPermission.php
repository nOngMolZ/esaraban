<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        
        // ตรวจสอบว่าผู้ใช้มี role หรือไม่
        if (!$user->role) {
            abort(403, 'ไม่มีสิทธิ์เข้าถึง');
        }

        // ตรวจสอบว่า role มี permission ที่ต้องการหรือไม่
        $hasPermission = $user->role->permissions()
            ->where('slug', $permission)
            ->exists();

        if (!$hasPermission) {
            abort(403, 'ไม่มีสิทธิ์ในการดำเนินการนี้');
        }

        return $next($request);
    }
} 