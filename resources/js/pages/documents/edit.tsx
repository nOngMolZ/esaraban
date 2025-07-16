import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, FileText, AlertCircle, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface DocumentType {
    id: number;
    name: string;
    description?: string;
}

interface Document {
    id: number;
    title: string;
    description?: string;
    document_type_id: number;
    file_path: string;
    current_file_path: string;
    status: string;
    document_type: DocumentType;
}

interface Props {
    document: Document;
    documentTypes: DocumentType[];
}

export default function EditDocument({ document, documentTypes }: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        title: document.title,
        description: document.description || '',
        document_type_id: document.document_type_id.toString(),
        file: null as File | null,
        _method: 'PUT',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null);

        if (file) {
            // ตรวจสอบประเภทไฟล์
            if (file.type !== 'application/pdf') {
                setFileError('กรุณาเลือกไฟล์ PDF เท่านั้น');
                setSelectedFile(null);
                return;
            }

            // ตรวจสอบขนาดไฟล์ (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setFileError('ขนาดไฟล์ต้องไม่เกิน 10MB');
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
            setData('file', file);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setData('file', null);
        setFileError(null);
        
        // Reset file input
        const fileInput = document.getElementById('file') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('documents.update', document.id), {
            onSuccess: () => {
                router.visit(route('documents.show', document.id));
            },
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit(route('documents.show', document.id))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับ
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            แก้ไขเอกสาร
                        </h2>
                        <p className="text-sm text-gray-600">
                            {document.title}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`แก้ไขเอกสาร - ${document.title}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                แก้ไขข้อมูลเอกสาร
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* แสดงข้อผิดพลาดทั่วไป */}
                                {errors.error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="w-4 h-4" />
                                        <AlertDescription>{errors.error}</AlertDescription>
                                    </Alert>
                                )}

                                {/* คำเตือนเกี่ยวกับการแก้ไข */}
                                <Alert>
                                    <AlertCircle className="w-4 h-4" />
                                    <AlertDescription>
                                        <strong>หมายเหตุ:</strong> คุณสามารถแก้ไขเอกสารได้เฉพาะเมื่อยังไม่เริ่มกระบวนการอนุมัติ 
                                        หากต้องการเปลี่ยนไฟล์ PDF ให้เลือกไฟล์ใหม่ ถ้าไม่เลือกไฟล์ใหม่ระบบจะใช้ไฟล์เดิม
                                    </AlertDescription>
                                </Alert>

                                {/* ข้อมูลพื้นฐาน */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">
                                            ชื่อเอกสาร <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="ระบุชื่อเอกสาร"
                                            className={errors.title ? 'border-red-500' : ''}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-500">{errors.title}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="document_type_id">
                                            ประเภทเอกสาร <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.document_type_id}
                                            onValueChange={(value) => setData('document_type_id', value)}
                                        >
                                            <SelectTrigger className={errors.document_type_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="เลือกประเภทเอกสาร" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {documentTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.document_type_id && (
                                            <p className="text-sm text-red-500">{errors.document_type_id}</p>
                                        )}
                                    </div>
                                </div>

                                {/* คำอธิบาย */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">คำอธิบาย</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="ระบุคำอธิบายเพิ่มเติม (ไม่บังคับ)"
                                        rows={4}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                {/* ไฟล์ปัจจุบัน */}
                                <div className="space-y-4">
                                    <Label>ไฟล์เอกสารปัจจุบัน</Label>
                                    <div className="p-4 bg-gray-50 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-8 h-8 text-blue-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {document.title}.pdf
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        ไฟล์เอกสารปัจจุบัน
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.visit(route('documents.download', document.id))}
                                            >
                                                ดาวน์โหลด
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* อัปโหลดไฟล์ใหม่ */}
                                <div className="space-y-4">
                                    <Label htmlFor="file">
                                        ไฟล์เอกสารใหม่ (PDF) - ไม่บังคับ
                                    </Label>
                                    
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        {selectedFile ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center">
                                                    <FileText className="w-12 h-12 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatFileSize(selectedFile.size)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={clearFile}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        ลบไฟล์
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center">
                                                    <Upload className="w-12 h-12 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        เลือกไฟล์ PDF ใหม่
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        หรือลากและวางไฟล์ที่นี่ (ไม่เกิน 10MB)
                                                    </p>
                                                </div>
                                                <div>
                                                    <input
                                                        id="file"
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => document.getElementById('file')?.click()}
                                                    >
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        เลือกไฟล์ใหม่
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {fileError && (
                                        <p className="text-sm text-red-500 text-center">{fileError}</p>
                                    )}
                                    
                                    {errors.file && (
                                        <p className="text-sm text-red-500 text-center">{errors.file}</p>
                                    )}

                                    <p className="text-xs text-gray-500 text-center">
                                        หากไม่เลือกไฟล์ใหม่ ระบบจะใช้ไฟล์เดิม
                                    </p>
                                </div>

                                {/* ปุ่มดำเนินการ */}
                                <div className="flex justify-end gap-4 pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('documents.show', document.id))}
                                        disabled={processing}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 