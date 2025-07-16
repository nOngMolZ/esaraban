<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            [
                'name' => 'เพิ่มเอกสาร',
                'slug' => 'add_document',
                'description' => 'สามารถเพิ่มเอกสารในระบบได้',
            ],
            [
                'name' => 'ลงนามเอกสาร',
                'slug' => 'sign_document',
                'description' => 'สามารถลงนามเอกสารในระบบได้',
            ],
            [
                'name' => 'จัดการผู้ใช้',
                'slug' => 'manage_users',
                'description' => 'สามารถจัดการผู้ใช้ในระบบได้',
            ],
            [
                'name' => 'จัดการผู้ลงนามคงที่',
                'slug' => 'manage_fixed_signers',
                'description' => 'สามารถจัดการรายชื่อผู้ลงนามคงที่',
            ],
            [
                'name' => 'จัดการคลังตราประทับ',
                'slug' => 'manage_stamps',
                'description' => 'สามารถจัดการคลังตราประทับ',
            ],
            [
                'name' => 'เพิ่มตราประทับ',
                'slug' => 'add_stamp',
                'description' => 'สามารถเพิ่มตราประทับในเอกสาร',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }
    }
}
