<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** @var array<string, string> */
    private array $prefixes = [
        'utilization' => 'UTIL',
        'ordering' => 'ORD',
        'cleaning' => 'LIMP',
        'standardization' => 'PAD',
        'discipline' => 'DISC',
    ];

    public function up(): void
    {
        Schema::create('verification_criterion_code_sequences', function (Blueprint $table) {
            $table->string('sense', 32)->primary();
            $table->unsignedBigInteger('last_number')->default(0);
            $table->timestamps();
        });

        foreach ($this->prefixes as $sense => $prefix) {
            DB::table('verification_criterion_code_sequences')->insert([
                'sense' => $sense,
                'last_number' => $this->largestExistingNumber($sense, $prefix),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_criterion_code_sequences');
    }

    private function largestExistingNumber(string $sense, string $prefix): int
    {
        $codes = DB::table('verification_criteria')
            ->where('sense', $sense)
            ->pluck('code');

        if (Schema::hasTable('supervision_answers')) {
            $codes = $codes->merge(
                DB::table('supervision_answers')
                    ->where('sense_snapshot', $sense)
                    ->pluck('criterion_code_snapshot')
            );
        }

        $pattern = '/^'.preg_quote($prefix, '/').'-(\d+)$/';

        return $codes->reduce(function (int $largest, string $code) use ($pattern): int {
            return preg_match($pattern, $code, $matches)
                ? max($largest, (int) $matches[1])
                : $largest;
        }, 0);
    }
};
