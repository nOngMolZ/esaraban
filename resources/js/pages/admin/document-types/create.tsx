import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/document-types');
  };

  return (
    <AppLayout 
      breadcrumbs={[
        { title: 'จัดการประเภทเอกสาร', href: '/admin/document-types' },
        { title: 'สร้างประเภทเอกสารใหม่', href: '/admin/document-types/create' },
      ]}
    >
      <Head title="สร้างประเภทเอกสารใหม่" />

      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">สร้างประเภทเอกสารใหม่</h1>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>ข้อมูลประเภทเอกสาร</CardTitle>
            <CardDescription>กรอกข้อมูลประเภทเอกสารที่ต้องการสร้างใหม่</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อประเภทเอกสาร <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="ระบุชื่อประเภทเอกสาร"
                  required
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="ระบุรายละเอียดของประเภทเอกสาร (ไม่บังคับ)"
                  rows={5}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                asChild
              >
                <Link href="/admin/document-types">ยกเลิก</Link>
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