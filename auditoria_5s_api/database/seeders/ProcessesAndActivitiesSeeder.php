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
        $sector = Sector::query()->where('name', 'Almoxarifado')->first();

        if (! $sector) {
            return;
        }

        $processes = [
            'Gestão do Almoxarifado' => [
                'Recebimento de materiais',
                'Armazenamento em prateleiras',
                'Conservação dos materiais',
                'Distribuição para solicitantes',
            ],
            'Controle de Estoque do Almoxarifado' => [
                'Registro de entrada',
                'Endereçamento físico',
                'Inventário periódico',
                'Separação de materiais',
            ],
        ];

        foreach ($processes as $processName => $activities) {
            $process = WorkProcess::query()->updateOrCreate(
                [
                    'sector_id' => $sector->id,
                    'name' => $processName,
                ],
                [
                    'description' => 'Processo operacional usado como referência para os exemplos do Almoxarifado.',
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
