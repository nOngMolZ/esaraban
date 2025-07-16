<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('document_signers', function (Blueprint $table) {
            $table->enum('signer_type', ['admin_phase', 'operational_phase'])->default('admin_phase')->after('step');
            $table->string('signature_data', 5000)->nullable()->after('signer_type'); // เก็บข้อมูล signature หรือ stamp
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_signers', function (Blueprint $table) {
            $table->dropColumn(['signer_type', 'signature_data']);
        });
    }
}; 