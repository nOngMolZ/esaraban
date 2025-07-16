import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

interface DocumentType {
  id: number;
  name: string;
  description: string | null;
  documents_count: number;
  created_at: string;
  updated_at: string;
}

interface IndexProps {
  documentTypes: {
    data: DocumentType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export default function Index({ documentTypes }: IndexProps) {
  const [deleteDocumentTypeId, setDeleteDocumentTypeId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/document-types', { search: searchQuery }, { preserveState: true });
  };

  const handleDelete = () => {
    if (deleteDocumentTypeId) {
      router.delete(`/admin/document-types/${deleteDocumentTypeId}`, {
        onSuccess: () => setDeleteDocumentTypeId(null),
      });
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'จัดการประเภทเอกสาร', href: '/admin/document-types' }]}>
      <Head title="จัดการประเภทเอกสาร" />

      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">จัดการประเภทเอกสาร</h1>
          <Button asChild>
            <Link href="/admin/document-types/create">
              <Plus className="mr-2 h-4 w-4" />
              สร้างประเภทเอกสารใหม่
            </Link>
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>ประเภทเอกสารทั้งหมด</CardTitle>
            <CardDescription>
              รายการประเภทเอกสารทั้งหมดในระบบ จำนวน {documentTypes.total} รายการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex mb-4 gap-2">
              <Input
                placeholder="ค้นหาจากชื่อหรือคำอธิบาย"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit">ค้นหา</Button>
            </form>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อประเภทเอกสาร</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                    <TableHead>จำนวนเอกสาร</TableHead>
                    <TableHead className="w-[100px] text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentTypes.data.length > 0 ? (
                    documentTypes.data.map((documentType) => (
                      <TableRow key={documentType.id}>
                        <TableCell className="font-medium">{documentType.name}</TableCell>
                        <TableCell>{documentType.description || '-'}</TableCell>
                        <TableCell>{documentType.documents_count} ฉบับ</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">เปิดเมนู</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/document-types/${documentType.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  ดูรายละเอียด
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/document-types/${documentType.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  แก้ไข
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteDocumentTypeId(documentType.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                ลบ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center"
                      >
                        ไม่พบข้อมูลประเภทเอกสาร
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  {documentTypes.current_page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={`/admin/document-types?page=${documentTypes.current_page - 1}${searchQuery ? `&search=${searchQuery}` : ''
                          }`}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: documentTypes.last_page }, (_, i) => i + 1).map(
                    (page) => {
                      // Only show pages nearby current page
                      if (
                        page === 1 ||
                        page === documentTypes.last_page ||
                        (page >= documentTypes.current_page - 1 &&
                          page <= documentTypes.current_page + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href={`/admin/document-types?page=${page}${searchQuery ? `&search=${searchQuery}` : ''
                                }`}
                              isActive={page === documentTypes.current_page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      // Add ellipsis
                      if (
                        (page === 2 && documentTypes.current_page > 3) ||
                        (page === documentTypes.last_page - 1 &&
                          documentTypes.current_page < documentTypes.last_page - 2)
                      ) {
                        return (
                          <PaginationItem key={`ellipsis-${page}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      return null;
                    }
                  )}

                  {documentTypes.current_page < documentTypes.last_page && (
                    <PaginationItem>
                      <PaginationNext
                        href={`/admin/document-types?page=${documentTypes.current_page + 1}${searchQuery ? `&search=${searchQuery}` : ''
                          }`}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteDocumentTypeId} onOpenChange={() => setDeleteDocumentTypeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบประเภทเอกสาร</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบประเภทเอกสารนี้? การดำเนินการนี้ไม่สามารถเรียกคืนได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
} 