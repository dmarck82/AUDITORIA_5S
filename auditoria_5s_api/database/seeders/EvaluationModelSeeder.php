<?php

namespace Database\Seeders;

use App\Models\EvaluationModel;
use Illuminate\Database\Seeder;

class EvaluationModelSeeder extends Seeder
{
    public function run(): void
    {
        $models = [
            [
                'code' => 'M01',
                'name' => 'Graduação específica',
                'description' => 'Modelo de avaliação por graduação definida para o critério.',
            ],
            [
                'code' => 'M02',
                'name' => 'Aspectos e condição de atendimento',
                'description' => 'Modelo de avaliação baseado em aspectos de verificação e condição de atendimento.',
            ],
        ];

        foreach ($models as $model) {
            EvaluationModel::query()->updateOrCreate(
                ['code' => $model['code']],
                [
                    'name' => $model['name'],
                    'description' => $model['description'],
                    'active' => true,
                ]
            );
        }
    }
}
