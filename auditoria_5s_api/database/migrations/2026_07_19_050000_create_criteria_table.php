<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_dimension_id')->constrained('evaluation_dimensions')->restrictOnDelete();
            $table->foreignId('evaluation_model_id')->constrained('evaluation_models')->restrictOnDelete();
            $table->string('code', 80)->unique();
            $table->text('text');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index('evaluation_dimension_id');
            $table->index('evaluation_model_id');
            $table->index('active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('criteria');
    }
};
