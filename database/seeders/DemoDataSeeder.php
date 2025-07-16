<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed ข้อมูลตัวอย่างเอกสารสำหรับการ demo
     */
    public function run(): void
    {
        // ดึงข้อมูลที่จำเป็น
        $users = User::all();
        $documentTypes = DocumentType::all();
        $departments = Department::all();

        if ($users->isEmpty() || $documentTypes->isEmpty()) {
            $this->command->warn('⚠️ ไม่พบข้อมูลผู้ใช้หรือประเภทเอกสาร กรุณา seed ข้อมูลพื้นฐานก่อน');
            return;
        }

        // ข้อมูลเอกสารตัวอย่าง
        $sampleDocuments = [
            [
                'title' => 'คำสั่งแต่งตั้งคณะกรรมการดำเนินงานปีการศึกษา 2567',
                'description' => 'เพื่อให้การดำเนินงานของโรงเรียนเป็นไปด้วยความเรียบร้อย จึงแต่งตั้งคณะกรรมการดำเนินงานประจำปีการศึกษา 2567',
                'document_type' => 'คำสั่ง',
                'status' => 'pending_director',
            ],
            [
                'title' => 'ประกาศรับสมัครนักเรียนใหม่ ปีการศึกษา 2568',
                'description' => 'โรงเรียนจะเปิดรับสมัครนักเรียนใหม่ ระดับชั้นมัธยมศึกษาปีที่ 1 และ 4 ประจำปีการศึกษา 2568',
                'document_type' => 'ประกาศ',
                'status' => 'completed',
            ],
            [
                'title' => 'หนังสือขอความอนุเคราะห์สถานที่จัดกิจกรรมวันกีฬาสี',
                'description' => 'ขอความอนุเคราะห์สถานที่สำหรับจัดกิจกรรมวันกีฬาสีประจำปี เพื่อส่งเสริมความสามัคคีของนักเรียน',
                'document_type' => 'หนังสือภายนอก',
                'status' => 'pending_deputy_director_1',
            ],
            [
                'title' => 'บันทึกข้อความ เรื่อง การประชุมครูประจำเดือน',
                'description' => 'แจ้งให้ครูทุกท่านเข้าร่วมประชุมประจำเดือน เพื่อหารือเกี่ยวกับแผนการเรียนการสอน',
                'document_type' => 'บันทึกข้อความ',
                'status' => 'pending_stamp',
            ],
            [
                'title' => 'รายงานผลการดำเนินงานโครงการพัฒนาคุณภาพการศึกษา',
                'description' => 'รายงานสรุปผลการดำเนินงานโครงการพัฒนาคุณภาพการศึกษา ประจำภาคเรียนที่ 1',
                'document_type' => 'รายงานการปฏิบัติงาน',
                'status' => 'completed',
            ],
            [
                'title' => 'หนังสือเวียน เรื่อง มาตรการป้องกันโรคติดต่อในโรงเรียน',
                'description' => 'แจ้งมาตรการป้องกันโรคติดต่อในโรงเรียน เพื่อความปลอดภัยของนักเรียนและบุคลากร',
                'document_type' => 'หนังสือเวียน',
                'status' => 'completed',
            ],
            [
                'title' => 'ใบลาป่วยของครูสุดา ภาษาไทย',
                'description' => 'ขอลาป่วยเนื่องจากมีอาการไข้หวัดใหญ่ ระยะเวลา 3 วัน',
                'document_type' => 'ใบลา',
                'status' => 'pending_deputy_director_2',
            ],
            [
                'title' => 'แผนการเรียนรู้วิชาคณิตศาสตร์ ม.1',
                'description' => 'แผนการเรียนรู้วิชาคณิตศาสตร์ ระดับชั้นมัธยมศึกษาปีที่ 1 ภาคเรียนที่ 2',
                'document_type' => 'แผนการเรียนรู้',
                'status' => 'pending_deputy_director_1',
            ],
            [
                'title' => 'งบประมาณจัดซื้ออุปกรณ์การเรียนการสอน',
                'description' => 'ขออนุมัติงบประมาณสำหรับจัดซื้ออุปกรณ์การเรียนการสอนประจำปีการศึกษา 2567',
                'document_type' => 'งบประมาณ',
                'status' => 'pending_distribution',
            ],
            [
                'title' => 'ใบอนุญาตจัดกิจกรรมค่ายวิทยาศาสตร์',
                'description' => 'ขออนุญาตจัดกิจกรรมค่ายวิทยาศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 2',
                'document_type' => 'ใบอนุญาตกิจกรรม',
                'status' => 'completed',
            ],
        ];

        $createdCount = 0;

        foreach ($sampleDocuments as $docData) {
            // หาประเภทเอกสาร
            $documentType = $documentTypes->where('name', $docData['document_type'])->first();
            if (!$documentType) {
                continue;
            }

            // สุ่มผู้สร้างเอกสาร
            $creator = $users->random();

            // สร้างไฟล์ path จำลอง
            $fileName = Str::slug($docData['title']) . '.pdf';
            $filePath = 'documents/' . $fileName;

            try {
                Document::create([
                    'title' => $docData['title'],
                    'description' => $docData['description'],
                    'file_path' => $filePath,
                    'current_file_path' => $filePath,
                    'document_type_id' => $documentType->id,
                    'user_id' => $creator->id,
                    'is_public' => rand(0, 1) == 1,
                    'status' => $docData['status'],
                    'current_step' => $docData['status'] === 'draft' ? 1 : rand(1, 3),
                    'created_at' => now()->subDays(rand(1, 30)),
                    'updated_at' => now()->subDays(rand(0, 5)),
                ]);
                
                $createdCount++;
            } catch (\Exception $e) {
                $this->command->warn("⚠️ ไม่สามารถสร้างเอกสาร '{$docData['title']}' ได้: " . $e->getMessage());
            }
        }

        $this->command->info("✅ สร้างข้อมูลเอกสารตัวอย่าง {$createdCount} ฉบับ เรียบร้อย");
        $this->command->info("📄 ข้อมูลเอกสารพร้อมสำหรับการ demo แล้ว");
    }
} 