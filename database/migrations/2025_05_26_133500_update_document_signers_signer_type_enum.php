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
        // Drop the existing column first
        Schema::table('document_signers', function (Blueprint $table) {
            $table->dropColumn('signer_type');
        });
        
        // Add the column with updated enum values
        Schema::table('document_signers', function (Blueprint $table) {
            $table->enum('signer_type', [
                'admin_phase',
                'operational_phase',
                'deputy_director_1',
                'director',
                'deputy_director_2'
            ])->default('admin_phase')->after('step');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the updated column
        Schema::table('document_signers', function (Blueprint $table) {
            $table->dropColumn('signer_type');
        });
        
        // Restore the original column
        Schema::table('document_signers', function (Blueprint $table) {
            $table->enum('signer_type', ['admin_phase', 'operational_phase'])
                ->default('admin_phase')
                ->after('step');
        });
    }
}; 