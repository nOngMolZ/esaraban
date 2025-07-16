import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    FileSignature,
    CheckCircle,
    XCircle,
    ArrowLeft,
    AlertCircle,
    Clock,
    Users
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import PdfSignatureViewer from '@/components/PdfSignatureViewer';
import WorkflowStatusIndicator from '@/components/WorkflowStatusIndicator';
import { Badge } from '@/components/ui/badge';

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
}

interface Document {
    id: number;
    title: string;
    description?: string;
    status: string;
    current_step: number;
    file_path: string;
    current_file_path: string;
    created_at: string;
    document_type: DocumentType;
    user: User;
}

interface DocumentSigner {
    id: number;
    step: number;
    signer_type: string;
    status: string;
    created_at: string;
}

interface PreviousSignature {
    id: number;
    user: User;
    step: number;
    signed_at: string;
    signature_data: string;
}

interface WorkflowStep {
    step: number;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'pending';
    canSign: boolean;
}

interface Props {
    document: Document;
    currentSigner: DocumentSigner;
    previousSignatures: PreviousSignature[];
    workflowStep: WorkflowStep;
    fileUrl: string;
    stepLabels: { [key: number]: string };
}

interface Signature {
    id: string;
    strokes: Array<{ x: number; y: number }[]>;
    pageIndex: number;
    pdfWidth: number;
    pdfHeight: number;
}

