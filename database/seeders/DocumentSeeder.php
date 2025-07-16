<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        // ตัวอย่างเอกสาร (หมายเหตุ: ในความเป็นจริงอาจต้องสร้างไฟล์ PDF จริงก่อน)
        // โค้ดนี้เป็นเพียงตัวอย่าง - ปรับตามความเหมาะสม

        $samplePdfPath = 'documents/sample.pdf';

        $documentTypes = DocumentType::all();
        $admin = User::where('email', 'admin@example.com')->first();

        // สร้างเอกสารตัวอย่าง
        Document::create([
            'title' => 'คำสั่งแต่งตั้งคณะกรรมการ',
            'description' => 'คำสั่งแต่งตั้งคณะกรรมการดำเนินงานวันสำคัญ',
            'file_path' => $samplePdfPath,
            'current_file_path' => $samplePdfPath,
            'document_type_id' => $documentTypes->where('name', 'คำสั่ง')->first()->id,
            'user_id' => $admin->id,
            'is_public' => true,
            'status' => 'draft',
        ]);

        Document::create([
            'title' => 'ประกาศรับสมัครบุคลากร',
            'description' => 'ประกาศรับสมัครครูอัตราจ้าง',
            'file_path' => $samplePdfPath,
            'current_file_path' => $samplePdfPath,
            'document_type_id' => $documentTypes->where('name', 'ประกาศ')->first()->id,
            'user_id' => $admin->id,
            'is_public' => true,
            'status' => 'draft',
        ]);

        Document::create([
            'title' => 'บันทึกข้อความขออนุมัติงบประมาณ',
            'description' => 'บันทึกข้อความขออนุมัติงบประมาณจัดซื้อวัสดุสำนักงาน',
            'file_path' => $samplePdfPath,
            'current_file_path' => $samplePdfPath,
            'document_type_id' => $documentTypes->where('name', 'หนังสือภายใน')->first()->id,
            'user_id' => $admin->id,
            'is_public' => false,
            'status' => 'draft',
        ]);
    }
}
