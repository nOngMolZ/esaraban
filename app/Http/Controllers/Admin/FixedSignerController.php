<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FixedSigner;
use App\Models\User;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FixedSignerController extends Controller
{
    /**
     * แสดงรายการผู้ลงนามคงที่
     */
    public function index(): Response
    {
        $fixedSigners = FixedSigner::with(['user.position', 'user.department'])
            ->orderBy('position_type')
            ->orderBy('priority_order')
            ->get()
            ->groupBy('position_type');

        $availableUsers = User::with(['position', 'department'])
            ->whereHas('position', function ($query) {
                $query->whereIn('name', ['ผู้อำนวยการ', 'รองผู้อำนวยการ']);
            })
            ->where('is_active', true)
            ->get();

        return Inertia::render('admin/fixed-signers', [
            'fixedSigners' => $fixedSigners,
            'availableUsers' => $availableUsers,
        ]);
    }

    /**
     * เพิ่มผู้ลงนามคงที่
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'position_type' => 'required|in:deputy_director,director',
            'priority_order' => 'required|integer|min:1',
        ]);

        // ตรวจสอบว่าผู้ใช้นี้ยังไม่เป็นผู้ลงนามคงที่อยู่แล้ว
        $existing = FixedSigner::where('user_id', $validated['user_id'])
            ->where('position_type', $validated['position_type'])
            ->first();

        if ($existing) {
            return back()->withErrors(['user_id' => 'ผู้ใช้นี้เป็นผู้ลงนามคงที่อยู่แล้ว']);
        }

        FixedSigner::create($validated);

        return back()->with('success', 'เพิ่มผู้ลงนามคงที่เรียบร้อยแล้ว');
    }

    /**
     * อัพเดทลำดับความสำคัญ
     */
    public function updatePriority(Request $request, FixedSigner $fixedSigner)
    {
        $validated = $request->validate([
            'priority_order' => 'required|integer|min:1',
        ]);

        $fixedSigner->update($validated);

        return back()->with('success', 'อัพเดทลำดับความสำคัญเรียบร้อยแล้ว');
    }

    /**
     * เปิด/ปิดการใช้งาน
     */
    public function toggleActive(FixedSigner $fixedSigner)
    {
        $fixedSigner->update(['is_active' => !$fixedSigner->is_active]);

        $status = $fixedSigner->is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน';
        return back()->with('success', $status . 'ผู้ลงนามคงที่เรียบร้อยแล้ว');
    }

    /**
     * ลบผู้ลงนามคงที่
     */
    public function destroy(FixedSigner $fixedSigner)
    {
        $fixedSigner->delete();

        return back()->with('success', 'ลบผู้ลงนามคงที่เรียบร้อยแล้ว');
    }
} 