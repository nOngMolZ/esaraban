import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface DocumentType {
    id: number;
    name: string;
    description?: string;
}

interface Props {
    documentTypes: DocumentType[];
}

interface Errors {
    title?: string;
    description?: string;
    document_type_id?: string;
    file?: string;
    error?: string;
}

export default function CreateDocument({ documentTypes }: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        title: string;
        description: string;
        document_type_id: string;
        file: File | null;
    }>({
        title: '',
        description: '',
        document_type_id: '',
        file: null as File | null,
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            setFileError('กรุณาเลือกไฟล์ PDF');
            return;
        }

        console.log('Submitting form with data:', {
            title: data.title,
            description: data.description,
            document_type_id: data.document_type_id,
            file: selectedFile ? {
                name: selectedFile.name,
                size: selectedFile.size,
                type: selectedFile.type
            } : null
        });

        post(route('documents.store'), {
            onSuccess: () => {
                console.log('Form submitted successfully');
                reset();
                setSelectedFile(null);
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            }
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
                        onClick={() => router.visit(route('documents.index'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับ
                    </Button>
                    <h2 className="text-xl font-semibold text-gray-800">
                        เพิ่มเอกสารใหม่
                    </h2>
                </div>
            }
        >
            <Head title="เพิ่มเอกสารใหม่" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                เพิ่มเอกสารใหม่เข้าสู่ระบบสารบรรณ
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* แสดงข้อผิดพลาดทั่วไป */}
                                {(errors as any).error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="w-4 h-4" />
                                        <AlertDescription>{(errors as any).error}</AlertDescription>
                                    </Alert>
                                )}

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

                                {/* อัปโหลดไฟล์ */}
                                <div className="space-y-4">
                                    <Label htmlFor="file">
                                        ไฟล์เอกสาร (PDF) <span className="text-red-500">*</span>
                                    </Label>
                                    
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        {selectedFile ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center">
                                                    <FileText className="w-12 h-12 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatFileSize(selectedFile.size)}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setData('file', null);
                                                        setFileError(null);
                                                    }}
                                                >
                                                    เปลี่ยนไฟล์
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center">
                                                    <Upload className="w-12 h-12 text-gray-400" />
                                                </div>
                                                <div>
                                                    <Label
                                                        htmlFor="file"
                                                        className="cursor-pointer text-blue-600 hover:text-blue-500"
                                                    >
                                                        คลิกเพื่อเลือกไฟล์ PDF
                                                    </Label>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        หรือลากไฟล์มาวางที่นี่
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        ไฟล์ PDF เท่านั้น ขนาดไม่เกิน 10MB
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <input
                                            id="file"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {fileError && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="w-4 h-4" />
                                            <AlertDescription>{fileError}</AlertDescription>
                                        </Alert>
                                    )}

                                    {errors.file && (
                                        <p className="text-sm text-red-500">{errors.file}</p>
                                    )}
                                </div>

                                {/* คำแนะนำ */}
                                <Alert>
                                    <AlertCircle className="w-4 h-4" />
                                    <AlertDescription>
                                        <strong>หมายเหตุ:</strong> เมื่อกดปุ่ม "ยืนยันเริ่มกระบวนการ" เอกสารจะถูกส่งเข้าสู่กระบวนการอนุมัติ
                                        และไม่สามารถแก้ไขได้ กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนดำเนินการ
                                    </AlertDescription>
                                </Alert>

                                {/* ปุ่มดำเนินการ */}
                                <div className="flex justify-end gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('documents.index'))}
                                        disabled={processing}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || !selectedFile}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {processing ? 'กำลังสร้าง...' : 'ยืนยันเริ่มกระบวนการ'}
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