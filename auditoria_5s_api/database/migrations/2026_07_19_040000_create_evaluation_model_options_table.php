<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_model_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_model_id')->constrained('evaluation_models')->restrictOnDelete();
            $table->string('value', 80);
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->unique(['evaluation_model_id', 'value']);
            $table->index('active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_model_options');
    }
};
