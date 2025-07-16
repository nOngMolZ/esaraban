import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Pencil } from 'lucide-react';

interface User {
  id: number;
  fname: string;
  lname: string;
  email: string;
  position?: {
    id: number;
    name: string;
  } | null;
}

interface Department {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  users: User[];
}

interface ShowProps {
  department: Department;
}

export default function Show({ department }: ShowProps) {
  return (
    <AppLayout
      breadcrumbs={[
        { title: 'จัดการแผนก', href: '/admin/departments' },
        { title: department.name, href: `/admin/departments/${department.id}` },
      ]}
    >
      <Head title={`แผนก ${department.name}`} />

      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/departments">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">แผนก {department.name}</h1>
          </div>
          <Button asChild>
            <Link href={`/admin/departments/${department.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              แก้ไขแผนก
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลแผนก</CardTitle>
              <CardDescription>
                รายละเอียดของแผนก {department.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[1fr_2fr] gap-4">
                <dt className="font-semibold">ชื่อแผนก</dt>
                <dd>{department.name}</dd>

                <dt className="font-semibold">รายละเอียด</dt>
                <dd>{department.description || '-'}</dd>

                <dt className="font-semibold">จำนวนผู้ใช้งาน</dt>
                <dd>{department.users.length} คน</dd>

                <dt className="font-semibold">วันที่สร้าง</dt>
                <dd>{new Date(department.created_at).toLocaleDateString('th-TH')}</dd>

                <dt className="font-semibold">วันที่อัปเดตล่าสุด</dt>
                <dd>{new Date(department.updated_at).toLocaleDateString('th-TH')}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ผู้ใช้งานในแผนก</CardTitle>
              <CardDescription>
                รายชื่อผู้ใช้งานที่อยู่ในแผนก {department.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {department.users.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ชื่อ-นามสกุล</TableHead>
                        <TableHead>ตำแหน่ง</TableHead>
                        <TableHead>อีเมล</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {department.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {user.fname} {user.lname}
                            </Link>
                          </TableCell>
                          <TableCell>{user.position?.name || '-'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  ไม่มีผู้ใช้งานในแผนกนี้
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 