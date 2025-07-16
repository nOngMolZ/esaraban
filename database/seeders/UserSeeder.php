<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed ข้อมูลผู้ใช้ตัวอย่างสำหรับการ demo
     */
    public function run(): void
    {
        // ดึงข้อมูล roles
        $adminRole = Role::where('name', 'แอดมิน')->first();
        $userRole = Role::where('name', 'ผู้ใช้งาน')->first();
        $sarabunRole = Role::where('name', 'สารบัญ')->first();
        
        // ดึงข้อมูล departments
        $adminDept = Department::where('name', 'ฝ่ายบริหาร')->first();
        $academicDept = Department::where('name', 'ฝ่ายวิชาการ')->first();
        $financeDept = Department::where('name', 'ฝ่ายการเงินและพัสดุ')->first();
        $sarabunDept = Department::where('name', 'ฝ่ายสารบรรณ')->first();
        $studentDept = Department::where('name', 'ฝ่ายกิจการนักเรียน')->first();
        $hrDept = Department::where('name', 'ฝ่ายบุคลากร')->first();
        
        // ดึงข้อมูล positions
        $directorPos = Position::where('name', 'ผู้อำนวยการ')->first();
        $deputyDirectorPos = Position::where('name', 'รองผู้อำนวยการ')->first();
        $headAcademicPos = Position::where('name', 'หัวหน้าฝ่ายวิชาการ')->first();
        $headFinancePos = Position::where('name', 'หัวหน้าฝ่ายการเงิน')->first();
        $teacherPos = Position::where('name', 'ครู')->first();
        $sarabunPos = Position::where('name', 'สารบัญ')->first();
        $clerkPos = Position::where('name', 'เจ้าหน้าที่ธุรการ')->first();
        $financePos = Position::where('name', 'เจ้าหน้าที่การเงิน')->first();
        $hrPos = Position::where('name', 'เจ้าหน้าที่บุคลากร')->first();

        $users = [
            // ผู้ดูแลระบบ
            [
                'fname' => 'ระบบ',
                'lname' => 'แอดมิน',
                'email' => 'admin@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'department_id' => $adminDept->id,
                'position_id' => $clerkPos->id,
                'email_verified_at' => now(),
            ],

            // ผู้บริหาร
            [
                'fname' => 'สมชาย',
                'lname' => 'วิทยาธร',
                'email' => 'director@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'department_id' => $adminDept->id,
                'position_id' => $directorPos->id,
                'email_verified_at' => now(),
            ],
            [
                'fname' => 'สมหญิง',
                'lname' => 'ศึกษาดี',
                'email' => 'deputy@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'department_id' => $adminDept->id,
                'position_id' => $deputyDirectorPos->id,
                'email_verified_at' => now(),
            ],

            // หัวหน้าฝ่าย
            [
                'fname' => 'วิชัย',
                'lname' => 'หลักสูตร',
                'email' => 'academic@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'department_id' => $academicDept->id,
                'position_id' => $headAcademicPos->id,
                'email_verified_at' => now(),
            ],
            [
                'fname' => 'สุรีย์',
                'lname' => 'การเงิน',
                'email' => 'finance.head@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'department_id' => $financeDept->id,
                'position_id' => $headFinancePos->id,
                'email_verified_at' => now(),
            ],

            // เจ้าหน้าที่สารบัญ (มีสิทธิ์จัดการตราประทับ)
            [
                'fname' => 'วรรณา',
                'lname' => 'เอกสาร',
                'email' => 'sarabun@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $sarabunRole->id,
                'department_id' => $sarabunDept->id,
                'position_id' => $sarabunPos->id,
                'email_verified_at' => now(),
            ],
            [
                'fname' => 'สุภาพ',
                'lname' => 'จดหมาย',
                'email' => 'sarabun2@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $sarabunRole->id,
                'department_id' => $sarabunDept->id,
                'position_id' => $sarabunPos->id,
                'email_verified_at' => now(),
            ],

            // ครูผู้สอน
            [
                'fname' => 'อรุณ',
                'lname' => 'คณิตศาสตร์',
                'email' => 'teacher.math@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'department_id' => $academicDept->id,
                'position_id' => $teacherPos->id,
                'email_verified_at' => now(),
            ],
            [
                'fname' => 'สุดา',
                'lname' => 'ภาษาไทย',
                'email' => 'teacher.thai@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'department_id' => $academicDept->id,
                'position_id' => $teacherPos->id,
                'email_verified_at' => now(),
            ],
            [
                'fname' => 'ประยุทธ',
                'lname' => 'วิทยาศาสตร์',
                'email' => 'teacher.science@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'department_id' => $academicDept->id,
                'position_id' => $teacherPos->id,
                'email_verified_at' => now(),
            ],

            // เจ้าหน้าที่สนับสนุน
            [
                'fname' => 'มาลี',
                'lname' => 'บัญชี',
                'email' => 'finance@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'department_id' => $financeDept->id,
                'position_id' => $financePos->id,
                'email_verified_at' => now(),
            ],
            [
                'fname' => 'สมศักดิ์',
                'lname' => 'บุคลากร',
                'email' => 'hr@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'department_id' => $hrDept->id,
                'position_id' => $hrPos->id,
                'email_verified_at' => now(),
            ],
            [
                'fname' => 'จิรา',
                'lname' => 'ธุรการ',
                'email' => 'clerk@school.ac.th',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'department_id' => $studentDept->id,
                'position_id' => $clerkPos->id,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        $this->command->info('✅ สร้างข้อมูลผู้ใช้ ' . count($users) . ' คน เรียบร้อย');
        $this->command->info('📧 อีเมลและรหัสผ่านทั้งหมด: password');
    }
}