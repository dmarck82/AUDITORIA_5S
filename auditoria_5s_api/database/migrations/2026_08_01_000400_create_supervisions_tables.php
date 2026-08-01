<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supervisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_environment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('responsible_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('operator_id')->nullable()->constrained('operators')->nullOnDelete();
            $table->enum('status', ['draft', 'finalized'])->default('draft');
            $table->timestamp('started_at');
            $table->timestamp('finalized_at')->nullable();
            $table->string('work_environment_name_snapshot');
            $table->string('local_1_name_snapshot');
            $table->string('local_2_name_snapshot');
            $table->string('local_3_name_snapshot');
            $table->string('responsible_user_name_snapshot');
            $table->string('operator_name_snapshot');
            $table->foreignId('updated_by')->nullable()->constrained('operators')->nullOnDelete();
            $table->timestamps();
            $table->index(['status', 'started_at']);
        });

        Schema::create('supervision_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supervision_id')->constrained()->cascadeOnDelete();
            $table->foreignId('verification_criterion_id')->nullable()->constrained()->nullOnDelete();
            $table->string('criterion_code_snapshot', 50);
            $table->enum('sense_snapshot', [
                'utilization',
                'ordering',
                'cleaning',
                'standardization',
                'discipline',
            ]);
            $table->text('criterion_question_snapshot');
            $table->string('response_0_label_snapshot', 500);
            $table->string('response_5_label_snapshot', 500);
            $table->string('response_10_label_snapshot', 500);
            $table->string('response_15_label_snapshot', 500);
            $table->unsignedTinyInteger('selected_value')->nullable();
            $table->boolean('not_applicable')->default(false);
            $table->text('observation')->nullable();
            $table->text('evidence')->nullable();
            $table->timestamps();
            $table->unique(['supervision_id', 'verification_criterion_id'], 'sup_answers_supervision_criterion_unique');
            $table->index(['sense_snapshot', 'selected_value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supervision_answers');
        Schema::dropIfExists('supervisions');
    }
};
