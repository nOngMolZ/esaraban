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
            $table->dropColumn('status');
        });
        
        // Add the column with updated enum values
        Schema::table('document_signers', function (Blueprint $table) {
            $table->enum('status', ['waiting', 'pending', 'signed', 'completed', 'rejected'])
                ->default('waiting')
                ->after('signer_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the updated column
        Schema::table('document_signers', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        
        // Restore the original column
        Schema::table('document_signers', function (Blueprint $table) {
            $table->enum('status', ['waiting', 'signed', 'rejected'])
                ->default('waiting')
                ->after('signer_type');
        });
    }
};
