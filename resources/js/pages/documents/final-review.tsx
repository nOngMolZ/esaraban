import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Eye, 
  FileText, 
  Users, 
  Clock,
  Calendar,
  Building2,
  UserCheck,
  Globe,
  Lock
} from 'lucide-react';

interface Document {
  id: number;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  documentType: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    fname: string;
    lname: string;
  };
}

interface Signature {
  id: number;
  user_name: string;
  position: string;
  step: number;
  signer_type: string;
  signed_at: string;
  signature_data: any;
}

interface Stamp {
  id: number;
  stamp_name: string;
  position_data: any;
  user_name: string;
  stamp_url: string;
}

interface User {
  id: number;
  fname: string;
  lname: string;
  email: string;
  department: {
    id: number;
    name: string;
  };
  position: {
    id: number;
    name: string;
  };
}

interface Department {
  id: number;
  name: string;
}

interface Props {
  document: Document;
  signatures: Signature[];
  stamps: Stamp[];
  departments: Department[];
  users: User[];
  fileUrl: string;
}

export default function FinalReview({ 
  document, 
  signatures, 
  stamps, 
  departments, 
  users, 
  fileUrl 
}: Props) {
  const [accessType, setAccessType] = useState<'public' | 'restricted'>('restricted');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // กรองผู้ใช้ตามแผนก
  const filteredUsers = selectedDepartment
    ? users.filter(user => user.department.id.toString() === selectedDepartment)
    : users;

  const handleUserSelect = (userId: number, checked: boolean) => {
    setSelectedUsers(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = () => {
    const allUserIds = filteredUsers.map(user => user.id);
    setSelectedUsers(allUserIds);
  };

  const handleClearAll = () => {
    setSelectedUsers([]);
  };

  const handleSubmit = () => {
    if (accessType === 'restricted' && selectedUsers.length === 0) {
      toast.error('กรุณาเลือกผู้รับเอกสารอย่างน้อย 1 คน');
      return;
    }

    setIsSubmitting(true);

    router.post(`/documents/${document.id}/complete`, {
      access_type: accessType,
      is_public: isPublic,
      recipient_ids: accessType === 'restricted' ? selectedUsers : []
    }, {
      onSuccess: () => {
        toast.success('เสร็จสิ้นกระบวนการเอกสารเรียบร้อยแล้ว');
      },
      onError: (errors) => {
        console.error('Error:', errors);
        toast.error(errors.general || 'เกิดข้อผิดพลาดในการเสร็จสิ้นกระบวนการ');
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
              ตรวจสอบเอกสารขั้นสุดท้าย
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              ตรวจสอบความถูกต้องและกำหนดสิทธิ์การเข้าถึงเอกสาร
            </p>
          </div>
        </div>
      }
    >
      <Head title="ตรวจสอบเอกสารขั้นสุดท้าย" />

      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* หน้าแสดงเอกสาร */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {document.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(document.created_at).toLocaleDateString('th-TH')}
                    </span>
                    <Badge variant="outline">
                      {document.documentType?.name || 'ไม่ระบุ'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[4/5] bg-gray-100 rounded-lg flex items-center justify-center">
                    <iframe
                      src={fileUrl}
                      className="w-full h-full rounded-lg"
                      title="Document Preview"
                    />
                  </div>
                  
                  {/* สรุปลายเซ็นและตรา */}
                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium">สรุปการลงนามและตราประทับ</h3>
                    
                    {/* ลายเซ็น */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">ลายเซ็น ({signatures.length})</h4>
                      <div className="space-y-2">
                        {signatures.map((signature, index) => (
                          <div key={signature.id} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{signature.user_name}</p>
                              <p className="text-xs text-gray-600">{signature.position}</p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(signature.signed_at).toLocaleDateString('th-TH')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ตราประทับ */}
                    {stamps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">ตราประทับ ({stamps.length})</h4>
                        <div className="space-y-2">
                          {stamps.map((stamp, index) => (
                            <div key={stamp.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                              <div className="w-8 h-8 bg-white rounded border flex items-center justify-center">
                                <img 
                                  src={stamp.stamp_url} 
                                  alt={stamp.stamp_name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{stamp.stamp_name}</p>
                                <p className="text-xs text-gray-600">วางโดย: {stamp.user_name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* แผงควบคุม */}
            <div className="space-y-6">
              
              {/* ข้อมูลเอกสาร */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ข้อมูลเอกสาร</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">ชื่อเอกสาร</Label>
                    <p className="text-sm text-gray-600">{document.title}</p>
                  </div>
                  {document.description && (
                    <div>
                      <Label className="text-sm font-medium">คำอธิบาย</Label>
                      <p className="text-sm text-gray-600">{document.description}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">ประเภทเอกสาร</Label>
                    <p className="text-sm text-gray-600">{document.documentType?.name || 'ไม่ระบุ'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ผู้สร้าง</Label>
                    <p className="text-sm text-gray-600">
                      {document.user.fname} {document.user.lname}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* กำหนดสิทธิ์การเข้าถึง */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">กำหนดสิทธิ์การเข้าถึง</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* ประเภทการเข้าถึง */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">ประเภทการเข้าถึง</Label>
                    <RadioGroup 
                      value={accessType} 
                      onValueChange={(value: 'public' | 'restricted') => setAccessType(value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                          <Globe className="h-4 w-4" />
                          เอกสารสาธารณะ
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="restricted" id="restricted" />
                        <Label htmlFor="restricted" className="flex items-center gap-2 cursor-pointer">
                          <Lock className="h-4 w-4" />
                          เอกสารจำกัดสิทธิ์
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* เผยแพร่สาธารณะ */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="is_public" 
                      checked={isPublic}
                      onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                    />
                    <Label htmlFor="is_public" className="text-sm">
                      แสดงในหน้าเอกสารสาธารณะ
                    </Label>
                  </div>

                  {/* เลือกผู้รับเอกสาร */}
                  {accessType === 'restricted' && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">เลือกผู้รับเอกสาร</Label>
                      
                      {/* กรองตามแผนก */}
                      <div>
                        <Label className="text-xs text-gray-600">กรองตามแผนก</Label>
                        <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm"
                        >
                          <option value="">แผนกทั้งหมด</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* ปุ่มเลือกทั้งหมด/ยกเลิก */}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                          className="flex-1"
                        >
                          เลือกทั้งหมด
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearAll}
                          className="flex-1"
                        >
                          ยกเลิกทั้งหมด
                        </Button>
                      </div>

                      {/* รายการผู้ใช้ */}
                      <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                        {filteredUsers.map(user => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
                            />
                            <Label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {user.fname} {user.lname}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {user.position.name} • {user.department.name}
                                </span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-600">
                        เลือกแล้ว: {selectedUsers.length} คน
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ปุ่มดำเนินการ */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (accessType === 'restricted' && selectedUsers.length === 0)}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        กำลังเสร็จสิ้นกระบวนการ...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        เสร็จสิ้นกระบวนการ
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
} 