<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create([
            'name' => 'แอดมิน',
            'description' => 'ผู้ดูแลระบบ สามารถจัดการทุกอย่างในระบบได้',
        ]);

        Role::create([
            'name' => 'ผู้ใช้งาน',
            'description' => 'ผู้ใช้งานทั่วไป',
        ]);

        Role::create([
            'name' => 'สารบัญ',
            'description' => 'เจ้าหน้าที่สารบัญ สามารถจัดการเอกสารและตราประทับได้',
        ]);
    }
}
