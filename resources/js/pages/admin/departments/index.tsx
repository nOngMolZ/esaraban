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

interface Department {
  id: number;
  name: string;
  description: string | null;
  users_count: number;
  created_at: string;
  updated_at: string;
}

interface IndexProps {
  departments: {
    data: Department[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export default function Index({ departments }: IndexProps) {
  const [deleteDepartmentId, setDeleteDepartmentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/departments', { search: searchQuery }, { preserveState: true });
  };

  const handleDelete = () => {
    if (deleteDepartmentId) {
      router.delete(`/admin/departments/${deleteDepartmentId}`, {
        onSuccess: () => setDeleteDepartmentId(null),
      });
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'จัดการแผนก', href: '/admin/departments' }]}>
      <Head title="จัดการแผนก" />

      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">จัดการแผนก</h1>
          <Button asChild>
            <Link href="/admin/departments/create">
              <Plus className="mr-2 h-4 w-4" />
              สร้างแผนกใหม่
            </Link>
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>แผนกทั้งหมด</CardTitle>
            <CardDescription>
              รายการแผนกทั้งหมดในระบบ จำนวน {departments.total} แผนก
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex mb-4 gap-2">
              <Input
                placeholder="ค้นหาจากชื่อแผนก"
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
                    <TableHead>ชื่อแผนก</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                    <TableHead>จำนวนผู้ใช้งาน</TableHead>
                    <TableHead className="w-[100px] text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.data.length > 0 ? (
                    departments.data.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell className="font-medium">{department.name}</TableCell>
                        <TableCell>{department.description || '-'}</TableCell>
                        <TableCell>{department.users_count} คน</TableCell>
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
                                <Link href={`/admin/departments/${department.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  ดูรายละเอียด
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/departments/${department.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  แก้ไข
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteDepartmentId(department.id)}
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
                        ไม่พบข้อมูลแผนก
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  {departments.current_page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={`/admin/departments?page=${departments.current_page - 1}${searchQuery ? `&search=${searchQuery}` : ''
                          }`}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: departments.last_page }, (_, i) => i + 1).map(
                    (page) => {
                      // Only show pages nearby current page
                      if (
                        page === 1 ||
                        page === departments.last_page ||
                        (page >= departments.current_page - 1 &&
                          page <= departments.current_page + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href={`/admin/departments?page=${page}${searchQuery ? `&search=${searchQuery}` : ''
                                }`}
                              isActive={page === departments.current_page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      // Add ellipsis
                      if (
                        (page === 2 && departments.current_page > 3) ||
                        (page === departments.last_page - 1 &&
                          departments.current_page < departments.last_page - 2)
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

                  {departments.current_page < departments.last_page && (
                    <PaginationItem>
                      <PaginationNext
                        href={`/admin/departments?page=${departments.current_page + 1}${searchQuery ? `&search=${searchQuery}` : ''
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

      <AlertDialog open={!!deleteDepartmentId} onOpenChange={(open) => {
        if (!open) setDeleteDepartmentId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ต้องการลบแผนกนี้ใช่หรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้ และแผนกนี้จะถูกลบออกจากระบบอย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              ลบแผนก
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
} 