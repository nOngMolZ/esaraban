<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stamp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StampController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Stamp::query();

        // ค้นหา
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // กรองตามหมวดหมู่
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $stamps = $query->orderBy('category')
            ->orderBy('name')
            ->paginate(20)
            ->appends($request->only(['search', 'category']));

        // เพิ่ม preview_url
        $stamps->getCollection()->transform(function ($stamp) {
            $stamp->preview_url = Storage::url($stamp->file_path);
            return $stamp;
        });

        // ดึงหมวดหมู่ที่มีอยู่
        $categories = Stamp::select('category')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        return Inertia::render('admin/stamps', [
            'stamps' => $stamps,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'category' => 'required|string|max:100',
            'file' => 'required|image|mimes:png,jpg,jpeg|max:5120' // 5MB
        ]);

        try {
            // อัปโหลดไฟล์
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('stamps', $fileName, 'public');

            // สร้างตราประทับใหม่
            Stamp::create([
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
                'file_path' => $filePath,
                'is_active' => true
            ]);

            return redirect()->route('admin.stamps.index')
                ->with('success', 'เพิ่มตราประทับเรียบร้อยแล้ว');

        } catch (\Exception $e) {
            return back()->withErrors([
                'general' => 'เกิดข้อผิดพลาดในการอัปโหลด: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Stamp $stamp)
    {
        $stamp->preview_url = Storage::url($stamp->file_path);
        
        return response()->json($stamp);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Stamp $stamp)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'category' => 'required|string|max:100',
            'file' => 'nullable|image|mimes:png,jpg,jpeg|max:5120' // 5MB
        ]);

        try {
            $updateData = [
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
            ];

            // หากมีไฟล์ใหม่
            if ($request->hasFile('file')) {
                // ลบไฟล์เก่า
                if ($stamp->file_path && Storage::disk('public')->exists($stamp->file_path)) {
                    Storage::disk('public')->delete($stamp->file_path);
                }

                // อัปโหลดไฟล์ใหม่
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('stamps', $fileName, 'public');
                
                $updateData['file_path'] = $filePath;
            }

            $stamp->update($updateData);

            return redirect()->route('admin.stamps.index')
                ->with('success', 'แก้ไขตราประทับเรียบร้อยแล้ว');

        } catch (\Exception $e) {
            return back()->withErrors([
                'general' => 'เกิดข้อผิดพลาดในการแก้ไข: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stamp $stamp)
    {
        try {
            // ตรวจสอบว่ามีการใช้งานอยู่หรือไม่
            $inUse = $stamp->documentStamps()->count() > 0;
            
            if ($inUse) {
                return back()->withErrors([
                    'general' => 'ไม่สามารถลบตราประทับนี้ได้ เนื่องจากมีการใช้งานในเอกสารแล้ว'
                ]);
            }

            // ลบไฟล์
            if ($stamp->file_path && Storage::disk('public')->exists($stamp->file_path)) {
                Storage::disk('public')->delete($stamp->file_path);
            }

            // ลบข้อมูลจากฐานข้อมูล
            $stamp->delete();

            return redirect()->route('admin.stamps.index')
                ->with('success', 'ลบตราประทับเรียบร้อยแล้ว');

        } catch (\Exception $e) {
            return back()->withErrors([
                'general' => 'เกิดข้อผิดพลาดในการลบ: ' . $e->getMessage()
            ]);
        }
    }
}
