<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_answer_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('file_size')->nullable();
            $table->timestamps();

            $table->index('assessment_answer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evidences');
    }
};
