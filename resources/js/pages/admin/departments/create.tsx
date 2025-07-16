import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft } from 'lucide-react';

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/departments', {
      onSuccess: () => {
        // Redirect happens automatically
      },
    });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'จัดการแผนก', href: '/admin/departments' },
        { title: 'สร้างแผนกใหม่', href: '/admin/departments/create' },
      ]}
    >
      <Head title="สร้างแผนกใหม่" />

      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/departments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">สร้างแผนกใหม่</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลแผนก</CardTitle>
            <CardDescription>
              กรอกข้อมูลแผนกที่ต้องการสร้าง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="required">
                  ชื่อแผนก
                </Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={5}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  asChild
                >
                  <Link href="/admin/departments">ยกเลิก</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={processing}
                >
                  บันทึก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 