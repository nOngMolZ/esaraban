<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // บทบาทแอดมิน มีทุกสิทธิ์
        $adminRole = Role::where('name', 'แอดมิน')->first();
        $permissions = Permission::all();
        
        $adminRole->permissions()->syncWithoutDetaching($permissions->pluck('id')->toArray());
        
        // บทบาทผู้ใช้งาน มีสิทธิ์เพิ่มเอกสารและลงนามเอกสาร
        $userRole = Role::where('name', 'ผู้ใช้งาน')->first();
        $userPermissions = Permission::whereIn('slug', ['add_document', 'sign_document'])->get();
        
        $userRole->permissions()->syncWithoutDetaching($userPermissions->pluck('id')->toArray());

        // บทบาทสารบัญ มีสิทธิ์จัดการเอกสาร จัดการตราประทับ และลงนามเอกสาร
        $sarabunRole = Role::where('name', 'สารบัญ')->first();
        if ($sarabunRole) {
            $sarabunPermissions = Permission::whereIn('slug', [
                'add_document', 
                'sign_document', 
                'manage_stamps'
            ])->get();
            
            $sarabunRole->permissions()->syncWithoutDetaching($sarabunPermissions->pluck('id')->toArray());
        }
    }
}