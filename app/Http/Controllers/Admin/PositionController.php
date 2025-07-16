<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PositionController extends Controller
{
    public function index(Request $request)
    {
        $positions = Position::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->withCount('users')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/positions/index', [
            'positions' => $positions
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/positions/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:positions',
            'description' => 'nullable|string|max:500',
        ]);

        Position::create($validated);

        return redirect()->route('admin.positions.index')
            ->with('success', 'ตำแหน่งถูกสร้างเรียบร้อยแล้ว');
    }

    public function show(Position $position)
    {
        $position->load(['users']);
        
        return Inertia::render('admin/positions/show', [
            'position' => $position
        ]);
    }

    public function edit(Position $position)
    {
        return Inertia::render('admin/positions/edit', [
            'position' => $position
        ]);
    }

    public function update(Request $request, Position $position)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:positions,name,' . $position->id,
            'description' => 'nullable|string|max:500',
        ]);

        $position->update($validated);

        return redirect()->route('admin.positions.index')
            ->with('success', 'ตำแหน่งถูกแก้ไขเรียบร้อยแล้ว');
    }

    public function destroy(Position $position)
    {
        if ($position->users()->exists()) {
            return redirect()->route('admin.positions.index')
                ->with('error', 'ไม่สามารถลบตำแหน่งได้เนื่องจากมีผู้ใช้งานอยู่ในตำแหน่งนี้');
        }
        
        $position->delete();

        return redirect()->route('admin.positions.index')
            ->with('success', 'ตำแหน่งถูกลบเรียบร้อยแล้ว');
    }
} 