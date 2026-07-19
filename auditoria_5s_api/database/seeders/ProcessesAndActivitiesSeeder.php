<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Process as WorkProcess;
use App\Models\Sector;
use Illuminate\Database\Seeder;

class ProcessesAndActivitiesSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            'Almoxarifado de Treinamento' => [
                'Gestão do Almoxarifado' => [
                    'Recebimento',
                    'Armazenamento',
                    'Conservação',
                    'Distribuição',
                ],
            ],
            'Estoque' => [
                'Gestão de Estoque' => [
                    'Recebimento de produtos',
                    'Endereçamento',
                    'Separação',
                    'Inventário',
                ],
            ],
            'Expedição' => [
                'Expedição de Materiais' => [
                    'Conferência',
                    'Embalagem',
                    'Carregamento',
                    'Registro de saída',
                ],
            ],
            'Produção' => [
                'Operação da Linha Produtiva' => [
                    'Preparação do posto',
                    'Execução da operação',
                    'Inspeção visual',
                    'Liberação da área',
                ],
            ],
            'Qualidade' => [
                'Controle da Qualidade' => [
                    'Coleta de amostras',
                    'Inspeção',
                    'Registro de desvios',
                    'Liberação do lote',
                ],
            ],
        ];

        foreach ($data as $sectorName => $processes) {
            $sector = Sector::query()
                ->where('name', $sectorName)
                ->orderBy('id')
                ->first();

            if (! $sector) {
                continue;
            }

            foreach ($processes as $processName => $activities) {
                $process = WorkProcess::query()->updateOrCreate(
                    [
                        'sector_id' => $sector->id,
                        'name' => $processName,
                    ],
                    [
                        'description' => "Processo operacional do setor {$sectorName}.",
                        'active' => true,
                    ]
                );

                foreach ($activities as $index => $activityName) {
                    Activity::query()->updateOrCreate(
                        [
                            'process_id' => $process->id,
                            'name' => $activityName,
                        ],
                        [
                            'description' => null,
                            'sort_order' => $index + 1,
                            'active' => true,
                        ]
                    );
                }
            }
        }
    }
}
