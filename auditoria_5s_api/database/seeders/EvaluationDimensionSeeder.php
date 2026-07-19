<?php

namespace Database\Seeders;

use App\Models\EvaluationDimension;
use App\Models\Methodology;
use Illuminate\Database\Seeder;

class EvaluationDimensionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            '5S' => [
                ['code' => 'SEIRI', 'name' => 'Utilização', 'objective' => 'Supervisionar a permanência dos recursos necessários ao trabalho.', 'sort_order' => 1],
                ['code' => 'SEITON', 'name' => 'Ordenação', 'objective' => 'Supervisionar a organização e identificação dos recursos no ambiente.', 'sort_order' => 2],
                ['code' => 'SEISO', 'name' => 'Limpeza', 'objective' => 'Supervisionar as condições de limpeza e conservação do ambiente.', 'sort_order' => 3],
                ['code' => 'SEIKETSU', 'name' => 'Padronização', 'objective' => 'Supervisionar a manutenção dos padrões definidos para o ambiente.', 'sort_order' => 4],
                ['code' => 'SHITSUKE', 'name' => 'Disciplina', 'objective' => 'Supervisionar a aderência aos padrões estabelecidos.', 'sort_order' => 5],
            ],
            'GA' => [
                ['code' => 'RES', 'name' => 'Resíduos', 'objective' => 'Supervisionar segregação, acondicionamento e destinação de resíduos.', 'sort_order' => 1],
                ['code' => 'REC', 'name' => 'Recursos naturais', 'objective' => 'Supervisionar condições relacionadas ao uso de água, energia e insumos.', 'sort_order' => 2],
                ['code' => 'RIS', 'name' => 'Riscos ambientais', 'objective' => 'Supervisionar condições ambientais que possam gerar impactos ou desvios.', 'sort_order' => 3],
            ],
        ];

        foreach ($data as $methodologyCode => $dimensions) {
            $methodology = Methodology::query()->where('code', $methodologyCode)->first();

            if (! $methodology) {
                continue;
            }

            foreach ($dimensions as $dimension) {
                EvaluationDimension::query()->updateOrCreate(
                    [
                        'methodology_id' => $methodology->id,
                        'code' => $dimension['code'],
                    ],
                    [
                        'name' => $dimension['name'],
                        'objective' => $dimension['objective'],
                        'sort_order' => $dimension['sort_order'],
                        'active' => true,
                    ]
                );
            }
        }
    }
}
