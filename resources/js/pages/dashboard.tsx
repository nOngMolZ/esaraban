import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { 
    FileText, 
    Clock, 
    CheckCircle, 
    Users, 
    Eye,
    FileSignature,
    Send,
    Inbox,
    Globe,
    AlertCircle,
    TrendingUp,
    Activity,
    Archive,
    Star
} from 'lucide-react';

interface Document {
    id: number;
    title: string;
    description?: string;
    status: string;
    created_at: string;
    completed_at?: string;
    documentType: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        fname: string;
        lname: string;
    };
}

interface DocumentSigner {
    id: number;
    step: number;
    status: string;
    signed_at?: string;
    document: Document;
}

interface DocumentRecipient {
    id: number;
    recipient_type: string;
    accessed_at?: string;
    created_at: string;
    document: Document;
}

interface User {
    id: number;
    fname: string;
    lname: string;
    email: string;
    role?: {
        name: string;
    };
    position?: {
        name: string;
    };
}

interface DashboardProps {
    user: User;
    userRole: string;
    userPosition: string;
    dashboardType: 'director' | 'deputy_director' | 'sarabun' | 'general';
    
    // สำหรับผู้อำนวยการและรองผู้อำนวยการ
    pendingDocuments?: DocumentSigner[];
    signedDocuments?: DocumentSigner[];
    
    // สำหรับสารบัญ
    myDocuments?: Document[];
    pendingDistribution?: Document[];
    assignedDocuments?: DocumentSigner[];
    
    // สำหรับผู้ใช้ทั่วไป
    receivedDocuments?: DocumentRecipient[];
    publicDocuments?: Document[];
    
    stats: Record<string, number>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
    },
];

