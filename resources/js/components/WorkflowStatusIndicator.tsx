import React from 'react';
import { CheckCircle, Clock, XCircle, Users, FileText, Stamp, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WorkflowStep {
    step: number;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'pending' | 'rejected';
    user?: string;
    timestamp?: string;
}

interface Props {
    status: string;
    currentStep: number;
    isCompact?: boolean;
}

export default function WorkflowStatusIndicator({ status, currentStep, isCompact = false }: Props) {
    const getWorkflowSteps = (): WorkflowStep[] => {
        const steps: WorkflowStep[] = [
            {
                step: 1,
                title: 'รองผู้อำนวยการลงนาม (ครั้งที่ 1)',
                description: 'รอการอนุมัติและลงนามจากรองผู้อำนวยการ',
                status: 'pending'
            },
            {
                step: 2,
                title: 'ผู้อำนวยการลงนาม',
                description: 'รอการอนุมัติและลงนามจากผู้อำนวยการ',
                status: 'pending'
            },
            {
                step: 3,
                title: 'กระจายเอกสาร',
                description: 'ส่งเอกสารไปยังผู้รับที่เกี่ยวข้อง',
                status: 'pending'
            },
            {
                step: 4,
                title: 'จัดการตราประทับ',
                description: 'ประทับตราและเลือกผู้ลงนามรอบสุดท้าย',
                status: 'pending'
            },
            {
                step: 5,
                title: 'รองผู้อำนวยการลงนาม (ครั้งที่ 2)',
                description: 'ลงนามขั้นสุดท้ายจากรองผู้อำนวยการ',
                status: 'pending'
            },
            {
                step: 6,
                title: 'ตรวจสอบและเผยแพร่',
                description: 'ตรวจสอบขั้นสุดท้ายและกำหนดการเผยแพร่',
                status: 'pending'
            },
            {
                step: 7,
                title: 'เสร็จสิ้น',
                description: 'กระบวนการสำเร็จสมบูรณ์',
                status: 'pending'
            }
        ];

        // อัพเดตสถานะตาม status ปัจจุบัน
        switch (status) {
            case 'pending_deputy_director_1':
                steps[0].status = 'current';
                break;
            case 'pending_director':
                steps[0].status = 'completed';
                steps[1].status = 'current';
                break;
            case 'pending_distribution':
                steps[0].status = 'completed';
                steps[1].status = 'completed';
                steps[2].status = 'current';
                break;
            case 'pending_stamp':
                steps[0].status = 'completed';
                steps[1].status = 'completed';
                steps[2].status = 'completed';
                steps[3].status = 'current';
                break;
            case 'pending_deputy_director_2':
                steps[0].status = 'completed';
                steps[1].status = 'completed';
                steps[2].status = 'completed';
                steps[3].status = 'completed';
                steps[4].status = 'current';
                break;
            case 'pending_final_review':
                steps[0].status = 'completed';
                steps[1].status = 'completed';
                steps[2].status = 'completed';
                steps[3].status = 'completed';
                steps[4].status = 'completed';
                steps[5].status = 'current';
                break;
            case 'completed':
                steps.forEach(step => step.status = 'completed');
                break;
            case 'rejected_by_deputy_1':
                steps[0].status = 'rejected';
                break;
            case 'rejected_by_director':
                steps[0].status = 'completed';
                steps[1].status = 'rejected';
                break;
            case 'rejected_by_deputy_2':
                steps[0].status = 'completed';
                steps[1].status = 'completed';
                steps[2].status = 'completed';
                steps[3].status = 'completed';
                steps[4].status = 'rejected';
                break;
        }

        return steps;
    };

    const getStatusBadge = () => {
        switch (status) {
            case 'pending_deputy_director_1':
            case 'pending_director':
            case 'pending_distribution':
            case 'pending_stamp':
            case 'pending_deputy_director_2':
            case 'pending_final_review':
                return <Badge variant="outline" className="text-blue-600 border-blue-600">กำลังดำเนินการ</Badge>;
            case 'completed':
                return <Badge variant="outline" className="text-green-600 border-green-600">เสร็จสิ้น</Badge>;
            case 'rejected_by_deputy_1':
            case 'rejected_by_director':
            case 'rejected_by_deputy_2':
                return <Badge variant="outline" className="text-red-600 border-red-600">ถูกปฏิเสธ</Badge>;
            default:
                return <Badge variant="outline">ไม่ทราบสถานะ</Badge>;
        }
    };

    const getStepIcon = (step: WorkflowStep) => {
        switch (step.status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'current':
                return <Clock className="w-5 h-5 text-blue-600" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
        }
    };

    const getProgress = () => {
        const completedSteps = getWorkflowSteps().filter(step => step.status === 'completed').length;
        return (completedSteps / 7) * 100;
    };

    const steps = getWorkflowSteps();

    if (isCompact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">สถานะ:</span>
                    {getStatusBadge()}
                </div>
                <Progress value={getProgress()} className="h-2" />
                <div className="text-xs text-gray-500">
                    ขั้นตอน {Math.max(1, steps.filter(s => s.status === 'completed').length + (steps.some(s => s.status === 'current') ? 1 : 0))} จาก 7
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">สถานะการดำเนินการ</h3>
                {getStatusBadge()}
            </div>

            <Progress value={getProgress()} className="h-3" />

            <div className="space-y-4">
                {steps.map((step, index) => (
                    <div key={step.step} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                            {getStepIcon(step)}
                            {index < steps.length - 1 && (
                                <div className={`w-0.5 h-8 mt-2 ${
                                    step.status === 'completed' 
                                        ? 'bg-green-600' 
                                        : step.status === 'rejected'
                                        ? 'bg-red-600'
                                        : 'bg-gray-300'
                                }`} />
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className={`font-medium ${
                                    step.status === 'completed' 
                                        ? 'text-green-700' 
                                        : step.status === 'current'
                                        ? 'text-blue-700'
                                        : step.status === 'rejected'
                                        ? 'text-red-700'
                                        : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </h4>
                                {step.status === 'current' && (
                                    <Badge variant="outline" className="text-xs">กำลังดำเนินการ</Badge>
                                )}
                            </div>
                            
                            <p className={`text-sm mt-1 ${
                                step.status === 'completed' || step.status === 'current'
                                    ? 'text-gray-600'
                                    : 'text-gray-400'
                            }`}>
                                {step.description}
                            </p>
                            
                            {step.user && (
                                <p className="text-xs text-gray-500 mt-1">
                                    โดย: {step.user}
                                </p>
                            )}
                            
                            {step.timestamp && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(step.timestamp).toLocaleString('th-TH')}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 