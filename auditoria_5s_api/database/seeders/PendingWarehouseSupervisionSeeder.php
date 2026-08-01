<?php

namespace Database\Seeders;

use App\Enums\SupervisionStatus;
use App\Models\Operator;
use App\Models\Supervision;
use App\Models\User;
use App\Models\WorkEnvironment;
use App\Services\SupervisionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class PendingWarehouseSupervisionSeeder extends Seeder
{
    public function run(): void
    {
        $environment = WorkEnvironment::query()
            ->where('name', 'Área de Armazenagem do Almoxarifado')
            ->firstOrFail();
        $manager = Operator::query()
            ->whereHas('user', fn ($query) => $query->where('email', 'gestor.almoxarifado@aman.eb.mil.br'))
            ->firstOrFail();
        $respondent = User::query()
            ->where('email', 'respondente.almoxarifado@aman.eb.mil.br')
            ->firstOrFail();
        $startedAt = Carbon::create(2026, 8, 1, 10, 0, 0);
        $supervision = Supervision::query()
            ->where('work_environment_id', $environment->id)
            ->where('started_at', $startedAt)
            ->first();

        if (! $supervision) {
            $service = app(SupervisionService::class);
            $supervision = $service->create([
                'work_environment_id' => $environment->id,
                'responsible_user_id' => $respondent->id,
            ], $manager);
            $supervision->forceFill(['started_at' => $startedAt])->saveQuietly();
            $service->send($supervision, $manager);

            return;
        }

        if ($supervision->status === SupervisionStatus::Draft) {
            app(SupervisionService::class)->send($supervision, $manager);
        }
    }
}
