<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_dimensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('methodology_id')->constrained('methodologies')->restrictOnDelete();
            $table->string('code', 80);
            $table->string('name');
            $table->text('objective')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->unique(['methodology_id', 'code']);
            $table->index('active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_dimensions');
    }
};
