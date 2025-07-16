<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class DocumentTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = DocumentType::query()
            ->withCount('documents')
            ->orderBy('name');

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        $documentTypes = $query->paginate(10)
                            ->withQueryString();

        return Inertia::render('admin/document-types/index', [
            'documentTypes' => $documentTypes,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/document-types/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:document_types',
            'description' => 'nullable|string',
        ]);

        DocumentType::create($validated);

        return Redirect::route('admin.document-types.index')
            ->with('success', 'ประเภทเอกสารถูกสร้างเรียบร้อยแล้ว');
    }

    /**
     * Display the specified resource.
     */
    public function show(DocumentType $documentType)
    {
        $documentType->load(['documents' => function ($query) {
            $query->latest()->limit(5);
        }]);

        $documentType->loadCount('documents');

        return Inertia::render('admin/document-types/show', [
            'documentType' => $documentType,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DocumentType $documentType)
    {
        return Inertia::render('admin/document-types/edit', [
            'documentType' => $documentType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DocumentType $documentType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:document_types,name,' . $documentType->id,
            'description' => 'nullable|string',
        ]);

        $documentType->update($validated);

        return Redirect::route('admin.document-types.index')
            ->with('success', 'ประเภทเอกสารถูกอัปเดตเรียบร้อยแล้ว');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DocumentType $documentType)
    {
        // Check if this document type is in use
        if ($documentType->documents()->count() > 0) {
            return Redirect::route('admin.document-types.index')
                ->with('error', 'ไม่สามารถลบประเภทเอกสารได้เนื่องจากมีเอกสารที่ใช้ประเภทนี้อยู่');
        }

        $documentType->delete();

        return Redirect::route('admin.document-types.index')
            ->with('success', 'ประเภทเอกสารถูกลบเรียบร้อยแล้ว');
    }
} 