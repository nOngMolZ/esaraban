import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Send, 
    ArrowLeft, 
    AlertCircle,
    Clock,
    Users,
    Building2,
    CheckCircle,
    FileText,
    User
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
    department_id?: number;
    position?: {
        name: string;
    };
    department?: {
        id: number;
        name: string;
    };
}

interface Department {
    id: number;
    name: string;
    description?: string;
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

interface Props {
    document: Document;
    departments: Department[];
    users: User[];
}

export default function DistributeDocument({ document, departments, users }: Props) {
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<number | null>(null);

    const { setData, post, processing, errors } = useForm({
        user_ids: [] as number[],
        department_id: '',
    });

    // กรองผู้ใช้ตามแผนกที่เลือก
    const filteredUsers = selectedDepartment && selectedDepartment !== 'all'
        ? users.filter(user => 
            user.department_id === parseInt(selectedDepartment) || 
            user.department?.id === parseInt(selectedDepartment)
          )
        : users;

    const handleUserSelect = (userId: number) => {
        setSelectedUser(userId);
        setData('user_ids', [userId]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
            alert('กรุณาเลือกผู้รับเอกสาร');
            return;
        }

        console.log('=== DISTRIBUTING DOCUMENT ===');
        console.log('Document ID:', document.id);
        console.log('Selected User:', selectedUser);
        console.log('Form data:', { user_ids: [selectedUser] });
        console.log('Route URL:', route('documents.distribute.store', document.id));

        post(route('documents.distribute.store', document.id), {
            onStart: () => {
                console.log('Request started...');
            },
            onSuccess: (response) => {
                console.log('Success response:', response);
                router.visit(route('documents.index'));
            },
            onError: (errors) => {
                console.error('Error response:', errors);
                console.error('Full error object:', JSON.stringify(errors, null, 2));
                if (errors.general) {
                    alert('ข้อผิดพลาด: ' + errors.general);
                }
            },
            onFinish: () => {
                console.log('Request finished');
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

    const selectedUserData = selectedUser ? users.find(u => u.id === selectedUser) : null;

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
                            กระจายเอกสาร
                        </h2>
                        <p className="text-sm text-gray-600">
                            เลือกผู้รับเอกสารสำหรับการดำเนินการต่อ
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`กระจายเอกสาร - ${document.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                            <Badge variant="secondary">{document.document_type?.name || 'ไม่ระบุ'}</Badge>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ผู้สร้างเอกสาร</label>
                                        <p className="text-sm">{document.user?.fname} {document.user?.lname}</p>
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

                            {/* ผู้รับที่เลือก */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        ผู้รับที่เลือก
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {selectedUserData ? (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <p className="font-medium text-blue-900">
                                                            {selectedUserData.fname} {selectedUserData.lname}
                                                        </p>
                                                        <p className="text-sm text-blue-700">
                                                            {selectedUserData.email}
                                                        </p>
                                                        {selectedUserData.position?.name && (
                                                            <Badge variant="outline" className="text-xs mt-1">
                                                                {selectedUserData.position.name}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                                <p className="text-gray-500 text-sm">ยังไม่ได้เลือกผู้รับเอกสาร</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ส่วนเลือกผู้รับ */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Send className="w-5 h-5" />
                                        เลือกผู้รับเอกสาร
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* คำแนะนำ */}
                                        <Alert>
                                            <AlertCircle className="w-4 h-4" />
                                            <AlertDescription>
                                                <strong>คำแนะนำ:</strong> เลือกผู้รับที่จะดำเนินการในขั้นตอนต่อไป (การประทับตราและเลือกผู้ลงนาม)
                                                ผู้รับจะได้รับการแจ้งเตือนและสามารถจัดการตราประทับบนเอกสารได้
                                            </AlertDescription>
                                        </Alert>

                                        {/* กรองตามแผนก */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <label className="text-sm font-medium">กรองตามแผนก</label>
                                                    <Select 
                                                        value={selectedDepartment} 
                                                        onValueChange={setSelectedDepartment}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue placeholder="ทุกแผนก" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">ทุกแผนก</SelectItem>
                                                            {departments.map((dept) => (
                                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Building2 className="w-4 h-4" />
                                                                        {dept.name}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* รายชื่อผู้ใช้ */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                <span className="font-medium">
                                                    รายชื่อผู้ใช้ ({filteredUsers.length} คน)
                                                </span>
                                            </div>

                                            {filteredUsers.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p>ไม่พบผู้ใช้งานในแผนกที่เลือก</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                                    {filteredUsers.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                                selectedUser === user.id
                                                                    ? 'border-blue-500 bg-blue-50'
                                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                            onClick={() => handleUserSelect(user.id)}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                                                                    selectedUser === user.id 
                                                                        ? 'border-blue-500 bg-blue-500' 
                                                                        : 'border-gray-300'
                                                                }`}>
                                                                    {selectedUser === user.id && (
                                                                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-gray-900">
                                                                        {user.fname} {user.lname}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        {user.email}
                                                                    </p>
                                                                    {user.position?.name && (
                                                                        <Badge variant="secondary" className="text-xs mt-1">
                                                                            {user.position.name}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* ข้อผิดพลาด */}
                                        {errors.user_ids && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="w-4 h-4" />
                                                <AlertDescription>{errors.user_ids}</AlertDescription>
                                            </Alert>
                                        )}

                                        {/* ปุ่มดำเนินการ */}
                                        <div className="flex justify-end gap-4 pt-6 border-t">
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
                                                disabled={processing || !selectedUser}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                {processing ? 'กำลังส่ง...' : selectedUser ? 'กระจายเอกสาร' : 'เลือกผู้รับก่อน'}
                                            </Button>
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