<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * 
     * ลำดับการ seed ข้อมูล:
     * 1. ข้อมูลพื้นฐานระบบ (Roles, Permissions)
     * 2. ข้อมูลองค์กร (Departments, Positions) 
     * 3. ข้อมูลผู้ใช้ (Users)
     * 4. ข้อมูลเอกสาร (Document Types, Stamps)
     * 5. การตั้งค่าระบบ (Fixed Signers, Workflow)
     * 6. ข้อมูลตัวอย่าง (Sample Documents)
     */
    public function run(): void
    {
        $this->command->info('🚀 เริ่มต้น Seeding ข้อมูลระบบ E-Sarabun Chumsaeng...');
        
        // 1. ข้อมูลพื้นฐานระบบ
        $this->command->info('📋 กำลัง seed ข้อมูลพื้นฐานระบบ...');
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
        ]);

        // 2. ข้อมูลองค์กร
        $this->command->info('🏢 กำลัง seed ข้อมูลองค์กร...');
        $this->call([
            DepartmentSeeder::class,
            PositionSeeder::class,
        ]);

        // 3. ข้อมูลผู้ใช้
        $this->command->info('👥 กำลัง seed ข้อมูลผู้ใช้...');
        $this->call([
            UserSeeder::class,
        ]);

        // 4. ข้อมูลเอกสาร
        $this->command->info('📄 กำลัง seed ข้อมูลเอกสาร...');
        $this->call([
            DocumentTypeSeeder::class,
            StampSeeder::class,
        ]);

        // 5. การตั้งค่าระบบ
        $this->command->info('⚙️ กำลัง seed การตั้งค่าระบบ...');
        $this->call([
            FixedSignerSeeder::class,
            WorkflowSettingsSeeder::class,
        ]);

        // 6. ข้อมูลตัวอย่าง (สำหรับ demo)
        $this->command->info('📝 กำลัง seed ข้อมูลตัวอย่าง...');
        // $this->call([
        //     DemoDataSeeder::class,
        // ]);
        $this->command->info('⏭️ ข้ามการสร้างเอกสารตัวอย่าง (สามารถรันแยกได้ภายหลัง)');

        $this->command->info('✅ Seeding เสร็จสิ้น! ระบบพร้อมใช้งาน');
    }
}
