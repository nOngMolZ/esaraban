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
        Schema::create('document_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('recipient_type', ['viewer', 'public'])->default('viewer');
            $table->timestamp('accessed_at')->nullable(); // เวลาที่เข้าถึงครั้งล่าสุด
            $table->timestamps();
            
            $table->unique(['document_id', 'user_id']); // ป้องกันการเพิ่มซ้ำ
            $table->index(['document_id']);
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_recipients');
    }
};
