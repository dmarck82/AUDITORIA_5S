<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('generic_tables', function (Blueprint $table) {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('generic_table_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('generic_table_id')->constrained()->cascadeOnDelete();
            $table->string('code', 80);
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['generic_table_id', 'code']);
            $table->index(['generic_table_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generic_table_items');
        Schema::dropIfExists('generic_tables');
    }
};
