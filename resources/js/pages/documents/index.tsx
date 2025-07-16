import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Plus, 
    Search, 
    Filter, 
    Eye, 
    Download, 
    Edit,
    Trash2,
    Clock,
    CheckCircle,
    XCircle 
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import WorkflowStatusIndicator from '@/components/WorkflowStatusIndicator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
    is_public: boolean;
    created_at: string;
    updated_at: string;
    document_type: DocumentType;
    user: User;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedDocuments {
    data: Document[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    documents: PaginatedDocuments;
    documentTypes: DocumentType[];
    filters: {
        search?: string;
        status?: string;
        document_type?: string;
    };
}

export default function DocumentsIndex({ documents, documentTypes, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedType, setSelectedType] = useState(filters.document_type || 'all');

    const handleSearch = () => {
        router.get(route('documents.index'), {
            search: searchTerm,
            status: selectedStatus === 'all' ? '' : selectedStatus,
            document_type: selectedType === 'all' ? '' : selectedType,
        }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedType('all');
        router.get(route('documents.index'));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_deputy_director_1':
                return <Badge variant="outline" className="text-orange-600 border-orange-600">รอรองผู้อำนวยการ</Badge>;
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
            return <CheckCircle className="w-4 h-4 text-green-600" />;
        } else if (status.includes('rejected')) {
            return <XCircle className="w-4 h-4 text-red-600" />;
        } else {
            return <Clock className="w-4 h-4 text-blue-600" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const canEditDocument = (document: Document) => {
        // สามารถแก้ไขได้เฉพาะเอกสารที่ยังไม่เริ่มกระบวนการ หรือ ถูกปฏิเสธ
        return document.status === 'draft' || document.status.includes('rejected');
    };

    const handleDelete = (document: Document) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบเอกสารนี้?')) {
            router.delete(route('documents.destroy', document.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        จัดการเอกสาร
                    </h2>
                    <Button 
                        onClick={() => router.visit(route('documents.create'))}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มเอกสารใหม่
                    </Button>
                </div>
            }
        >
            <Head title="จัดการเอกสาร" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* ส่วนค้นหาและกรอง */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                ค้นหาและกรองเอกสาร
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ค้นหา</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="ชื่อเอกสาร หรือ คำอธิบาย"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">สถานะ</label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="ทุกสถานะ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ทุกสถานะ</SelectItem>
                                            <SelectItem value="pending_deputy_director_1">รอรองผู้อำนวยการ</SelectItem>
                                            <SelectItem value="pending_director">รอผู้อำนวยการ</SelectItem>
                                            <SelectItem value="pending_distribution">รอกระจายเอกสาร</SelectItem>
                                            <SelectItem value="pending_stamp">รอจัดการตรา</SelectItem>
                                            <SelectItem value="pending_deputy_director_2">รอลงนามสุดท้าย</SelectItem>
                                            <SelectItem value="pending_final_review">รอตรวจสอบ</SelectItem>
                                            <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                                            <SelectItem value="rejected">ถูกปฏิเสธ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ประเภท</label>
                                    <Select value={selectedType} onValueChange={setSelectedType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="ทุกประเภท" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ทุกประเภท</SelectItem>
                                            {documentTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">การดำเนินการ</label>
                                    <div className="flex gap-2">
                                        <Button onClick={handleSearch} className="flex-1">
                                            ค้นหา
                                        </Button>
                                        <Button variant="outline" onClick={handleReset}>
                                            รีเซ็ต
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ตารางเอกสาร */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    เอกสารทั้งหมด ({documents.total} รายการ)
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {documents.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">ไม่พบเอกสาร</p>
                                    <p className="text-gray-400 text-sm">ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มเอกสารใหม่</p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>เอกสาร</TableHead>
                                                <TableHead>ประเภท</TableHead>
                                                <TableHead>สถานะ</TableHead>
                                                <TableHead>ผู้สร้าง</TableHead>
                                                <TableHead>วันที่สร้าง</TableHead>
                                                <TableHead className="text-right">การดำเนินการ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {documents.data.map((document) => (
                                                <TableRow key={document.id} className="hover:bg-gray-50">
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                {getStatusIcon(document.status)}
                                                                <p className="font-medium text-gray-900">
                                                                    {document.title}
                                                                </p>
                                                            </div>
                                                            {document.description && (
                                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                                    {document.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {document.document_type.name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            {getStatusBadge(document.status)}
                                                            <WorkflowStatusIndicator
                                                                status={document.status}
                                                                currentStep={document.current_step}
                                                                isCompact={true}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {document.user.fname} {document.user.lname}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {document.user.email}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <p>{formatDate(document.created_at)}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.visit(route('documents.show', document.id))}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.visit(route('documents.download', document.id))}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                            {canEditDocument(document) && (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => router.visit(route('documents.edit', document.id))}
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(document)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {documents.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="text-sm text-gray-500">
                                                แสดง {((documents.current_page - 1) * documents.per_page) + 1} ถึง{' '}
                                                {Math.min(documents.current_page * documents.per_page, documents.total)} จาก{' '}
                                                {documents.total} รายการ
                                            </div>
                                            <div className="flex gap-2">
                                                {documents.links.map((link, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={link.active ? "default" : "outline"}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url)}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 