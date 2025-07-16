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
        Schema::create('document_stamps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->foreignId('stamp_id')->constrained();
            $table->foreignId('user_id')->constrained(); // ผู้เพิ่มตรา
            $table->json('position_data'); // เก็บตำแหน่ง, ขนาด, การหมุน
            $table->unsignedTinyInteger('page_number')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_stamps');
    }
}; 