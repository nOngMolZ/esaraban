import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface Position {
  id: number;
  name: string;
  description: string | null;
}

interface EditProps {
  position: Position;
}

export default function Edit({ position }: EditProps) {
  const [formData, setFormData] = useState({
    name: position.name,
    description: position.description || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.patch(`/admin/positions/${position.id}`, formData, {
      onError: (errors) => setErrors(errors),
      preserveScroll: true
    });
  };

  return (
    <AppLayout breadcrumbs={[
      { title: 'จัดการตำแหน่ง', href: '/admin/positions' },
      { title: 'แก้ไขตำแหน่ง', href: `/admin/positions/${position.id}/edit` }
    ]}>
      <Head title="แก้ไขตำแหน่ง" />

      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold tracking-tight">แก้ไขตำแหน่ง</h1>

        <Card className="max-w-2xl mt-6">
          <CardHeader>
            <CardTitle>ข้อมูลตำแหน่ง</CardTitle>
            <CardDescription>
              แก้ไขข้อมูลตำแหน่ง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อตำแหน่ง <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="กรอกชื่อตำแหน่ง"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="กรอกรายละเอียดตำแหน่ง (ถ้ามี)"
                  className={errors.description ? 'border-destructive' : ''}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.get('/admin/positions')}
                >
                  ยกเลิก
                </Button>
                <Button type="submit">บันทึกการเปลี่ยนแปลง</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 