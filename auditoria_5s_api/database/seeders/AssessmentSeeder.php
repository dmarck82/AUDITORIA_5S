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

        $examples = [
            ['email' => 'admin@admin.com.br', 'status' => 'DRAFT', 'title' => 'Supervisão 5S - Almoxarifado - Rascunho'],
            ['email' => 'douglas@exemplo.com', 'status' => 'AVAILABLE', 'title' => 'Supervisão 5S - Almoxarifado - Disponível'],
            ['email' => 'marcello@exemplo.com', 'status' => 'IN_PROGRESS', 'title' => 'Supervisão 5S - Almoxarifado - Em andamento'],
        ];

        foreach ($examples as $index => $example) {
            $person = Person::query()->where('email', $example['email'])->first();

            if (! $person) {
                continue;
            }

            $assessment = Assessment::query()->firstOrNew([
                'title' => $example['title'],
                'person_id' => $person->id,
            ]);

            $assessment->forceFill([
                'questionnaire_id' => $questionnaire->id,
                'organization_id' => $person->organization_id,
                'unit_id' => $person->unit_id,
                'sector_id' => $person->sector_id,
                'status' => $example['status'],
                'access_code' => $assessment->access_code ?: Assessment::makeAccessCode(),
                'expires_at' => now()->addDays(15 + $index),
                'answered_at' => null,
                'active' => true,
            ])->save();
        }
    }
}
