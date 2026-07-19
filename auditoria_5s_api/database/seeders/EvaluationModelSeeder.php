<?php

namespace Database\Seeders;

use App\Models\EvaluationModel;
use App\Support\CodeGenerator;
use Illuminate\Database\Seeder;

class EvaluationModelSeeder extends Seeder
{
    public function run(): void
    {
        $models = [
            [
                'name' => 'Graduação específica',
                'description' => 'Modelo de avaliação por graduação definida para o critério.',
            ],
            [
                'name' => 'Aspectos e condição de atendimento',
                'description' => 'Modelo de avaliação baseado em aspectos de verificação e condição de atendimento.',
            ],
        ];

        foreach ($models as $modelData) {
            $model = EvaluationModel::query()->firstOrNew(['name' => $modelData['name']]);
            $model->fill([
                'code' => $model->code ?: CodeGenerator::next('evaluation_models', 'MOD'),
                'description' => $modelData['description'],
                'active' => true,
            ]);
            $model->save();
        }
    }
}
