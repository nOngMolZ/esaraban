import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { User } from '@/types';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

interface IndexProps {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export default function Index({ users }: IndexProps) {
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/users', { search: searchQuery }, { preserveState: true });
  };

  const handleDelete = () => {
    if (deleteUserId) {
      router.delete(`/admin/users/${deleteUserId}`, {
        onSuccess: () => setDeleteUserId(null),
      });
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'จัดการผู้ใช้งาน', href: '/admin/users' }]}>
      <Head title="จัดการผู้ใช้งาน" />

      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">จัดการผู้ใช้งาน</h1>
          <Button asChild>
            <Link href="/admin/users/create">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มผู้ใช้งานใหม่
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ผู้ใช้งานทั้งหมด</CardTitle>
            <CardDescription>
              รายการผู้ใช้งานทั้งหมดในระบบ จำนวน {users.total} คน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex mb-4 gap-2">
              <Input
                placeholder="ค้นหาจากชื่อหรืออีเมล"
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
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>ตำแหน่ง</TableHead>
                    <TableHead>แผนก</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="w-[100px] text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data.length > 0 ? (
                    users.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.fname} {user.lname}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.position?.name || '-'}</TableCell>
                        <TableCell>{user.department?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.is_active ? 'default' : 'secondary'}
                          >
                            {user.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </Badge>
                        </TableCell>
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
                                <Link href={`/admin/users/${user.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  ดูรายละเอียด
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${user.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  แก้ไข
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteUserId(user.id)}
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
                        colSpan={6}
                        className="h-24 text-center"
                      >
                        ไม่พบข้อมูลผู้ใช้งาน
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  {users.current_page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={`/admin/users?page=${users.current_page - 1}${searchQuery ? `&search=${searchQuery}` : ''
                          }`}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: users.last_page }, (_, i) => i + 1).map(
                    (page) => {
                      // Only show pages nearby current page
                      if (
                        page === 1 ||
                        page === users.last_page ||
                        (page >= users.current_page - 1 &&
                          page <= users.current_page + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href={`/admin/users?page=${page}${searchQuery ? `&search=${searchQuery}` : ''
                                }`}
                              isActive={page === users.current_page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      // Add ellipsis
                      if (
                        (page === 2 && users.current_page > 3) ||
                        (page === users.last_page - 1 &&
                          users.current_page < users.last_page - 2)
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

                  {users.current_page < users.last_page && (
                    <PaginationItem>
                      <PaginationNext
                        href={`/admin/users?page=${users.current_page + 1}${searchQuery ? `&search=${searchQuery}` : ''
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

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteUserId !== null}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบผู้ใช้งาน</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานรายนี้?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
} 