export default function SignDocument({
    document,
    currentSigner,
    previousSignatures,
    fileUrl,
    stepLabels
}: Props) {
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejectProcessing, errors: rejectErrors } = useForm({
        rejection_reason: '',
        action: 'reject'
    });

    // ฟังก์ชันแปลง strokes เป็น signature object ที่มี bounding box ถูกต้อง
    const convertStrokesToSignatureData = (strokes: Array<{ x: number; y: number }[]>, pdfWidth: number, pdfHeight: number) => {
        if (strokes.length === 0) return null;

        // หา bounding box ของ strokes ทั้งหมด
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        strokes.forEach(stroke => {
            stroke.forEach(point => {
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            });
        });

        // เพิ่ม padding รอบลายเซ็น
        const padding = 5;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(pdfWidth, maxX + padding);
        maxY = Math.min(pdfHeight, maxY + padding);

        const width = maxX - minX;
        const height = maxY - minY;

        if (width <= 0 || height <= 0) return null;

        // สร้าง canvas สำหรับ signature image
        const canvas = window.document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return null;

        // ตั้งค่า canvas ให้มีพื้นหลังโปร่งใส
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // วาด strokes บน canvas โดยปรับตำแหน่งให้อยู่ใน bounding box
        strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            ctx.beginPath();
            ctx.moveTo(stroke[0].x - minX, stroke[0].y - minY);
            
            for (let i = 1; i < stroke.length; i++) {
                ctx.lineTo(stroke[i].x - minX, stroke[i].y - minY);
            }
            ctx.stroke();
        });

        return {
            imageData: canvas.toDataURL('image/png'),
            position: {
                x: minX,
                y: minY,
                width: width,
                height: height
            }
        };
    };

    const handleApprove = async () => {
        if (signatures.length === 0) {
            alert('กรุณาวาดลายเซ็นก่อนอนุมัติเอกสาร');
            return;
        }

        setIsSubmitting(true);

        // แปลง signatures ให้เป็นรูปแบบที่เซิร์ฟเวอร์คาดหวัง
        const convertedSignatures = signatures.map(sig => {
            console.log('Converting signature:', {
                id: sig.id,
                pageIndex: sig.pageIndex,
                pdfWidth: sig.pdfWidth,
                pdfHeight: sig.pdfHeight,
                strokesCount: sig.strokes.length
            });
            
            const signatureData = convertStrokesToSignatureData(sig.strokes, sig.pdfWidth, sig.pdfHeight);
            
            if (!signatureData) {
                console.warn('Failed to convert signature data for signature:', sig.id);
                return null;
            }
            
            return {
                id: sig.id,
                imageData: signatureData.imageData,
                position: {
                    x: signatureData.position.x,
                    y: signatureData.position.y,
                    width: signatureData.position.width,
                    height: signatureData.position.height,
                    pageIndex: sig.pageIndex,
                    rotation: 0,
                    frontendPdfViewWidthPx: sig.pdfWidth,
                    frontendPdfViewHeightPx: sig.pdfHeight
                }
            };
        }).filter(sig => sig !== null);

        // ใช้ Inertia's post method เพื่อจัดการ CSRF token อัตโนมัติ
        router.post(route('documents.sign.save', document.id), {
            signatures: convertedSignatures,
            action: 'approve'
        }, {
            onSuccess: () => {
                // Inertia จะ redirect อัตโนมัติ และ flash message จะแสดงในหน้า documents
            },
            onError: (errors: any) => {
                console.error('Validation errors:', errors);
                if (typeof errors === 'string') {
                    alert('เกิดข้อผิดพลาด: ' + errors);
                } else if (errors.error) {
                    alert('เกิดข้อผิดพลาด: ' + errors.error);
                } else {
                    alert('เกิดข้อผิดพลาดในการบันทึกลายเซ็น');
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleReject = () => {
        postReject(route('documents.sign.reject', document.id), {
            onSuccess: () => {
                router.visit(route('documents.index'));
            }
        });
    };

    const getStepTitle = (step: number): string => {
        return stepLabels[step] || `ขั้นตอนที่ ${step}`;
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
                            ลงนามเอกสาร
                        </h2>
                        <p className="text-sm text-gray-600">
                            {getStepTitle(currentSigner.step)}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`ลงนามเอกสาร - ${document.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* iPad-optimized layout: Stack vertically on tablet */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* PDF Viewer - Full width on tablet, 2/3 on desktop */}
                        <div className="xl:col-span-2 order-1">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileSignature className="w-5 h-5" />
                                        เอกสาร PDF - {document.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <PdfSignatureViewer
                                        fileUrl={fileUrl}
                                        signatures={signatures}
                                        onSignaturesChange={setSignatures}
                                        previousSignatures={previousSignatures}
                                        readOnly={false}
                                        className="ipad-optimized"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* ข้อมูลเอกสาร - Show on top for mobile/tablet */}
                        <div className="xl:col-span-1 order-2 xl:order-2 space-y-4">
                            {/* การดำเนินการ - Priority section for iPad */}
                            <Card className="sticky top-4">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">การดำเนินการ</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {!showRejectForm ? (
                                        <>
                                            <Alert>
                                                <AlertCircle className="w-4 h-4" />
                                                <AlertDescription className="text-sm">
                                                    กรุณาวาดลายเซ็นบนเอกสาร PDF ก่อนกดปุ่มอนุมัติ
                                                </AlertDescription>
                                            </Alert>

                                            <div className="space-y-3">
                                                <Button
                                                    onClick={handleApprove}
                                                    disabled={isSubmitting || signatures.length === 0}
                                                    className="w-full h-12 text-base bg-green-600 hover:bg-green-700 touch-manipulation"
                                                    size="lg"
                                                >
                                                    <CheckCircle className="w-5 h-5 mr-2" />
                                                    {isSubmitting ? 'กำลังบันทึก...' : 'อนุมัติและลงนาม'}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowRejectForm(true)}
                                                    className="w-full h-12 text-base text-red-600 border-red-600 hover:bg-red-50 touch-manipulation"
                                                    size="lg"
                                                >
                                                    <XCircle className="w-5 h-5 mr-2" />
                                                    ปฏิเสธเอกสาร
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-red-600">ปฏิเสธเอกสาร</h4>

                                            <div className="space-y-2">
                                                <Label htmlFor="rejection_reason">เหตุผลในการปฏิเสธ *</Label>
                                                <Textarea
                                                    id="rejection_reason"
                                                    value={rejectData.rejection_reason}
                                                    onChange={(e) => setRejectData('rejection_reason', e.target.value)}
                                                    placeholder="ระบุเหตุผลในการปฏิเสธเอกสาร"
                                                    rows={4}
                                                    className={`touch-manipulation ${rejectErrors.rejection_reason ? 'border-red-500' : ''}`}
                                                />
                                                {rejectErrors.rejection_reason && (
                                                    <p className="text-sm text-red-500">{rejectErrors.rejection_reason}</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleReject}
                                                    disabled={rejectProcessing}
                                                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 touch-manipulation"
                                                    size="lg"
                                                >
                                                    {rejectProcessing ? 'กำลังบันทึก...' : 'ยืนยันปฏิเสธ'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowRejectForm(false)}
                                                    disabled={rejectProcessing}
                                                    className="flex-1 h-12 touch-manipulation"
                                                    size="lg"
                                                >
                                                    ยกเลิก
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* รายละเอียดเอกสาร - Collapsible on mobile */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FileSignature className="w-4 h-4" />
                                        รายละเอียดเอกสาร
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ชื่อเอกสาร</label>
                                        <p className="text-base font-medium">{document.title}</p>
                                    </div>

                                    {document.description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">คำอธิบาย</label>
                                            <p className="text-sm text-gray-700">{document.description}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">วันที่สร้าง</label>
                                        <p className="text-sm">{formatDate(document.created_at)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* สถานะ Workflow */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Clock className="w-4 h-4" />
                                        สถานะการดำเนินการ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <WorkflowStatusIndicator
                                        status={document.status}
                                        currentStep={document.current_step}
                                        isCompact={true}
                                    />
                                </CardContent>
                            </Card>

                            {/* ประวัติการลงนาม */}
                            {previousSignatures.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Users className="w-4 h-4" />
                                            ประวัติการลงนาม
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {previousSignatures.map((sig) => (
                                                <div key={sig.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-green-800 text-sm truncate">
                                                            {sig.user.fname} {sig.user.lname}
                                                        </p>
                                                        <p className="text-xs text-green-600">
                                                            {getStepTitle(sig.step)}
                                                        </p>
                                                        <p className="text-xs text-green-500">
                                                            {formatDate(sig.signed_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 