<?php

namespace Database\Seeders;

use App\Models\Stamp;
use Illuminate\Database\Seeder;

class StampSeeder extends Seeder
{
    public function run(): void
    {
        $stamps = [
            [
                'name' => 'ตราสำนักงานเขตพื้นที่การศึกษา',
                'description' => 'ตราประทับสำนักงานเขตพื้นที่การศึกษาประถมศึกษานครราชสีมา เขต 1',
                'file_path' => 'stamps/official_seal.svg',
                'category' => 'official',
                'is_active' => true,
            ],
            [
                'name' => 'ตราโรงเรียน',
                'description' => 'ตราประทับโรงเรียน',
                'file_path' => 'stamps/school_seal.svg',
                'category' => 'school',
                'is_active' => true,
            ],
            [
                'name' => 'ตราอนุมัติ',
                'description' => 'ตราประทับอนุมัติ',
                'file_path' => 'stamps/approved_stamp.svg',
                'category' => 'approval',
                'is_active' => true,
            ],
            [
                'name' => 'ตราเอกสารลับ',
                'description' => 'ตราประทับเอกสารลับ',
                'file_path' => 'stamps/confidential_stamp.svg',
                'category' => 'classification',
                'is_active' => true,
            ],
            [
                'name' => 'ตราเร่งด่วน',
                'description' => 'ตราประทับเร่งด่วน',
                'file_path' => 'stamps/urgent_stamp.svg',
                'category' => 'priority',
                'is_active' => true,
            ],
            [
                'name' => 'ตราได้รับ',
                'description' => 'ตราประทับได้รับเอกสาร',
                'file_path' => 'stamps/received_stamp.svg',
                'category' => 'status',
                'is_active' => true,
            ],
        ];

        foreach ($stamps as $stamp) {
            Stamp::create($stamp);
        }
    }
} 