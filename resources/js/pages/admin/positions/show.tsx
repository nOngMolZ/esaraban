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
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Pencil, ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Position {
  id: number;
  name: string;
  description: string | null;
  users: User[];
  created_at: string;
  updated_at: string;
}

interface ShowProps {
  position: Position;
}

export default function Show({ position }: ShowProps) {
  return (
    <AppLayout breadcrumbs={[
      { title: 'จัดการตำแหน่ง', href: '/admin/positions' },
      { title: position.name, href: `/admin/positions/${position.id}` }
    ]}>
      <Head title={`ตำแหน่ง ${position.name}`} />

      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">ตำแหน่ง: {position.name}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/admin/positions">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับ
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/positions/${position.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                แก้ไข
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลตำแหน่ง</CardTitle>
              <CardDescription>รายละเอียดของตำแหน่ง</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">ชื่อตำแหน่ง</h3>
                <p className="mt-1">{position.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">รายละเอียด</h3>
                <p className="mt-1">{position.description || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">วันที่สร้าง</h3>
                <p className="mt-1">
                  {format(new Date(position.created_at), 'PPPp', { locale: th })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">วันที่แก้ไขล่าสุด</h3>
                <p className="mt-1">
                  {format(new Date(position.updated_at), 'PPPp', { locale: th })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ผู้ใช้งานในตำแหน่งนี้</CardTitle>
              <CardDescription>รายชื่อผู้ใช้งานที่มีตำแหน่งนี้</CardDescription>
            </CardHeader>
            <CardContent>
              {position.users.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ชื่อ</TableHead>
                        <TableHead>อีเมล</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {position.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <Link href={`/admin/users/${user.id}`} className="text-primary hover:underline">
                              {user.name}
                            </Link>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">ไม่พบผู้ใช้งานในตำแหน่งนี้</p>
              )}
            </CardContent>
            <CardFooter>
              <div className="text-sm text-gray-500">
                จำนวนผู้ใช้งานทั้งหมด: {position.users.length} คน
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 