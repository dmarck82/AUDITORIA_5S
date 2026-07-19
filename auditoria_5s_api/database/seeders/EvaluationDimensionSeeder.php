<?php

namespace Database\Seeders;

use App\Models\EvaluationDimension;
use App\Models\Methodology;
use App\Support\CodeGenerator;
use Illuminate\Database\Seeder;

class EvaluationDimensionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            '5S' => [
                ['name' => 'Utilização', 'objective' => 'Supervisionar a permanência dos recursos necessários ao trabalho.', 'sort_order' => 1],
                ['name' => 'Ordenação', 'objective' => 'Supervisionar a organização e identificação dos recursos no ambiente.', 'sort_order' => 2],
                ['name' => 'Limpeza', 'objective' => 'Supervisionar as condições de limpeza e conservação do ambiente.', 'sort_order' => 3],
                ['name' => 'Padronização', 'objective' => 'Supervisionar a manutenção dos padrões definidos para o ambiente.', 'sort_order' => 4],
                ['name' => 'Disciplina', 'objective' => 'Supervisionar a aderência aos padrões estabelecidos.', 'sort_order' => 5],
            ],
            'Gestão Ambiental' => [
                ['name' => 'Resíduos', 'objective' => 'Supervisionar segregação, acondicionamento e destinação de resíduos.', 'sort_order' => 1],
                ['name' => 'Recursos naturais', 'objective' => 'Supervisionar condições relacionadas ao uso de água, energia e insumos.', 'sort_order' => 2],
                ['name' => 'Riscos ambientais', 'objective' => 'Supervisionar condições ambientais que possam gerar impactos ou desvios.', 'sort_order' => 3],
            ],
        ];

        foreach ($data as $methodologyName => $dimensions) {
            $methodology = Methodology::query()->where('name', $methodologyName)->first();

            if (! $methodology) {
                continue;
            }

            foreach ($dimensions as $dimensionData) {
                $dimension = EvaluationDimension::query()->firstOrNew([
                    'methodology_id' => $methodology->id,
                    'name' => $dimensionData['name'],
                ]);
                $dimension->fill([
                    'code' => $dimension->code ?: CodeGenerator::next(
                        'evaluation_dimensions',
                        'DIM',
                        fn ($query) => $query->where('methodology_id', $methodology->id)
                    ),
                    'objective' => $dimensionData['objective'],
                    'sort_order' => $dimensionData['sort_order'],
                    'active' => true,
                ]);
                $dimension->save();
            }
        }
    }
}
