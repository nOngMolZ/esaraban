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
import { User } from '@/types';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
interface ShowProps {
  user: User;
}

export default function Show({ user }: ShowProps) {
  return (
    <AppLayout breadcrumbs={[{ title: 'จัดการผู้ใช้งาน', href: '/admin/users' }]}>
      <Head title={`รายละเอียดผู้ใช้: ${user.fname} ${user.lname}`} />

      <div className="container mx-auto py-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            รายละเอียดผู้ใช้: {user.fname} {user.lname}
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลส่วนตัว</CardTitle>
              <CardDescription>
                ข้อมูลส่วนตัวของผู้ใช้งาน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ชื่อ</h3>
                  <p>{user.fname}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">นามสกุล</h3>
                  <p>{user.lname}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">อีเมล</h3>
                <p>{user.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">สถานะ</h3>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลภายในองค์กร</CardTitle>
              <CardDescription>
                ข้อมูลแผนก ตำแหน่ง และบทบาทของผู้ใช้งาน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">แผนก</h3>
                <p>{user.department?.name || '-'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ตำแหน่ง</h3>
                <p>{user.position?.name || '-'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">บทบาท</h3>
                <p>{user.role?.name || '-'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลระบบ</CardTitle>
            <CardDescription>
              ข้อมูลเกี่ยวกับระบบของผู้ใช้งาน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">วันที่สร้าง</h3>
                <p>{user.created_at ? new Date(user.created_at).toLocaleString('th-TH') : '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">แก้ไขล่าสุด</h3>
                <p>{user.updated_at ? new Date(user.updated_at).toLocaleString('th-TH') : '-'}</p>
              </div>
            </div>

            {user.email_verified_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ยืนยันอีเมลเมื่อ</h3>
                <p>{new Date(user.email_verified_at).toLocaleString('th-TH')}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href={`/admin/users/${user.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                แก้ไขข้อมูล
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
} 