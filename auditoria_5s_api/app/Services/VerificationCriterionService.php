<?php

namespace App\Services;

use App\Enums\FiveSSense;
use App\Models\VerificationCriterion;
use Illuminate\Support\Facades\DB;

class VerificationCriterionService
{
    /** @param array<string, mixed> $data */
    public function create(array $data): VerificationCriterion
    {
        $sense = FiveSSense::from($data['sense']);

        return DB::transaction(function () use ($data, $sense): VerificationCriterion {
            $now = now();

            DB::table('verification_criterion_code_sequences')->insertOrIgnore([
                'sense' => $sense->value,
                'last_number' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $sequence = DB::table('verification_criterion_code_sequences')
                ->where('sense', $sense->value)
                ->lockForUpdate()
                ->first();

            $nextNumber = max(
                (int) $sequence->last_number,
                $this->largestExistingNumber($sense)
            ) + 1;

            DB::table('verification_criterion_code_sequences')
                ->where('sense', $sense->value)
                ->update([
                    'last_number' => $nextNumber,
                    'updated_at' => $now,
                ]);

            return VerificationCriterion::query()->create([
                ...$data,
                'code' => sprintf('%s-%03d', $sense->codePrefix(), $nextNumber),
            ]);
        });
    }

    private function largestExistingNumber(FiveSSense $sense): int
    {
        $codes = DB::table('verification_criteria')
            ->where('sense', $sense->value)
            ->pluck('code');

        if (DB::getSchemaBuilder()->hasTable('supervision_answers')) {
            $codes = $codes->merge(
                DB::table('supervision_answers')
                    ->where('sense_snapshot', $sense->value)
                    ->pluck('criterion_code_snapshot')
            );
        }

        $pattern = '/^'.preg_quote($sense->codePrefix(), '/').'-(\d+)$/';

        return $codes->reduce(function (int $largest, string $code) use ($pattern): int {
            return preg_match($pattern, $code, $matches)
                ? max($largest, (int) $matches[1])
                : $largest;
        }, 0);
    }
}
