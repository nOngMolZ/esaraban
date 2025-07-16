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

interface DocumentType {
  id: number;
  name: string;
  description: string | null;
}

interface EditProps {
  documentType: DocumentType;
}

export default function Edit({ documentType }: EditProps) {
  const { data, setData, patch, processing, errors } = useForm({
    name: documentType.name || '',
    description: documentType.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(`/admin/document-types/${documentType.id}`);
  };

  return (
    <AppLayout 
      breadcrumbs={[
        { title: 'จัดการประเภทเอกสาร', href: '/admin/document-types' },
        { title: 'แก้ไขประเภทเอกสาร', href: `/admin/document-types/${documentType.id}/edit` },
      ]}
    >
      <Head title="แก้ไขประเภทเอกสาร" />

      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">แก้ไขประเภทเอกสาร</h1>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>ข้อมูลประเภทเอกสาร</CardTitle>
            <CardDescription>แก้ไขข้อมูลประเภทเอกสาร "{documentType.name}"</CardDescription>
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