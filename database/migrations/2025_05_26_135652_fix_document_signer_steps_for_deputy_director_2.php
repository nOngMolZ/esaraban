<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // แก้ไข DocumentSigner ที่เป็นรองผู้อำนวยการคนที่สอง (signer_type = 'operational_phase') 
        // จาก step 4 เป็น step 5
        DB::table('document_signers')
            ->where('step', 4)
            ->where('signer_type', 'operational_phase')
            ->update(['step' => 5]);

        // แก้ไข Document ที่มี status = 'pending_deputy_director_2' 
        // จาก current_step 4 เป็น current_step 5
        DB::table('documents')
            ->where('status', 'pending_deputy_director_2')
            ->where('current_step', 4)
            ->update(['current_step' => 5]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // ย้อนกลับการเปลี่ยนแปลง
        DB::table('document_signers')
            ->where('step', 5)
            ->where('signer_type', 'operational_phase')
            ->update(['step' => 4]);

        DB::table('documents')
            ->where('status', 'pending_deputy_director_2')
            ->where('current_step', 5)
            ->update(['current_step' => 4]);
    }
};
