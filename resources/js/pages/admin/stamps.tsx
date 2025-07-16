import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Plus, 
    Upload, 
    Edit, 
    Trash2, 
    Image as ImageIcon,
    Stamp,
    AlertCircle,
    CheckCircle,
    Filter
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface StampItem {
    id: number;
    name: string;
    category: string;
    file_path: string;
    preview_url: string;
    created_at: string;
    updated_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedStamps {
    data: StampItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    stamps: PaginatedStamps;
    categories: string[];
    filters: {
        search?: string;
        category?: string;
    };
}

export default function StampsAdmin({ stamps, categories, filters }: Props) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingStamp, setEditingStamp] = useState<StampItem | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');

    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: resetAdd } = useForm({
        name: '',
        category: '',
        file: null as File | null,
    });

    const { data: editData, setData: setEditData, post: postEdit, processing: editProcessing, errors: editErrors } = useForm({
        name: '',
        category: '',
        file: null as File | null,
        _method: 'PUT',
    });

    const handleSearch = () => {
        router.get(route('admin.stamps.index'), {
            search: searchTerm,
            category: selectedCategory,
        }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedCategory('');
        router.get(route('admin.stamps.index'));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
        const file = e.target.files?.[0];
        if (file) {
            // ตรวจสอบชนิดไฟล์
            if (!file.type.startsWith('image/')) {
                alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
                return;
            }

            // ตรวจสอบขนาดไฟล์ (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('ไฟล์มีขนาดใหญ่เกิน 5MB');
                return;
            }

            setSelectedFile(file);
            
            // สร้าง preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);

            if (isEdit) {
                setEditData('file', file);
            } else {
                setAddData('file', file);
            }
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!addData.file) {
            alert('กรุณาเลือกไฟล์รูปภาพ');
            return;
        }

        postAdd(route('admin.stamps.store'), {
            onSuccess: () => {
                setIsAddDialogOpen(false);
                resetAdd();
                setSelectedFile(null);
                setPreviewUrl('');
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingStamp) return;

        postEdit(route('admin.stamps.update', editingStamp.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingStamp(null);
                setSelectedFile(null);
                setPreviewUrl('');
            }
        });
    };

    const handleEdit = (stamp: StampItem) => {
        setEditingStamp(stamp);
        setEditData({
            name: stamp.name,
            category: stamp.category,
            file: null,
            _method: 'PUT',
        });
        setPreviewUrl(stamp.preview_url);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (stamp: StampItem) => {
        if (confirm(`คุณแน่ใจหรือไม่ที่จะลบตรา "${stamp.name}"?`)) {
            router.delete(route('admin.stamps.destroy', stamp.id));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        จัดการคลังตราประทับ
                    </h2>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                เพิ่มตราประทับ
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <form onSubmit={handleAddSubmit}>
                                <DialogHeader>
                                    <DialogTitle>เพิ่มตราประทับใหม่</DialogTitle>
                                    <DialogDescription>
                                        อัปโหลดไฟล์รูปภาพสำหรับตราประทับ (PNG, JPG, JPEG)
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="add-name">ชื่อตรา *</Label>
                                        <Input
                                            id="add-name"
                                            value={addData.name}
                                            onChange={(e) => setAddData('name', e.target.value)}
                                            placeholder="กรอกชื่อตราประทับ"
                                            className={addErrors.name ? 'border-red-500' : ''}
                                        />
                                        {addErrors.name && (
                                            <p className="text-sm text-red-500">{addErrors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="add-category">หมวดหมู่</Label>
                                        <Select value={addData.category} onValueChange={(value) => setAddData('category', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกหมวดหมู่" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ตราราชการ">ตราราชการ</SelectItem>
                                                <SelectItem value="ตราภาคเอกชน">ตราภาคเอกชน</SelectItem>
                                                <SelectItem value="ตราสถาบันการศึกษา">ตราสถาบันการศึกษา</SelectItem>
                                                <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {addErrors.category && (
                                            <p className="text-sm text-red-500">{addErrors.category}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="add-file">ไฟล์รูปภาพ *</Label>
                                        <Input
                                            id="add-file"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, false)}
                                            className={addErrors.file ? 'border-red-500' : ''}
                                        />
                                        {addErrors.file && (
                                            <p className="text-sm text-red-500">{addErrors.file}</p>
                                        )}
                                        
                                        {previewUrl && (
                                            <div className="mt-3">
                                                <Label>ตัวอย่าง:</Label>
                                                <div className="mt-1 p-3 border rounded-lg bg-gray-50">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-20 h-20 object-contain mx-auto"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddDialogOpen(false);
                                            resetAdd();
                                            setSelectedFile(null);
                                            setPreviewUrl('');
                                        }}
                                        disabled={addProcessing}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button type="submit" disabled={addProcessing}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        {addProcessing ? 'กำลังอัปโหลด...' : 'เพิ่มตรา'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >
            <Head title="จัดการคลังตราประทับ" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* ส่วนค้นหาและกรอง */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                ค้นหาและกรองตราประทับ
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>ค้นหา</Label>
                                    <Input
                                        placeholder="ชื่อตราประทับ"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>หมวดหมู่</Label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="ทุกหมวดหมู่" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>การดำเนินการ</Label>
                                    <div className="flex gap-2">
                                        <Button onClick={handleSearch} className="flex-1">
                                            ค้นหา
                                        </Button>
                                        <Button variant="outline" onClick={handleReset}>
                                            รีเซ็ต
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ตารางตราประทับ */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stamp className="w-5 h-5" />
                                คลังตราประทับ ({stamps.total} รายการ)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stamps.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">ไม่มีตราประทับ</p>
                                    <p className="text-gray-400 text-sm">เริ่มต้นโดยการเพิ่มตราประทับใหม่</p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-20">ตัวอย่าง</TableHead>
                                                <TableHead>ชื่อตรา</TableHead>
                                                <TableHead>หมวดหมู่</TableHead>
                                                <TableHead>วันที่เพิ่ม</TableHead>
                                                <TableHead className="text-right">การดำเนินการ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stamps.data.map((stamp) => (
                                                <TableRow key={stamp.id} className="hover:bg-gray-50">
                                                    <TableCell>
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <img
                                                                src={stamp.preview_url}
                                                                alt={stamp.name}
                                                                className="w-10 h-10 object-contain"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-medium">{stamp.name}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{stamp.category}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm text-gray-600">
                                                            {formatDate(stamp.created_at)}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(stamp)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(stamp)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {stamps.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="text-sm text-gray-500">
                                                แสดง {((stamps.current_page - 1) * stamps.per_page) + 1} ถึง{' '}
                                                {Math.min(stamps.current_page * stamps.per_page, stamps.total)} จาก{' '}
                                                {stamps.total} รายการ
                                            </div>
                                            <div className="flex gap-2">
                                                {stamps.links.map((link, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={link.active ? "default" : "outline"}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url)}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle>แก้ไขตราประทับ</DialogTitle>
                            <DialogDescription>
                                แก้ไขข้อมูลตราประทับ (เลือกไฟล์ใหม่หากต้องการเปลี่ยนรูปภาพ)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">ชื่อตรา *</Label>
                                <Input
                                    id="edit-name"
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    placeholder="กรอกชื่อตราประทับ"
                                    className={editErrors.name ? 'border-red-500' : ''}
                                />
                                {editErrors.name && (
                                    <p className="text-sm text-red-500">{editErrors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-category">หมวดหมู่</Label>
                                <Select value={editData.category} onValueChange={(value) => setEditData('category', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกหมวดหมู่" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ตราราชการ">ตราราชการ</SelectItem>
                                        <SelectItem value="ตราภาคเอกชน">ตราภาคเอกชน</SelectItem>
                                        <SelectItem value="ตราสถาบันการศึกษา">ตราสถาบันการศึกษา</SelectItem>
                                        <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                                    </SelectContent>
                                </Select>
                                {editErrors.category && (
                                    <p className="text-sm text-red-500">{editErrors.category}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-file">ไฟล์รูปภาพใหม่ (เลือกเมื่อต้องการเปลี่ยน)</Label>
                                <Input
                                    id="edit-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, true)}
                                    className={editErrors.file ? 'border-red-500' : ''}
                                />
                                {editErrors.file && (
                                    <p className="text-sm text-red-500">{editErrors.file}</p>
                                )}
                                
                                {previewUrl && (
                                    <div className="mt-3">
                                        <Label>ตัวอย่าง:</Label>
                                        <div className="mt-1 p-3 border rounded-lg bg-gray-50">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-20 h-20 object-contain mx-auto"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false);
                                    setEditingStamp(null);
                                    setSelectedFile(null);
                                    setPreviewUrl('');
                                }}
                                disabled={editProcessing}
                            >
                                ยกเลิก
                            </Button>
                            <Button type="submit" disabled={editProcessing}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {editProcessing ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
} 