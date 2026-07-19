<?php

namespace Database\Seeders;

use App\Models\Criterion;
use App\Models\EvaluationDimension;
use App\Models\EvaluationModel;
use App\Support\CodeGenerator;
use Illuminate\Database\Seeder;

class CriterionSeeder extends Seeder
{
    public function run(): void
    {
        $model = EvaluationModel::query()->where('name', 'Aspectos e condição de atendimento')->first();

        if (! $model) {
            return;
        }

        $data = [
            [
                'methodology' => '5S',
                'dimension' => 'Utilização',
                'text' => 'Os materiais mantidos no Almoxarifado são necessários para a rotina de recebimento, armazenamento, conservação e distribuição.',
                'description' => 'Critério universal aplicado ao controle de utilização no Almoxarifado.',
            ],
            [
                'methodology' => '5S',
                'dimension' => 'Ordenação',
                'text' => 'Os materiais, prateleiras e áreas de circulação do Almoxarifado estão organizados e identificados conforme o padrão definido.',
                'description' => 'Critério universal aplicado à ordenação física e visual do Almoxarifado.',
            ],
            [
                'methodology' => '5S',
                'dimension' => 'Limpeza',
                'text' => 'O Almoxarifado apresenta condições de limpeza e conservação compatíveis com a guarda dos materiais.',
                'description' => 'Critério universal aplicado à limpeza e conservação do Almoxarifado.',
            ],
            [
                'methodology' => '5S',
                'dimension' => 'Padronização',
                'text' => 'Os padrões de organização, identificação e controle do Almoxarifado estão definidos, disponíveis e aplicados.',
                'description' => 'Critério universal aplicado à manutenção dos padrões do Almoxarifado.',
            ],
            [
                'methodology' => '5S',
                'dimension' => 'Disciplina',
                'text' => 'A equipe mantém as práticas estabelecidas para o Almoxarifado durante a rotina de trabalho.',
                'description' => 'Critério universal aplicado à aderência aos padrões do Almoxarifado.',
            ],
            [
                'methodology' => 'Gestão Ambiental',
                'dimension' => 'Resíduos',
                'text' => 'Os resíduos gerados no Almoxarifado são segregados, acondicionados e identificados conforme o padrão ambiental.',
                'description' => 'Critério universal aplicado ao controle de resíduos no Almoxarifado.',
            ],
            [
                'methodology' => 'Gestão Ambiental',
                'dimension' => 'Recursos naturais',
                'text' => 'O uso de água, energia e insumos no Almoxarifado ocorre em condições compatíveis com os padrões de controle definidos.',
                'description' => 'Critério universal aplicado ao uso de recursos naturais no Almoxarifado.',
            ],
            [
                'methodology' => 'Gestão Ambiental',
                'dimension' => 'Riscos ambientais',
                'text' => 'As condições do Almoxarifado reduzem a exposição a riscos ambientais e a potenciais impactos não controlados.',
                'description' => 'Critério universal aplicado a riscos ambientais no Almoxarifado.',
            ],
        ];

        foreach ($data as $criterionData) {
            $dimension = EvaluationDimension::query()
                ->where('name', $criterionData['dimension'])
                ->whereHas('methodology', fn ($query) => $query->where('name', $criterionData['methodology']))
                ->first();

            if (! $dimension) {
                continue;
            }

            $criterion = Criterion::query()->firstOrNew(['text' => $criterionData['text']]);
            $criterion->fill([
                'evaluation_dimension_id' => $dimension->id,
                'evaluation_model_id' => $model->id,
                'code' => $criterion->code ?: CodeGenerator::next('criteria', 'CRI'),
                'description' => $criterionData['description'],
                'active' => true,
            ]);
            $criterion->save();
        }
    }
}
