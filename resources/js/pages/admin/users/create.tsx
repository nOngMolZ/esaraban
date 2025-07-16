import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Department, Position, Role } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';

interface CreateProps {
  departments: Department[];
  positions: Position[];
  roles: Role[];
}

export default function Create({ departments, positions, roles }: CreateProps) {
  const form = useForm({
    fname: '',
    lname: '',
    email: '',
    password: '',
    password_confirmation: '',
    department_id: '',
    position_id: '',
    role_id: '',
    is_active: true,
  });

  const { data, setData, post, processing, errors } = form;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/users');
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'จัดการผู้ใช้งาน', href: '/admin/users' }]}>
      <Head title="เพิ่มผู้ใช้งานใหม่" />

      <div className="container mx-auto py-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">เพิ่มผู้ใช้งานใหม่</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>ข้อมูลผู้ใช้งาน</CardTitle>
              <CardDescription>
                กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานใหม่
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="fname" className="text-sm font-medium">
                    ชื่อ <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="fname"
                    placeholder="ชื่อ"
                    value={data.fname}
                    onChange={(e) => setData('fname', e.target.value)}
                  />
                  {errors.fname && (
                    <p className="text-sm text-destructive">{errors.fname}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="lname" className="text-sm font-medium">
                    นามสกุล <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="lname"
                    placeholder="นามสกุล"
                    value={data.lname}
                    onChange={(e) => setData('lname', e.target.value)}
                  />
                  {errors.lname && (
                    <p className="text-sm text-destructive">{errors.lname}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  อีเมล <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="อีเมล"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    รหัสผ่าน <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="รหัสผ่าน"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password_confirmation" className="text-sm font-medium">
                    ยืนยันรหัสผ่าน <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    placeholder="ยืนยันรหัสผ่าน"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="department_id" className="text-sm font-medium">
                    แผนก
                  </label>
                  <Select
                    value={data.department_id}
                    onValueChange={(value) => setData('department_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกแผนก" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id.toString()}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department_id && (
                    <p className="text-sm text-destructive">{errors.department_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="position_id" className="text-sm font-medium">
                    ตำแหน่ง
                  </label>
                  <Select
                    value={data.position_id}
                    onValueChange={(value) => setData('position_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id.toString()}>
                          {position.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.position_id && (
                    <p className="text-sm text-destructive">{errors.position_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="role_id" className="text-sm font-medium">
                    บทบาท <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={data.role_id}
                    onValueChange={(value) => setData('role_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกบทบาท" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role_id && (
                    <p className="text-sm text-destructive">{errors.role_id}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  เปิดใช้งาน
                </label>
                {errors.is_active && (
                  <p className="text-sm text-destructive">{errors.is_active}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/admin/users">ยกเลิก</Link>
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
} 