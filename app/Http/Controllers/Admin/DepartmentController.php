<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $departments = Department::when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->withCount('users')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();
        
        return Inertia::render('admin/departments/index', [
            'departments' => $departments,
        ]);
    }

    /**
     * Show the form for creating a new department
     */
    public function create()
    {
        return Inertia::render('admin/departments/create');
    }

    /**
     * Store a newly created department
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments',
            'description' => 'nullable|string|max:1000',
        ]);

        Department::create($validated);

        return redirect()->route('admin.departments.index')
            ->with('message', 'แผนกถูกสร้างเรียบร้อยแล้ว');
    }

    /**
     * Display the specified department
     */
    public function show(Department $department)
    {
        $department->load(['users']);
        
        return Inertia::render('admin/departments/show', [
            'department' => $department,
        ]);
    }

    /**
     * Show the form for editing the specified department
     */
    public function edit(Department $department)
    {
        return Inertia::render('admin/departments/edit', [
            'department' => $department,
        ]);
    }

    /**
     * Update the specified department
     */
    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('departments')->ignore($department->id)],
            'description' => 'nullable|string|max:1000',
        ]);

        $department->update($validated);

        return redirect()->route('admin.departments.index')
            ->with('message', 'แผนกถูกอัปเดตเรียบร้อยแล้ว');
    }

    /**
     * Remove the specified department
     */
    public function destroy(Department $department)
    {
        // Check if department has users before deleting
        if ($department->users()->count() > 0) {
            return redirect()->route('admin.departments.index')
                ->with('error', 'ไม่สามารถลบแผนกได้เนื่องจากมีผู้ใช้งานอยู่ในแผนกนี้');
        }
        
        $department->delete();

        return redirect()->route('admin.departments.index')
            ->with('message', 'แผนกถูกลบเรียบร้อยแล้ว');
    }
} 