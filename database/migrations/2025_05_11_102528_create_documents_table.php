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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('current_file_path');
            $table->foreignId('document_type_id')->constrained();
            $table->foreignId('user_id')->constrained();
            $table->boolean('is_public')->default(false);
            $table->enum('status', ['draft', 'in_progress', 'completed'])->default('draft');
            $table->unsignedTinyInteger('current_step')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
