<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Seed ข้อมูลแผนกต่างๆ ในโรงเรียน
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'ฝ่ายบริหาร',
                'description' => 'ฝ่ายบริหารงานทั่วไป ผู้อำนวยการ รองผู้อำนวยการ',
            ],
            [
                'name' => 'ฝ่ายวิชาการ',
                'description' => 'ฝ่ายวิชาการและหลักสูตร งานพัฒนาการเรียนการสอน',
            ],
            [
                'name' => 'ฝ่ายกิจการนักเรียน',
                'description' => 'ฝ่ายดูแลกิจกรรมนักเรียน งานปกครอง งานแนะแนว',
            ],
            [
                'name' => 'ฝ่ายการเงินและพัสดุ',
                'description' => 'ฝ่ายการเงิน การบัญชี และการจัดซื้อจัดจ้าง',
            ],
            [
                'name' => 'ฝ่ายบุคลากร',
                'description' => 'ฝ่ายบริหารงานบุคคล การพัฒนาบุคลากร',
            ],
            [
                'name' => 'ฝ่ายสารบรรณ',
                'description' => 'ฝ่ายงานสารบรรณ เอกสาร และประชาสัมพันธ์',
            ],
            [
                'name' => 'ฝ่ายอาคารสถานที่',
                'description' => 'ฝ่ายดูแลอาคารสถานที่ สิ่งแวดล้อม และความปลอดภัย',
            ],
            [
                'name' => 'ฝ่ายเทคโนโลยี',
                'description' => 'ฝ่ายเทคโนโลยีสารสนเทศ ระบบคอมพิวเตอร์',
            ],
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }

        $this->command->info('✅ สร้างข้อมูลแผนก ' . count($departments) . ' แผนก เรียบร้อย');
    }
}

