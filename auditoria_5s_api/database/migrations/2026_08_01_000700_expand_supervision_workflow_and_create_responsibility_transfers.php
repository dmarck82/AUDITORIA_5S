<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('supervisions', function (Blueprint $table) {
            $table->string('status', 32)->default('draft')->change();
            $table->unsignedBigInteger('local_1_id_snapshot')->nullable()->after('work_environment_id');
            $table->unsignedBigInteger('local_2_id_snapshot')->nullable()->after('local_1_id_snapshot');
            $table->unsignedBigInteger('local_3_id_snapshot')->nullable()->after('local_2_id_snapshot');
            $table->timestamp('sent_at')->nullable()->after('started_at');
            $table->timestamp('response_started_at')->nullable()->after('sent_at');
            $table->timestamp('answered_at')->nullable()->after('response_started_at');
            $table->index(['local_2_id_snapshot', 'local_3_id_snapshot'], 'supervisions_hierarchy_snapshot_index');
            $table->index(['responsible_user_id', 'status'], 'supervisions_responsible_status_index');
        });

        $hierarchies = DB::table('supervisions')
            ->join('work_environments', 'work_environments.id', '=', 'supervisions.work_environment_id')
            ->join('local_3s', 'local_3s.id', '=', 'work_environments.local_3_id')
            ->join('local_2s', 'local_2s.id', '=', 'local_3s.local_2_id')
            ->get([
                'supervisions.id',
                'local_2s.local_1_id as local_1_id',
                'local_3s.local_2_id as local_2_id',
                'work_environments.local_3_id as local_3_id',
            ]);

        foreach ($hierarchies as $hierarchy) {
            DB::table('supervisions')->where('id', $hierarchy->id)->update([
                'local_1_id_snapshot' => $hierarchy->local_1_id,
                'local_2_id_snapshot' => $hierarchy->local_2_id,
                'local_3_id_snapshot' => $hierarchy->local_3_id,
            ]);
        }

        DB::table('supervisions')
            ->where('status', 'finalized')
            ->update([
                'sent_at' => DB::raw('started_at'),
                'response_started_at' => DB::raw('started_at'),
                'answered_at' => DB::raw('finalized_at'),
            ]);

        Schema::create('supervision_responsibility_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supervision_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('from_user_name_snapshot');
            $table->foreignId('to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('to_user_name_snapshot');
            $table->foreignId('assumed_by_operator_id')->nullable();
            $table->foreign('assumed_by_operator_id', 'supervision_transfers_assumed_by_fk')
                ->references('id')->on('operators')->nullOnDelete();
            $table->string('assumed_by_name_snapshot');
            $table->text('justification');
            $table->timestamps();
            $table->index(['supervision_id', 'created_at'], 'supervision_transfers_history_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supervision_responsibility_transfers');

        DB::table('supervisions')
            ->whereNotIn('status', ['draft', 'finalized'])
            ->update(['status' => 'draft']);

        Schema::table('supervisions', function (Blueprint $table) {
            $table->dropIndex('supervisions_hierarchy_snapshot_index');
            $table->dropIndex('supervisions_responsible_status_index');
            $table->dropColumn([
                'local_1_id_snapshot',
                'local_2_id_snapshot',
                'local_3_id_snapshot',
                'sent_at',
                'response_started_at',
                'answered_at',
            ]);
            $table->enum('status', ['draft', 'finalized'])->default('draft')->change();
        });
    }
};
