import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Document {
  id: number;
  title: string;
  file_name: string;
  created_at: string;
}

interface DocumentType {
  id: number;
  name: string;
  description: string | null;
  documents_count: number;
  documents: Document[];
  created_at: string;
  updated_at: string;
}

interface ShowProps {
  documentType: DocumentType;
}

export default function Show({ documentType }: ShowProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'จัดการประเภทเอกสาร', href: '/admin/document-types' },
        { title: 'รายละเอียดประเภทเอกสาร', href: `/admin/document-types/${documentType.id}` },
      ]}
    >
      <Head title={`รายละเอียดประเภทเอกสาร - ${documentType.name}`} />

      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">รายละเอียดประเภทเอกสาร</h1>
          <Button asChild>
            <Link href={`/admin/document-types/${documentType.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              แก้ไข
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลประเภทเอกสาร</CardTitle>
              <CardDescription>รายละเอียดของประเภทเอกสาร</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ชื่อประเภทเอกสาร</dt>
                  <dd className="text-lg font-semibold mt-1">{documentType.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">จำนวนเอกสาร</dt>
                  <dd className="text-lg font-semibold mt-1">{documentType.documents_count} ฉบับ</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">คำอธิบาย</dt>
                  <dd className="text-base mt-1">{documentType.description || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">สร้างเมื่อ</dt>
                  <dd className="text-base mt-1">{formatDate(documentType.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">แก้ไขล่าสุด</dt>
                  <dd className="text-base mt-1">{formatDate(documentType.updated_at)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {documentType.documents && documentType.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>เอกสารล่าสุด</CardTitle>
                <CardDescription>เอกสารล่าสุด 5 รายการที่ใช้ประเภทเอกสารนี้</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ชื่อเอกสาร</TableHead>
                        <TableHead>ชื่อไฟล์</TableHead>
                        <TableHead>วันที่สร้าง</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documentType.documents.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">{document.title}</TableCell>
                          <TableCell>{document.file_name}</TableCell>
                          <TableCell>{formatDate(document.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/documents">ดูเอกสารทั้งหมด</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/document-types">กลับไปยังรายการประเภทเอกสาร</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
} 