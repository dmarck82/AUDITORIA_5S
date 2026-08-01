<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('verification_criteria', function (Blueprint $table) {
            $table->string('response_0_label', 500)
                ->default('Não atende ao requisito')
                ->after('question');
            $table->string('response_5_label', 500)
                ->default('Atende parcialmente, com falhas relevantes')
                ->after('response_0_label');
            $table->string('response_10_label', 500)
                ->default('Atende, com pequenas oportunidades de melhoria')
                ->after('response_5_label');
            $table->string('response_15_label', 500)
                ->default('Atende plenamente ao padrão estabelecido')
                ->after('response_10_label');
        });
    }

    public function down(): void
    {
        Schema::table('verification_criteria', function (Blueprint $table) {
            $table->dropColumn([
                'response_0_label',
                'response_5_label',
                'response_10_label',
                'response_15_label',
            ]);
        });
    }
};
