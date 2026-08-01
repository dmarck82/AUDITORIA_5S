<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_environment_criteria', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('work_environment_id');
            $table->unsignedBigInteger('verification_criterion_id');
            $table->timestamps();

            $table->foreign('work_environment_id', 'we_criteria_environment_fk')
                ->references('id')
                ->on('work_environments')
                ->cascadeOnDelete();
            $table->foreign('verification_criterion_id', 'we_criteria_criterion_fk')
                ->references('id')
                ->on('verification_criteria')
                ->cascadeOnDelete();
            $table->unique(
                ['work_environment_id', 'verification_criterion_id'],
                'we_criteria_environment_criterion_unique'
            );
        });

        DB::table('work_environment_criteria')->insertUsing(
            [
                'work_environment_id',
                'verification_criterion_id',
                'created_at',
                'updated_at',
            ],
            DB::table('work_environments')
                ->crossJoin('verification_criteria')
                ->where('verification_criteria.active', true)
                ->select([
                    'work_environments.id',
                    'verification_criteria.id',
                ])
                ->selectRaw('CURRENT_TIMESTAMP, CURRENT_TIMESTAMP')
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('work_environment_criteria');
    }
};
