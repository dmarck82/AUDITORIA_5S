<?php

namespace Database\Seeders;

use App\Models\Questionnaire;
use Illuminate\Database\Seeder;

class QuestionnairesSeeder extends Seeder
{
    public function run(): void
    {
        Questionnaire::query()->updateOrCreate(
            ['name' => '5S Standard Assessment'],
            [
                'description' => 'Questionário padrão para avaliações 5S em ambientes corporativos.',
                'active' => true,
            ]
        );
    }
}
