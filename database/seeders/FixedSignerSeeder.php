<?php

namespace Database\Seeders;

use App\Models\FixedSigner;
use App\Models\User;
use Illuminate\Database\Seeder;

class FixedSignerSeeder extends Seeder
{
    public function run(): void
    {
        // ค้นหาผู้ใช้ที่เป็นผู้อำนวยการและรองผู้อำนวยการ
        $director = User::whereHas('position', function ($query) {
            $query->where('name', 'ผู้อำนวยการ');
        })->first();
        
        $deputyDirectors = User::whereHas('position', function ($query) {
            $query->where('name', 'รองผู้อำนวยการ');
        })->get();

        // เพิ่มผู้อำนวยการเป็นผู้ลงนามคงที่
        if ($director) {
            FixedSigner::create([
                'position_type' => 'director',
                'user_id' => $director->id,
                'priority_order' => 1,
                'is_active' => true,
            ]);
        }

        // เพิ่มรองผู้อำนวยการเป็นผู้ลงนามคงที่
        foreach ($deputyDirectors as $index => $deputy) {
            FixedSigner::create([
                'position_type' => 'deputy_director',
                'user_id' => $deputy->id,
                'priority_order' => $index + 1,
                'is_active' => true,
            ]);
        }
    }
} 