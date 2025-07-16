import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Save,
    ArrowLeft,
    AlertCircle,
    Clock,
    Stamp,
    Users,
    FileText,
    CheckCircle
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import WorkflowStatusIndicator from '@/components/WorkflowStatusIndicator';
import StampViewer from '@/components/StampViewer';

interface DocumentType {
    id: number;
    name: string;
    description?: string;
}

interface User {
    id: number;
    fname: string;
    lname: string;
    email: string;
    position?: {
        name: string;
    };
}

interface Document {
    id: number;
    title: string;
    description?: string;
    status: string;
    current_step: number;
    created_at: string;
    document_type: DocumentType;
    user: User;
}

interface AvailableStamp {
    id: number;
    name: string;
    file_path: string;
    category: string;
    preview_url: string;
}

interface DeputyDirector {
    id: number;
    fname: string;
    lname: string;
    email: string;
    priority: number;
}

interface Props {
    document: Document;
    availableStamps: AvailableStamp[];
    deputyDirectors: DeputyDirector[];
    fileUrl: string;
}

interface StampItem {
    id: string;
    stampId: number;
    imageUrl: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
        pageIndex: number;
        rotation: number;
        pdfWidth: number;
        pdfHeight: number;
    };
}

export default function ManageStamps({ document, availableStamps, deputyDirectors, fileUrl }: Props) {
    const [stamps, setStamps] = useState<StampItem[]>([]);

    const [deputyDirectorId, setDeputyDirectorId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('===== STAMP SUBMISSION DEBUG =====');
        console.log('1. Current stamps state:', stamps);
        console.log('2. stamps.length:', stamps.length);
        console.log('3. deputy_director_id:', deputyDirectorId);

        if (stamps.length === 0) {
            alert('กรุณาเพิ่มตราประทับอย่างน้อย 1 รายการ');
            return;
        }

        if (!deputyDirectorId) {
            alert('กรุณาเลือกรองผู้อำนวยการสำหรับลงนาม');
            return;
        }

        // แปลงข้อมูล stamps ให้เหมาะกับ backend
        const transformedStamps = stamps.map(stamp => ({
            id: stamp.id,
            stampId: stamp.stampId,
            imageUrl: stamp.imageUrl,
            position: stamp.position
        }));

        console.log('4. Transformed stamps:', transformedStamps);

        // อัพเดทข้อมูลใน form
        const formData = {
            stamps: transformedStamps,
            deputy_director_id: deputyDirectorId
        };

        console.log('5. Final form data:', formData);

        // ส่งข้อมูลตรงๆ โดยใช้ router.post
        setIsSubmitting(true);
        router.post(route('documents.stamps.save', document.id), formData, {
            onSuccess: () => {
                console.log('6. Submit success!');
                setIsSubmitting(false);
                router.visit(route('documents.index'));
            },
            onError: (errors) => {
                console.log('7. Submit errors:', errors);
                setIsSubmitting(false);
                setSubmitErrors(errors);
            }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const selectedDeputy = deputyDirectors.find(d => d.id.toString() === deputyDirectorId);

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
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            จัดการตราประทับ
                        </h2>
                        <p className="text-sm text-gray-600">
                            เพิ่มตราประทับและเลือกผู้ลงนามขั้นสุดท้าย
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`จัดการตราประทับ - ${document.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* PDF Viewer พร้อม Stamp Management */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stamp className="w-5 h-5" />
                                        จัดการตราประทับ - {document.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <StampViewer
                                        fileUrl={fileUrl}
                                        stamps={stamps}
                                        onStampsChange={(newStamps) => {
                                            console.log('StampViewer onChange called with:', newStamps);
                                            setStamps(newStamps);
                                        }}
                                        availableStamps={availableStamps}
                                        readOnly={false}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* ข้อมูลเอกสาร */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* รายละเอียดเอกสาร */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        รายละเอียดเอกสาร
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ชื่อเอกสาร</label>
                                        <p className="text-lg font-medium">{document.title}</p>
                                    </div>

                                    {document.description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">คำอธิบาย</label>
                                            <p className="text-sm text-gray-700">{document.description}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ประเภทเอกสาร</label>
                                        <p className="text-sm">
                                            <Badge variant="secondary">{document.document_type.name}</Badge>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ผู้สร้างเอกสาร</label>
                                        <p className="text-sm">{document.user.fname} {document.user.lname}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">วันที่สร้าง</label>
                                        <p className="text-sm">{formatDate(document.created_at)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* สถานะ Workflow */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        สถานะการดำเนินการ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <WorkflowStatusIndicator
                                        status={document.status}
                                        currentStep={document.current_step}
                                        isCompact={false}
                                    />
                                </CardContent>
                            </Card>

                            {/* เลือกผู้ลงนาม */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        เลือกผู้ลงนามขั้นสุดท้าย
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert>
                                        <AlertCircle className="w-4 h-4" />
                                        <AlertDescription>
                                            เลือกรองผู้อำนวยการที่จะลงนามในขั้นตอนสุดท้าย
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">รองผู้อำนวยการ *</label>
                                        <Select
                                            value={deputyDirectorId}
                                            onValueChange={(value) => setDeputyDirectorId(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกรองผู้อำนวยการ" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {deputyDirectors.map((deputy) => (
                                                    <SelectItem key={deputy.id} value={deputy.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4" />
                                                            <div>
                                                                <p>{deputy.fname} {deputy.lname}</p>
                                                                <p className="text-xs text-gray-500">{deputy.email}</p>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {submitErrors.deputy_director_id && (
                                            <p className="text-sm text-red-500">{submitErrors.deputy_director_id}</p>
                                        )}
                                    </div>

                                    {selectedDeputy && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-blue-800">
                                                        {selectedDeputy.fname} {selectedDeputy.lname}
                                                    </p>
                                                    <p className="text-sm text-blue-600">
                                                        {selectedDeputy.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* สรุปการตั้งค่า */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stamp className="w-5 h-5" />
                                        สรุปการตั้งค่า
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">ตราประทับ:</span>
                                            <Badge variant="outline">
                                                {stamps.length} รายการ
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">ผู้ลงนาม:</span>
                                            <Badge variant={selectedDeputy ? "default" : "secondary"}>
                                                {selectedDeputy ? 'เลือกแล้ว' : 'ยังไม่เลือก'}
                                            </Badge>
                                        </div>

                                        {stamps.length > 0 && selectedDeputy && (
                                            <Alert className="mt-4">
                                                <CheckCircle className="w-4 h-4" />
                                                <AlertDescription>
                                                    พร้อมส่งต่อสำหรับการลงนามขั้นสุดท้าย
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ปุ่มดำเนินการ */}
                            <Card>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit}>
                                        <div className="space-y-4">
                                            {submitErrors.stamps && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <AlertDescription>{submitErrors.stamps}</AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => router.visit(route('documents.index'))}
                                                    disabled={isSubmitting}
                                                    className="flex-1"
                                                >
                                                    ยกเลิก
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting || stamps.length === 0 || !deputyDirectorId}
                                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                                >
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกและส่งต่อ'}
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 