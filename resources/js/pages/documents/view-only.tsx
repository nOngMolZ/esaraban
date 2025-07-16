import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download,
  Calendar,
  CheckCircle,
  Eye,
  Globe,
  Lock
} from 'lucide-react';

interface Document {
  id: number;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  completed_at: string;
  access_type: string;
  documentType?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    fname: string;
    lname: string;
  };
}

interface Signature {
  id: number;
  user?: {
    id: number;
    fname: string;
    lname: string;
    position?: {
      name: string;
    };
  };
  step: number;
  signer_type: string;
  signed_at: string;
  signature_data?: unknown;
}

interface Stamp {
  id: number;
  stamp?: {
    id: number;
    name: string;
    file_path: string;
  };
  position_data: unknown;
  user?: {
    id: number;
    fname: string;
    lname: string;
  };
}

interface Props {
  document: Document;
  signatures: Signature[];
  stamps: Stamp[];
  fileUrl: string;
  isPublic: boolean;
}

export default function ViewOnly({ 
  document, 
  signatures, 
  stamps, 
  fileUrl, 
  isPublic 
}: Props) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStepName = (step: number, signerType: string) => {
    switch (step) {
      case 1:
        return 'รองผู้อำนวยการ (ครั้งที่ 1)';
      case 2:
        return 'ผู้อำนวยการ';
      case 3:
        return 'สารบัญ';
      case 5:
        return 'รองผู้อำนวยการ (ครั้งที่ 2)';
      default:
        return signerType;
    }
  };

  const handleDownload = () => {
    window.open(`/documents/${document.id}/download`, '_blank');
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
              {document.title}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                เสร็จสิ้น
              </Badge>
              <Badge variant="outline">
                {document.documentType?.name || 'ไม่ระบุ'}
              </Badge>
              {isPublic ? (
                <Badge variant="outline" className="text-blue-600">
                  <Globe className="mr-1 h-3 w-3" />
                  สาธารณะ
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600">
                  <Lock className="mr-1 h-3 w-3" />
                  จำกัดสิทธิ์
                </Badge>
              )}
            </div>
          </div>
          <Button onClick={handleDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลด
          </Button>
        </div>
      }
    >
      <Head title={`${document.title} - ดูเอกสาร`} />

      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* หน้าแสดงเอกสาร */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    เอกสาร PDF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={fileUrl}
                      className="w-full h-full"
                      title="Document Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* แผงข้อมูล */}
            <div className="space-y-6">
              
              {/* ข้อมูลเอกสาร */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ข้อมูลเอกสาร</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">ชื่อเอกสาร</h3>
                    <p className="text-sm text-gray-900 mt-1">{document.title}</p>
                  </div>
                  
                  {document.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">คำอธิบาย</h3>
                      <p className="text-sm text-gray-900 mt-1">{document.description}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">ประเภทเอกสาร</h3>
                    <p className="text-sm text-gray-900 mt-1">{document.documentType?.name || 'ไม่ระบุ'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">ผู้สร้าง</h3>
                    <p className="text-sm text-gray-900 mt-1">
                      {document.user?.fname || 'ไม่ระบุ'} {document.user?.lname || ''}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">วันที่สร้าง</h3>
                    <p className="text-sm text-gray-900 mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(document.created_at)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">วันที่เสร็จสิ้น</h3>
                    <p className="text-sm text-gray-900 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {formatDate(document.completed_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* สถานะการเข้าถึง */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">การเข้าถึง</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-900">คุณสามารถดูเอกสารนี้ได้</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-2 text-sm">
                    {isPublic ? (
                      <>
                        <Globe className="h-4 w-4 text-green-600" />
                        <span className="text-gray-900">เอกสารสาธารณะ</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-orange-600" />
                        <span className="text-gray-900">เอกสารจำกัดสิทธิ์</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    เข้าถึงเมื่อ: {formatDate(new Date().toISOString())}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
} 