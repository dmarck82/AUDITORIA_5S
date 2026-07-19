<?php

namespace Database\Seeders;

use App\Models\EvaluationModel;
use App\Models\EvaluationModelOption;
use Illuminate\Database\Seeder;

class EvaluationModelOptionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            'M02' => [
                ['value' => '0', 'description' => 'Compromete a execução da atividade', 'sort_order' => 1],
                ['value' => '5', 'description' => 'Apresenta falhas significativas', 'sort_order' => 2],
                ['value' => '10', 'description' => 'Atende parcialmente ao padrão', 'sort_order' => 3],
                ['value' => '15', 'description' => 'Atende plenamente ao padrão', 'sort_order' => 4],
            ],
        ];

        foreach ($data as $modelCode => $options) {
            $model = EvaluationModel::query()->where('code', $modelCode)->first();

            if (! $model) {
                continue;
            }

            foreach ($options as $option) {
                EvaluationModelOption::query()->updateOrCreate(
                    [
                        'evaluation_model_id' => $model->id,
                        'value' => $option['value'],
                    ],
                    [
                        'description' => $option['description'],
                        'sort_order' => $option['sort_order'],
                        'active' => true,
                    ]
                );
            }
        }
    }
}
