<?php

namespace Database\Seeders;

use App\Models\Methodology;
use App\Support\CodeGenerator;
use Illuminate\Database\Seeder;

class MethodologySeeder extends Seeder
{
    public function run(): void
    {
        $methodologies = [
            [
                'name' => '5S',
                'description' => 'Metodologia para supervisão de organização, ordenação, limpeza, padronização e disciplina no ambiente de trabalho.',
            ],
            [
                'name' => 'Gestão Ambiental',
                'description' => 'Metodologia para supervisão de condições ambientais no ambiente de trabalho.',
            ],
        ];

        foreach ($methodologies as $methodologyData) {
            $methodology = Methodology::query()->firstOrNew(['name' => $methodologyData['name']]);
            $methodology->fill([
                'code' => $methodology->code ?: CodeGenerator::next('methodologies', 'MET'),
                'description' => $methodologyData['description'],
                'active' => true,
            ]);
            $methodology->save();
        }
    }
}
