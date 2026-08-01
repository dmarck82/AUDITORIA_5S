<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('local_1s', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('local_2s', function (Blueprint $table) {
            $table->id();
            $table->foreignId('local_1_id')->constrained('local_1s')->cascadeOnDelete();
            $table->string('name');
            $table->string('address')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->unique(['local_1_id', 'name']);
        });

        Schema::create('local_3s', function (Blueprint $table) {
            $table->id();
            $table->foreignId('local_2_id')->constrained('local_2s')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->unique(['local_2_id', 'name']);
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('local_1_id')->constrained('local_1s')->restrictOnDelete();
            $table->foreignId('local_2_id')->nullable()->constrained('local_2s')->nullOnDelete();
            $table->foreignId('local_3_id')->nullable()->constrained('local_3s')->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable()->unique();
            $table->string('phone', 20)->nullable()->unique();
            $table->string('photo_path')->nullable();
            $table->string('job_title')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('operators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('password');
            $table->unsignedTinyInteger('access_level')->default(1);
            $table->boolean('active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        foreach (['local_1s', 'local_2s', 'local_3s', 'users', 'operators'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('updated_by')->nullable()->constrained('operators')->nullOnDelete();
            });
        }

        Schema::create('work_environments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('local_3_id')->constrained('local_3s')->restrictOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->foreignId('updated_by')->nullable()->constrained('operators')->nullOnDelete();
            $table->timestamps();
            $table->unique(['local_3_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_environments');

        foreach (['operators', 'users', 'local_3s', 'local_2s', 'local_1s'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropConstrainedForeignId('updated_by');
            });
        }

        Schema::dropIfExists('operators');
        Schema::dropIfExists('users');
        Schema::dropIfExists('local_3s');
        Schema::dropIfExists('local_2s');
        Schema::dropIfExists('local_1s');
    }
};
