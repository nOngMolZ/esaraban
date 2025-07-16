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
        Schema::create('fixed_signers', function (Blueprint $table) {
            $table->id();
            $table->enum('position_type', ['deputy_director', 'director']);
            $table->foreignId('user_id')->constrained();
            $table->unsignedTinyInteger('priority_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixed_signers');
    }
}; 