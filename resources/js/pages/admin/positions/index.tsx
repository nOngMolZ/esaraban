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

interface Position {
  id: number;
  name: string;
  description: string | null;
  users_count: number;
  created_at: string;
  updated_at: string;
}

interface IndexProps {
  positions: {
    data: Position[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export default function Index({ positions }: IndexProps) {
  const [deletePositionId, setDeletePositionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/positions', { search: searchQuery }, { preserveState: true });
  };

  const handleDelete = () => {
    if (deletePositionId) {
      router.delete(`/admin/positions/${deletePositionId}`, {
        onSuccess: () => setDeletePositionId(null),
      });
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'จัดการตำแหน่ง', href: '/admin/positions' }]}>
      <Head title="จัดการตำแหน่ง" />

      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">จัดการตำแหน่ง</h1>
          <Button asChild>
            <Link href="/admin/positions/create">
              <Plus className="mr-2 h-4 w-4" />
              สร้างตำแหน่งใหม่
            </Link>
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>ตำแหน่งทั้งหมด</CardTitle>
            <CardDescription>
              รายการตำแหน่งทั้งหมดในระบบ จำนวน {positions.total} ตำแหน่ง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex mb-4 gap-2">
              <Input
                placeholder="ค้นหาจากชื่อตำแหน่ง"
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
                    <TableHead>ชื่อตำแหน่ง</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                    <TableHead>จำนวนผู้ใช้งาน</TableHead>
                    <TableHead className="w-[100px] text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.data.length > 0 ? (
                    positions.data.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell className="font-medium">{position.name}</TableCell>
                        <TableCell>{position.description || '-'}</TableCell>
                        <TableCell>{position.users_count} คน</TableCell>
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
                                <Link href={`/admin/positions/${position.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  ดูรายละเอียด
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/positions/${position.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  แก้ไข
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletePositionId(position.id)}
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
                        ไม่พบข้อมูลตำแหน่ง
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  {positions.current_page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={`/admin/positions?page=${positions.current_page - 1}${searchQuery ? `&search=${searchQuery}` : ''
                          }`}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: positions.last_page }, (_, i) => i + 1).map(
                    (page) => {
                      // Only show pages nearby current page
                      if (
                        page === 1 ||
                        page === positions.last_page ||
                        (page >= positions.current_page - 1 &&
                          page <= positions.current_page + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href={`/admin/positions?page=${page}${searchQuery ? `&search=${searchQuery}` : ''
                                }`}
                              isActive={page === positions.current_page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      // Add ellipsis
                      if (
                        (page === 2 && positions.current_page > 3) ||
                        (page === positions.last_page - 1 &&
                          positions.current_page < positions.last_page - 2)
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

                  {positions.current_page < positions.last_page && (
                    <PaginationItem>
                      <PaginationNext
                        href={`/admin/positions?page=${positions.current_page + 1}${searchQuery ? `&search=${searchQuery}` : ''
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

      <AlertDialog open={deletePositionId !== null} onOpenChange={() => setDeletePositionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบตำแหน่ง</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบตำแหน่งนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
              หากมีผู้ใช้งานอยู่ในตำแหน่งนี้ คุณจะไม่สามารถลบได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
} 