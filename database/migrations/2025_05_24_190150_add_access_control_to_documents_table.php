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
            $table->enum('access_type', ['public', 'restricted'])->default('restricted')->after('is_public');
            $table->timestamp('completed_at')->nullable()->after('updated_at'); // เวลาที่เสร็จสิ้นกระบวนการ
            
            $table->index(['access_type']);
            $table->index(['completed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex(['access_type']);
            $table->dropIndex(['completed_at']);
            $table->dropColumn(['access_type', 'completed_at']);
        });
    }
};
