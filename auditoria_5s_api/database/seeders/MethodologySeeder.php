<?php

namespace Database\Seeders;

use App\Models\Methodology;
use Illuminate\Database\Seeder;

class MethodologySeeder extends Seeder
{
    public function run(): void
    {
        $methodologies = [
            [
                'code' => '5S',
                'name' => '5S',
                'description' => 'Metodologia para supervisão de organização, ordenação, limpeza, padronização e disciplina.',
            ],
            [
                'code' => 'GA',
                'name' => 'Gestão Ambiental',
                'description' => 'Metodologia para supervisão de condições ambientais de trabalho.',
            ],
        ];

        foreach ($methodologies as $methodology) {
            Methodology::query()->updateOrCreate(
                ['code' => $methodology['code']],
                [
                    'name' => $methodology['name'],
                    'description' => $methodology['description'],
                    'active' => true,
                ]
            );
        }
    }
}
