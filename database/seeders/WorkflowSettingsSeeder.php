<?php

namespace Database\Seeders;

use App\Models\FixedSigner;
use App\Models\User;
use App\Models\Role;
use App\Models\DocumentType;
use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class WorkflowSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // สร้าง Departments
        $departments = [
            ['name' => 'ฝ่ายบริหาร', 'description' => 'ฝ่ายบริหารงานทั่วไป'],
            ['name' => 'ฝ่ายวิชาการ', 'description' => 'ฝ่ายวิชาการและการเรียนการสอน'],
            ['name' => 'ฝ่ายกิจการนักเรียน', 'description' => 'ฝ่ายกิจการนักเรียนและพัฒนาผู้เรียน'],
            ['name' => 'ฝ่ายแผนงานและงบประมาณ', 'description' => 'ฝ่ายแผนงานและงบประมาณ'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(['name' => $dept['name']], $dept);
        }

        // สร้าง Positions
        $positions = [
            ['name' => 'ผู้อำนวยการ', 'description' => 'ผู้อำนวยการสถานศึกษา'],
            ['name' => 'รองผู้อำนวยการ', 'description' => 'รองผู้อำนวยการสถานศึกษา'],
            ['name' => 'หัวหน้าฝ่าย', 'description' => 'หัวหน้าฝ่าย'],
            ['name' => 'ครู', 'description' => 'ครูผู้สอน'],
            ['name' => 'เจ้าหน้าที่', 'description' => 'เจ้าหน้าที่ธุรการ'],
        ];

        foreach ($positions as $pos) {
            Position::firstOrCreate(['name' => $pos['name']], $pos);
        }

        // สร้าง Roles
        $roles = [
            ['name' => 'แอดมิน', 'description' => 'ผู้ดูแลระบบ'],
            ['name' => 'ผู้อำนวยการ', 'description' => 'ผู้อำนวยการสถานศึกษา'],
            ['name' => 'รองผู้อำนวยการ', 'description' => 'รองผู้อำนวยการสถานศึกษา'],
            ['name' => 'สารบัญ', 'description' => 'เจ้าหน้าที่สารบรรณ'],
            ['name' => 'ครู', 'description' => 'ครูผู้สอน'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }

        // สร้าง Document Types
        $documentTypes = [
            ['name' => 'คำสั่ง', 'description' => 'คำสั่งของผู้บริหาร'],
            ['name' => 'ประกาศ', 'description' => 'ประกาศต่างๆ'],
            ['name' => 'หนังสือภายใน', 'description' => 'หนังสือราชการภายใน'],
            ['name' => 'หนังสือภายนอก', 'description' => 'หนังสือราชการภายนอก'],
        ];

        foreach ($documentTypes as $type) {
            DocumentType::firstOrCreate(['name' => $type['name']], $type);
        }

        // สร้าง Users ตัวอย่าง
        $adminDept = Department::where('name', 'ฝ่ายบริหาร')->first();
        $directorPos = Position::where('name', 'ผู้อำนวยการ')->first();
        $deputyPos = Position::where('name', 'รองผู้อำนวยการ')->first();
        $staffPos = Position::where('name', 'เจ้าหน้าที่')->first();

        $adminRole = Role::where('name', 'แอดมิน')->first();
        $directorRole = Role::where('name', 'ผู้อำนวยการ')->first();
        $deputyRole = Role::where('name', 'รองผู้อำนวยการ')->first();
        $sarabunRole = Role::where('name', 'สารบัญ')->first();

        // ผู้อำนวยการ
        $director = User::firstOrCreate(
            ['email' => 'director@school.ac.th'],
            [
                'fname' => 'สมชาย',
                'lname' => 'ผู้อำนวยการ',
                'email' => 'director@school.ac.th',
                'password' => Hash::make('password'),
                'department_id' => $adminDept->id,
                'position_id' => $directorPos->id,
                'role_id' => $directorRole->id,
                'is_active' => true,
            ]
        );

        // รองผู้อำนวยการ คนที่ 1
        $deputy1 = User::firstOrCreate(
            ['email' => 'deputy1@school.ac.th'],
            [
                'fname' => 'สมหญิง',
                'lname' => 'รองผู้อำนวยการ',
                'email' => 'deputy1@school.ac.th',
                'password' => Hash::make('password'),
                'department_id' => $adminDept->id,
                'position_id' => $deputyPos->id,
                'role_id' => $deputyRole->id,
                'is_active' => true,
            ]
        );

        // รองผู้อำนวยการ คนที่ 2
        $deputy2 = User::firstOrCreate(
            ['email' => 'deputy2@school.ac.th'],
            [
                'fname' => 'สมศักดิ์',
                'lname' => 'รองผู้อำนวยการ',
                'email' => 'deputy2@school.ac.th',
                'password' => Hash::make('password'),
                'department_id' => $adminDept->id,
                'position_id' => $deputyPos->id,
                'role_id' => $deputyRole->id,
                'is_active' => true,
            ]
        );

        // เจ้าหน้าที่สารบรรณ
        $sarabun = User::firstOrCreate(
            ['email' => 'sarabun@school.ac.th'],
            [
                'fname' => 'สมใจ',
                'lname' => 'เจ้าหน้าที่สารบรรณ',
                'email' => 'sarabun@school.ac.th',
                'password' => Hash::make('password'),
                'department_id' => $adminDept->id,
                'position_id' => $staffPos->id,
                'role_id' => $sarabunRole->id,
                'is_active' => true,
            ]
        );

        // เพิ่มผู้ใช้ตัวอย่างในแผนกต่างๆ สำหรับการกระจายเอกสาร
        $academicDept = Department::where('name', 'ฝ่ายวิชาการ')->first();
        $studentDept = Department::where('name', 'ฝ่ายกิจการนักเรียน')->first();
        $budgetDept = Department::where('name', 'ฝ่ายแผนงานและงบประมาณ')->first();
        
        $teacherPos = Position::where('name', 'ครู')->first();
        $headPos = Position::where('name', 'หัวหน้าฝ่าย')->first();
        $teacherRole = Role::where('name', 'ครู')->first();

        // ครูในฝ่ายวิชาการ
        User::firstOrCreate(
            ['email' => 'teacher1@school.ac.th'],
            [
                'fname' => 'สมหมาย',
                'lname' => 'ครูวิชาการ',
                'email' => 'teacher1@school.ac.th',
                'password' => Hash::make('password'),
                'department_id' => $academicDept->id,
                'position_id' => $teacherPos->id,
                'role_id' => $teacherRole->id,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'teacher2@school.ac.th'],
            [
                'fname' => 'สมจิต',
                'lname' => 'ครูคณิต',
                'email' => 'teacher2@school.ac.th',
                'password' => Hash::make('password'),
                'department_id' => $academicDept->id,
                'position_id' => $teacherPos->id,
                'role_id' => $teacherRole->id,
                'is_active' => true,
            ]
        );

        // หัวหน้าฝ่ายกิจการนักเรียน
        User::firstOrCreate(
            ['email' => 'head.student@school.ac.th'],
            [
                'fname' => 'สมใส',
                'lname' => 'หัวหน้าฝ่ายกิจการนักเรียน',
                'email' => 'head.student@school.ac.th',
                'password' => Hash::make('password'),
                'department_id' => $studentDept->id,
                'position_id' => $headPos->id,
                'role_id' => $teacherRole->id,
                'is_active' => true,
            ]
        );

        // ครูในฝ่ายกิจการนักเรียน
        User::firstOrCreate(
            ['email' => 'teacher.student@school.ac.th'],
            [
                'fname' => 'สมยิ้ม',
                'lname' => 'ครูฝ่ายกิจการนักเรียน',
                'email' => 'teacher.student@school.ac.th',
                'password' => Hash::make('password'),
                'department_id' => $studentDept->id,
                'position_id' => $teacherPos->id,
                'role_id' => $teacherRole->id,
                'is_active' => true,
            ]
        );

        // เจ้าหน้าที่ฝ่ายแผนงาน
        User::firstOrCreate(
            ['email' => 'staff.budget@school.ac.th'],
            [
                'fname' => 'สมคิด',
                'lname' => 'เจ้าหน้าที่แผนงาน',
                'email' => 'staff.budget@school.ac.th',
                'password' => Hash::make('password'),
                'department_id' => $budgetDept->id,
                'position_id' => $staffPos->id,
                'role_id' => $teacherRole->id,
                'is_active' => true,
            ]
        );

        // สร้าง Fixed Signers
        FixedSigner::firstOrCreate(
            [
                'user_id' => $deputy1->id,
                'position_type' => 'deputy_director',
            ],
            [
                'priority_order' => 1,
                'is_active' => true,
            ]
        );

        FixedSigner::firstOrCreate(
            [
                'user_id' => $deputy2->id,
                'position_type' => 'deputy_director',
            ],
            [
                'priority_order' => 2,
                'is_active' => true,
            ]
        );

        FixedSigner::firstOrCreate(
            [
                'user_id' => $director->id,
                'position_type' => 'director',
            ],
            [
                'priority_order' => 1,
                'is_active' => true,
            ]
        );

        $this->command->info('Workflow settings seeded successfully!');
    }
} 