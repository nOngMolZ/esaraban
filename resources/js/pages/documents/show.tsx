import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    FileText, 
    Download,
    Calendar,
    User,
    Eye,
    ArrowLeft,
    Edit,
    FileSignature,
    Clock,
    CheckCircle,
    XCircle,
    Send,
    Stamp
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import WorkflowStatusIndicator from '@/components/WorkflowStatusIndicator';

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

interface DocumentSigner {
    id: number;
    step: number;
    signer_type: string;
    status: string;
    signed_at?: string;
    user?: User;
}

interface DocumentViewer {
    id: number;
    user_id: number;
    viewed_at?: string;
}

interface Document {
    id: number;
    title: string;
    description?: string;
    status: string;
    current_step: number;
    file_path: string;
    current_file_path: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    completed_at?: string;
    documentType?: DocumentType;
    user?: User;
    signers: DocumentSigner[];
    viewers: DocumentViewer[];
}

interface Props {
    document: Document;
    canSign: boolean;
    fileUrl: string;
}

export default function DocumentShow({ document, canSign, fileUrl }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_deputy_director_1':
                return <Badge variant="outline" className="text-orange-600 border-orange-600">รอรองผู้อำนวยการ (ครั้งที่ 1)</Badge>;
            case 'pending_director':
                return <Badge variant="outline" className="text-purple-600 border-purple-600">รอผู้อำนวยการ</Badge>;
            case 'pending_distribution':
                return <Badge variant="outline" className="text-blue-600 border-blue-600">รอกระจายเอกสาร</Badge>;
            case 'pending_stamp':
                return <Badge variant="outline" className="text-indigo-600 border-indigo-600">รอจัดการตรา</Badge>;
            case 'pending_deputy_director_2':
                return <Badge variant="outline" className="text-orange-600 border-orange-600">รอลงนามสุดท้าย</Badge>;
            case 'pending_final_review':
                return <Badge variant="outline" className="text-amber-600 border-amber-600">รอตรวจสอบ</Badge>;
            case 'completed':
                return <Badge variant="outline" className="text-green-600 border-green-600">เสร็จสิ้น</Badge>;
            case 'rejected_by_deputy_1':
            case 'rejected_by_director':
            case 'rejected_by_deputy_2':
                return <Badge variant="outline" className="text-red-600 border-red-600">ถูกปฏิเสธ</Badge>;
            default:
                return <Badge variant="outline">ไม่ทราบสถานะ</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'completed') {
            return <CheckCircle className="w-5 h-5 text-green-600" />;
        } else if (status.includes('rejected')) {
            return <XCircle className="w-5 h-5 text-red-600" />;
        } else {
            return <Clock className="w-5 h-5 text-blue-600" />;
        }
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

    const canEditDocument = () => {
        // สามารถแก้ไขได้เฉพาะเอกสารที่ยังไม่เริ่มกระบวนการ หรือ ถูกปฏิเสธ
        return document.status === 'draft' || document.status.includes('rejected');
    };

    const getAvailableActions = () => {
        const actions = [];

        // ปุ่มดาวน์โหลด
        actions.push(
            <Button
                key="download"
                variant="outline"
                onClick={() => router.visit(route('documents.download', document.id))}
            >
                <Download className="w-4 h-4 mr-2" />
                ดาวน์โหลด
            </Button>
        );

        // ถ้าเป็นขั้นตอนจัดการตรา ให้แสดงเฉพาะปุ่มจัดการตรา
        if (document.status === 'pending_stamp') {
            actions.push(
                <Button
                    key="stamps"
                    onClick={() => router.visit(route('documents.stamps.show', document.id))}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    <Stamp className="w-4 h-4 mr-2" />
                    จัดการตรา
                </Button>
            );
            return actions; // ส่งคืนเฉพาะปุ่มดาวน์โหลดและจัดการตรา
        }

        // ปุ่มแก้ไข (ถ้าสามารถแก้ไขได้)
        if (canEditDocument()) {
            actions.push(
                <Button
                    key="edit"
                    variant="outline"
                    onClick={() => router.visit(route('documents.edit', document.id))}
                >
                    <Edit className="w-4 h-4 mr-2" />
                    แก้ไข
                </Button>
            );
        }

        // ปุ่มลงนาม (ถ้าสามารถลงนามได้)
        if (canSign) {
            actions.push(
                <Button
                    key="sign"
                    onClick={() => router.visit(route('documents.sign', document.id))}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <FileSignature className="w-4 h-4 mr-2" />
                    ลงนาม
                </Button>
            );
        }

        // ปุ่มกระจายเอกสาร (ถ้าเป็นขั้นตอนกระจาย)
        if (document.status === 'pending_distribution') {
            actions.push(
                <Button
                    key="distribute"
                    onClick={() => router.visit(route('documents.distribute.show', document.id))}
                    className="bg-green-600 hover:bg-green-700"
                >
                    <Send className="w-4 h-4 mr-2" />
                    กระจายเอกสาร
                </Button>
            );
        }

        // ปุ่มตรวจสอบขั้นสุดท้าย (ถ้าเป็นขั้นตอนตรวจสอบ)
        if (document.status === 'pending_final_review') {
            actions.push(
                <Button
                    key="final-review"
                    onClick={() => router.visit(route('documents.final-review.show', document.id))}
                    className="bg-amber-600 hover:bg-amber-700"
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    ตรวจสอบขั้นสุดท้าย
                </Button>
            );
        }

        return actions;
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
                    <div className="flex items-center gap-3">
                        {getStatusIcon(document.status)}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {document.title}
                            </h2>
                            <p className="text-sm text-gray-600">
                                รายละเอียดเอกสาร
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`${document.title} - รายละเอียดเอกสาร`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* รายละเอียดเอกสาร */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* ข้อมูลพื้นฐาน */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            ข้อมูลเอกสาร
                                        </CardTitle>
                                        {getStatusBadge(document.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ชื่อเอกสาร</label>
                                        <p className="text-lg font-medium">{document.title}</p>
                                    </div>

                                    {document.description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">คำอธิบาย</label>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{document.description}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">ประเภทเอกสาร</label>
                                            <p className="text-sm">
                                                <Badge variant="secondary">
                                                    {document.documentType?.name || 'ไม่ระบุประเภท'}
                                                </Badge>
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-500">สถานะการเข้าถึง</label>
                                            <p className="text-sm">
                                                <Badge variant={document.is_public ? "default" : "outline"}>
                                                    {document.is_public ? "สาธารณะ" : "จำกัดสิทธิ์"}
                                                </Badge>
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">ผู้สร้างเอกสาร</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">
                                                    {document.user ? `${document.user.fname} ${document.user.lname}` : 'ไม่ระบุผู้สร้าง'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-500">วันที่สร้าง</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">{formatDate(document.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {document.completed_at && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">วันที่เสร็จสิ้น</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                <span className="text-sm">{formatDate(document.completed_at)}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* ตัวอย่างเอกสาร */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Eye className="w-5 h-5" />
                                        ตัวอย่างเอกสาร
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                                        {fileUrl ? (
                                            <iframe
                                                src={fileUrl}
                                                className="w-full h-full rounded-lg"
                                                title="Document Preview"
                                                onError={() => {
                                                    // Handle loading error
                                                    console.log('Failed to load PDF preview');
                                                }}
                                            />
                                        ) : (
                                            <div className="text-center p-8">
                                                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                                <p className="text-gray-500 text-lg">ไม่สามารถแสดงตัวอย่างได้</p>
                                                <p className="text-gray-400 text-sm">ไฟล์เอกสารไม่พร้อมใช้งาน</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.visit(route('documents.download', document.id))}
                                                    className="mt-4"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    ลองดาวน์โหลด
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* แถบด้านข้าง */}
                        <div className="space-y-6">
                            {/* การดำเนินการ */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>การดำเนินการ</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-3">
                                        {getAvailableActions()}
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

                            {/* ผู้เกี่ยวข้อง */}
                            {(document.signers.length > 0 || document.status === 'pending_stamp') && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            ผู้ลงนาม
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {document.signers
                                                .filter((signer) => {
                                                    // ไม่แสดงผู้ที่มี signer_type เป็น operational_phase เพราะเป็นผู้จัดการตรา
                                                    if (signer.signer_type === 'operational_phase') {
                                                        return false;
                                                    }
                                                    return true;
                                                })
                                                .sort((a, b) => a.step - b.step) // เรียงตามลำดับขั้นตอน
                                                .map((signer) => (
                                                <div key={signer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {signer.user ? `${signer.user.fname} ${signer.user.lname}` : 'ไม่ระบุผู้ลงนาม'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            ขั้นตอนที่ {signer.step} - {
                                                                signer.signer_type === 'admin_phase' && signer.step === 1 ? 'รองผู้อำนวยการ (ครั้งที่ 1)' :
                                                                signer.signer_type === 'admin_phase' && signer.step === 2 ? 'ผู้อำนวยการ' :
                                                                signer.signer_type === 'deputy_director_2' ? 'รองผู้อำนวยการ (ครั้งที่ 2)' :
                                                                signer.signer_type
                                                            }
                                                        </p>
                                                    </div>
                                                    <Badge 
                                                        variant={signer.status === 'signed' || signer.status === 'completed' ? 'default' : 'outline'}
                                                        className={
                                                            signer.status === 'signed' || signer.status === 'completed'
                                                                ? 'text-green-600 border-green-600' 
                                                                : signer.status === 'waiting' || signer.status === 'pending'
                                                                ? 'text-blue-600 border-blue-600'
                                                                : 'text-red-600 border-red-600'
                                                        }
                                                    >
                                                        {(signer.status === 'signed' || signer.status === 'completed') && 'ลงนามแล้ว'}
                                                        {(signer.status === 'waiting' || signer.status === 'pending') && 'รอลงนาม'}
                                                        {signer.status === 'rejected' && 'ปฏิเสธ'}
                                                    </Badge>
                                                </div>
                                            ))}
                                            
                                            {/* แสดงผู้จัดการตราประทับ */}
                                            {document.signers.some(signer => signer.signer_type === 'operational_phase') && (
                                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                    <div>
                                                        <p className="text-sm font-medium text-purple-800">
                                                            ผู้จัดการตราประทับ
                                                        </p>
                                                        <p className="text-xs text-purple-600">
                                                            ขั้นตอนที่ 4 - จัดการตราและเลือกผู้ลงนาม
                                                        </p>
                                                    </div>
                                                    <Badge 
                                                        variant="outline"
                                                        className={
                                                            document.signers.find(s => s.signer_type === 'operational_phase')?.status === 'completed'
                                                                ? 'text-green-600 border-green-600'
                                                                : 'text-purple-600 border-purple-600'
                                                        }
                                                    >
                                                        {document.signers.find(s => s.signer_type === 'operational_phase')?.status === 'completed' 
                                                            ? 'เสร็จสิ้น' 
                                                            : 'กำลังดำเนินการ'
                                                        }
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* แสดงสถานะรอเลือกผู้ลงนามในขั้นตอนจัดการตรา */}
                                            {document.status === 'pending_stamp' && (
                                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                    <div>
                                                        <p className="text-sm font-medium text-yellow-800">
                                                            ผู้ลงนามขั้นสุดท้าย
                                                        </p>
                                                        <p className="text-xs text-yellow-600">
                                                            ขั้นตอนที่ 5 - รอเลือกผู้ลงนาม
                                                        </p>
                                                    </div>
                                                    <Badge 
                                                        variant="outline"
                                                        className="text-yellow-600 border-yellow-600"
                                                    >
                                                        รอเลือก
                                                    </Badge>
                                                </div>
                                            )}
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