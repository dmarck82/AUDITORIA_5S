<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Person;
use App\Models\Questionnaire;
use Illuminate\Database\Seeder;

class AssessmentSeeder extends Seeder
{
    public function run(): void
    {
        $questionnaire = Questionnaire::query()
            ->where('name', '5S Standard Assessment')
            ->firstOrFail();

        $people = Person::query()
            ->where('active', true)
            ->whereNotNull('unit_id')
            ->whereNotNull('sector_id')
            ->orderBy('id')
            ->take(5)
            ->get();

        $statuses = ['DRAFT', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

        foreach ($statuses as $index => $status) {
            $person = $people[$index] ?? $people->first();

            if (! $person) {
                return;
            }

            $assessment = Assessment::query()->firstOrNew([
                'title' => "Avaliação 5S - {$person->name} - {$status}",
                'person_id' => $person->id,
            ]);

            $assessment->forceFill([
                'questionnaire_id' => $questionnaire->id,
                'organization_id' => $person->organization_id,
                'unit_id' => $person->unit_id,
                'sector_id' => $person->sector_id,
                'status' => $status,
                'access_code' => $assessment->access_code ?: Assessment::makeAccessCode(),
                'expires_at' => now()->addDays(15 + $index),
                'answered_at' => $status === 'COMPLETED' ? now()->subDay() : null,
                'active' => $status !== 'CANCELLED',
            ])->save();
        }
    }
}