export default function Dashboard(props: DashboardProps) {
    const { dashboardType, user, userRole, userPosition, stats } = props;
    const [activeTab, setActiveTab] = useState('overview');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800 border-green-200">เสร็จสิ้น</Badge>;
            case 'pending_deputy_director_1':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">รอรองผู้อำนวยการ</Badge>;
            case 'pending_director':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">รอผู้อำนวยการ</Badge>;
            case 'pending_distribution':
                return <Badge className="bg-purple-100 text-purple-800 border-purple-200">รอกระจายเอกสาร</Badge>;
            case 'pending_stamp':
                return <Badge className="bg-orange-100 text-orange-800 border-orange-200">รอจัดการตรา</Badge>;
            case 'pending_deputy_director_2':
                return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">รอลงนามสุดท้าย</Badge>;
            case 'pending_final_review':
                return <Badge className="bg-pink-100 text-pink-800 border-pink-200">รอตรวจสอบ</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Component สำหรับแสดงรายการเอกสาร
    const DocumentList = ({ documents, type, emptyIcon: EmptyIcon, emptyTitle, emptyDescription, actionButton }: {
        documents: any[];
        type: 'pending' | 'signed' | 'received' | 'assigned' | 'distribution' | 'public' | 'my';
        emptyIcon: any;
        emptyTitle: string;
        emptyDescription: string;
        actionButton?: (doc: any) => React.ReactNode;
    }) => (
        <div className="space-y-3">
            {documents && documents.length > 0 ? (
                documents.map((item, index) => {
                    const document = item.document || item;
                    return (
                        <Card key={item.id || index} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm sm:text-base">
                                                    {document.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                                    {document.documentType?.name || 'ไม่ระบุประเภท'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span className="truncate">
                                                    {type === 'received' ? 'ส่งโดย:' : 'สร้างโดย:'} {document.user?.fname || ''} {document.user?.lname || ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {type === 'received' ? 'ได้รับ:' : 'วันที่:'} {formatDate(item.created_at || document.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {getStatusBadge(document.status)}
                                            {type === 'received' && !item.accessed_at && (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                                    ใหม่
                                                </Badge>
                                            )}
                                            {type === 'signed' && item.signed_at && (
                                                <Badge variant="outline" className="text-xs">
                                                    ลงนามเมื่อ: {formatDate(item.signed_at)}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        {actionButton ? actionButton(item) : (
                                            <Link
                                                href={`/documents/${document.id}`}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                ดู
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            ) : (
                <Card className="border-dashed border-2 border-gray-200">
                    <CardContent className="text-center py-12">
                        <EmptyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyTitle}</h3>
                        <p className="text-sm text-gray-500">{emptyDescription}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    // Stats Cards Component
    const StatsCards = ({ statsData }: { statsData: Array<{ label: string; value: number; icon: any; color: string }> }) => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsData.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="ml-4 min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    const renderDirectorDashboard = () => {
        const statsData = [
            { label: 'รอลงนาม', value: stats.pending_count, icon: Clock, color: 'bg-red-100 text-red-600' },
            { label: 'ลงนามแล้ว', value: stats.signed_count, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
            { label: 'เอกสารทั้งหมด', value: stats.total_documents, icon: FileText, color: 'bg-blue-100 text-blue-600' },
            { label: 'เสร็จสิ้น', value: stats.completed_documents, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
        ];

        return (
            <div className="space-y-6">
                <StatsCards statsData={statsData} />
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 h-auto p-1">
                        <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">ภาพรวม</span>
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex items-center gap-2 py-3">
                            <Clock className="h-4 w-4" />
                            <span className="hidden sm:inline">รอลงนาม</span>
                            {stats.pending_count > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                                    {stats.pending_count}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="signed" className="flex items-center gap-2 py-3">
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">ลงนามแล้ว</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Clock className="h-5 w-5 text-red-600" />
                                        เอกสารที่รอลงนาม
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DocumentList
                                        documents={props.pendingDocuments?.slice(0, 3) || []}
                                        type="pending"
                                        emptyIcon={Clock}
                                        emptyTitle="ไม่มีเอกสารที่รอลงนาม"
                                        emptyDescription="ยังไม่มีเอกสารที่รอการลงนามจากท่าน"
                                        actionButton={(signer) => (
                                            <Link
                                                href={`/documents/${signer.document.id}/sign`}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                            >
                                                <FileSignature className="mr-2 h-4 w-4" />
                                                ลงนาม
                                            </Link>
                                        )}
                                    />
                                    {props.pendingDocuments && props.pendingDocuments.length > 3 && (
                                        <div className="mt-4 text-center">
                                            <Button variant="outline" onClick={() => setActiveTab('pending')}>
                                                ดูทั้งหมด ({props.pendingDocuments.length})
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        เอกสารที่ลงนามแล้ว (ล่าสุด)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DocumentList
                                        documents={props.signedDocuments?.slice(0, 3) || []}
                                        type="signed"
                                        emptyIcon={CheckCircle}
                                        emptyTitle="ยังไม่มีเอกสารที่ลงนาม"
                                        emptyDescription="ยังไม่มีประวัติการลงนาม"
                                    />
                                    {props.signedDocuments && props.signedDocuments.length > 3 && (
                                        <div className="mt-4 text-center">
                                            <Button variant="outline" onClick={() => setActiveTab('signed')}>
                                                ดูทั้งหมด ({props.signedDocuments.length})
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="pending" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5 text-red-600" />
                                    เอกสารที่รอลงนาม ({stats.pending_count})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentList
                                    documents={props.pendingDocuments || []}
                                    type="pending"
                                    emptyIcon={Clock}
                                    emptyTitle="ไม่มีเอกสารที่รอลงนาม"
                                    emptyDescription="ยังไม่มีเอกสารที่รอการลงนามจากท่าน"
                                    actionButton={(signer) => (
                                        <Link
                                            href={`/documents/${signer.document.id}/sign`}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                        >
                                            <FileSignature className="mr-2 h-4 w-4" />
                                            ลงนาม
                                        </Link>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="signed" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    เอกสารที่ลงนามแล้ว ({stats.signed_count})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentList
                                    documents={props.signedDocuments || []}
                                    type="signed"
                                    emptyIcon={CheckCircle}
                                    emptyTitle="ยังไม่มีเอกสารที่ลงนาม"
                                    emptyDescription="ยังไม่มีประวัติการลงนาม"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        );
    };

    const renderDeputyDirectorDashboard = () => renderDirectorDashboard(); // ใช้เหมือนกับผู้อำนวยการ

    const renderSarabunDashboard = () => {
        const statsData = [
            { label: 'เอกสารของฉัน', value: stats.my_documents_count, icon: FileText, color: 'bg-blue-100 text-blue-600' },
            { label: 'รอกระจาย', value: stats.pending_distribution_count, icon: Send, color: 'bg-purple-100 text-purple-600' },
            { label: 'ได้รับมอบหมาย', value: stats.assigned_documents_count, icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
            { label: 'เสร็จสิ้น', value: stats.completed_documents_count, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
        ];

        return (
            <div className="space-y-6">
                <StatsCards statsData={statsData} />
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
                        <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">ภาพรวม</span>
                        </TabsTrigger>
                        <TabsTrigger value="my-documents" className="flex items-center gap-2 py-3">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">เอกสารของฉัน</span>
                        </TabsTrigger>
                        <TabsTrigger value="distribution" className="flex items-center gap-2 py-3">
                            <Send className="h-4 w-4" />
                            <span className="hidden sm:inline">รอกระจาย</span>
                            {stats.pending_distribution_count > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                                    {stats.pending_distribution_count}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="assigned" className="flex items-center gap-2 py-3">
                            <AlertCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">มอบหมาย</span>
                            {stats.assigned_documents_count > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                                    {stats.assigned_documents_count}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Send className="h-5 w-5 text-purple-600" />
                                        เอกสารที่รอกระจาย
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DocumentList
                                        documents={props.pendingDistribution?.slice(0, 3) || []}
                                        type="distribution"
                                        emptyIcon={Send}
                                        emptyTitle="ไม่มีเอกสารที่รอกระจาย"
                                        emptyDescription="ไม่มีเอกสารที่รอการกระจาย"
                                        actionButton={(document) => (
                                            <Link
                                                href={`/documents/${document.id}/distribute`}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                                            >
                                                <Send className="mr-2 h-4 w-4" />
                                                กระจาย
                                            </Link>
                                        )}
                                    />
                                    {props.pendingDistribution && props.pendingDistribution.length > 3 && (
                                        <div className="mt-4 text-center">
                                            <Button variant="outline" onClick={() => setActiveTab('distribution')}>
                                                ดูทั้งหมด ({props.pendingDistribution.length})
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <AlertCircle className="h-5 w-5 text-orange-600" />
                                        เอกสารที่ได้รับมอบหมาย
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DocumentList
                                        documents={props.assignedDocuments?.slice(0, 3) || []}
                                        type="assigned"
                                        emptyIcon={AlertCircle}
                                        emptyTitle="ไม่มีเอกสารที่ได้รับมอบหมาย"
                                        emptyDescription="ไม่มีเอกสารที่ได้รับมอบหมาย"
                                        actionButton={(signer) => (
                                            <Link
                                                href={`/documents/${signer.document.id}/manage-stamps`}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                จัดการ
                                            </Link>
                                        )}
                                    />
                                    {props.assignedDocuments && props.assignedDocuments.length > 3 && (
                                        <div className="mt-4 text-center">
                                            <Button variant="outline" onClick={() => setActiveTab('assigned')}>
                                                ดูทั้งหมด ({props.assignedDocuments.length})
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="my-documents" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    เอกสารของฉัน ({stats.my_documents_count})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentList
                                    documents={props.myDocuments || []}
                                    type="my"
                                    emptyIcon={FileText}
                                    emptyTitle="ยังไม่มีเอกสาร"
                                    emptyDescription="คุณยังไม่ได้สร้างเอกสารใดๆ"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="distribution" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Send className="h-5 w-5 text-purple-600" />
                                    เอกสารที่รอกระจาย ({stats.pending_distribution_count})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentList
                                    documents={props.pendingDistribution || []}
                                    type="distribution"
                                    emptyIcon={Send}
                                    emptyTitle="ไม่มีเอกสารที่รอกระจาย"
                                    emptyDescription="ไม่มีเอกสารที่รอการกระจาย"
                                    actionButton={(document) => (
                                        <Link
                                            href={`/documents/${document.id}/distribute`}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            กระจาย
                                        </Link>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="assigned" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                    เอกสารที่ได้รับมอบหมาย ({stats.assigned_documents_count})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentList
                                    documents={props.assignedDocuments || []}
                                    type="assigned"
                                    emptyIcon={AlertCircle}
                                    emptyTitle="ไม่มีเอกสารที่ได้รับมอบหมาย"
                                    emptyDescription="ไม่มีเอกสารที่ได้รับมอบหมาย"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        );
    };

    const renderGeneralUserDashboard = () => {
        const statsData = [
            { label: 'เอกสารที่ได้รับ', value: stats.received_count, icon: Inbox, color: 'bg-blue-100 text-blue-600' },
            { label: 'ยังไม่ได้อ่าน', value: stats.unread_count, icon: AlertCircle, color: 'bg-red-100 text-red-600' },
            { label: 'ได้รับมอบหมาย', value: stats.assigned_count, icon: FileText, color: 'bg-orange-100 text-orange-600' },
            { label: 'เอกสารสาธารณะ', value: stats.public_documents_count, icon: Globe, color: 'bg-green-100 text-green-600' },
        ];

        return (
            <div className="space-y-6">
                <StatsCards statsData={statsData} />
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
                        <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">ภาพรวม</span>
                        </TabsTrigger>
                        <TabsTrigger value="received" className="flex items-center gap-2 py-3">
                            <Inbox className="h-4 w-4" />
                            <span className="hidden sm:inline">ได้รับ</span>
                            {stats.unread_count > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                                    {stats.unread_count}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="assigned" className="flex items-center gap-2 py-3">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">มอบหมาย</span>
                            {stats.assigned_count > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                                    {stats.assigned_count}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="public" className="flex items-center gap-2 py-3">
                            <Globe className="h-4 w-4" />
                            <span className="hidden sm:inline">สาธารณะ</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Inbox className="h-5 w-5 text-blue-600" />
                                        เอกสารที่ได้รับ (ล่าสุด)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DocumentList
                                        documents={props.receivedDocuments?.slice(0, 3) || []}
                                        type="received"
                                        emptyIcon={Inbox}
                                        emptyTitle="ไม่มีเอกสารที่ได้รับ"
                                        emptyDescription="ยังไม่มีเอกสารที่ส่งมาให้คุณ"
                                        actionButton={(recipient) => (
                                            <Link
                                                href={`/documents/${recipient.document.id}/view-only`}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                ดู
                                            </Link>
                                        )}
                                    />
                                    {props.receivedDocuments && props.receivedDocuments.length > 3 && (
                                        <div className="mt-4 text-center">
                                            <Button variant="outline" onClick={() => setActiveTab('received')}>
                                                ดูทั้งหมด ({props.receivedDocuments.length})
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="received" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Inbox className="h-5 w-5 text-blue-600" />
                                    เอกสารที่ได้รับ ({stats.received_count})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentList
                                    documents={props.receivedDocuments || []}
                                    type="received"
                                    emptyIcon={Inbox}
                                    emptyTitle="ไม่มีเอกสารที่ได้รับ"
                                    emptyDescription="ยังไม่มีเอกสารที่ส่งมาให้คุณ"
                                    actionButton={(recipient) => (
                                        <Link
                                            href={`/documents/${recipient.document.id}/view-only`}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            ดู
                                        </Link>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="assigned" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                    เอกสารที่ได้รับมอบหมาย ({stats.assigned_count})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentList
                                    documents={props.assignedDocuments || []}
                                    type="assigned"
                                    emptyIcon={FileText}
                                    emptyTitle="ไม่มีเอกสารที่ได้รับมอบหมาย"
                                    emptyDescription="ยังไม่มีเอกสารที่ได้รับมอบหมาย"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="public" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Globe className="h-5 w-5 text-green-600" />
                                    เอกสารสาธารณะ ({stats.public_documents_count})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentList
                                    documents={props.publicDocuments || []}
                                    type="public"
                                    emptyIcon={Globe}
                                    emptyTitle="ไม่มีเอกสารสาธารณะ"
                                    emptyDescription="ยังไม่มีเอกสารสาธารณะ"
                                    actionButton={(document) => (
                                        <Link
                                            href={`/documents/${document.id}/view-only`}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            ดู
                                        </Link>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        );
    };

    const renderDashboardContent = () => {
        switch (dashboardType) {
            case 'director':
                return renderDirectorDashboard();
            case 'deputy_director':
                return renderDeputyDirectorDashboard();
            case 'sarabun':
                return renderSarabunDashboard();
            case 'general':
            default:
                return renderGeneralUserDashboard();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="แดชบอร์ด" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            สวัสดี, {user.fname} {user.lname}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            {userPosition} • {userRole}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/documents"
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            เอกสารทั้งหมด
                        </Link>
                        {userRole === 'สารบัญ' && (
                            <Link
                                href="/documents/add"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                สร้างเอกสารใหม่
                            </Link>
                        )}
                    </div>
                </div>

                {/* Dashboard Content */}
                {renderDashboardContent()}
            </div>
        </AppLayout>
    );
}
