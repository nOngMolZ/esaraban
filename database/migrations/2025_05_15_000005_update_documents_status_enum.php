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
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        
        Schema::table('documents', function (Blueprint $table) {
            $table->enum('status', [
                'pending_deputy_director_1',
                'pending_director', 
                'pending_distribution',
                'pending_stamp',
                'pending_deputy_director_2',
                'pending_final_review',
                'completed',
                'rejected_by_deputy_1',
                'rejected_by_director',
                'rejected_by_deputy_2'
            ])->default('pending_deputy_director_1')->after('is_public');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        
        Schema::table('documents', function (Blueprint $table) {
            $table->enum('status', ['draft', 'in_progress', 'completed'])->default('draft')->after('is_public');
        });
    }
}; 