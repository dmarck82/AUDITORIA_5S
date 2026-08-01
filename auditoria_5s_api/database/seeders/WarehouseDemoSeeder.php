<?php

namespace Database\Seeders;

use App\Enums\AccessLevel;
use App\Enums\FiveSSense;
use App\Enums\ResponseScore;
use App\Enums\SupervisionStatus;
use App\Models\Local1;
use App\Models\Local2;
use App\Models\Local3;
use App\Models\Operator;
use App\Models\Supervision;
use App\Models\User;
use App\Models\VerificationCriterion;
use App\Models\WorkEnvironment;
use App\Services\SupervisionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class WarehouseDemoSeeder extends Seeder
{
    private const PASSWORD = 'resende123';

    public function run(): void
    {
        $local1 = Local1::query()->updateOrCreate(
            ['name' => 'AMAN'],
            ['active' => true]
        );
        $local2 = Local2::query()->updateOrCreate(
            ['local_1_id' => $local1->id, 'name' => 'Base Administrativa'],
            ['address' => 'Resende - RJ', 'active' => true]
        );
        $local3 = Local3::query()->updateOrCreate(
            ['local_2_id' => $local2->id, 'name' => 'Almoxarifado'],
            [
                'description' => 'Setor responsável pelo recebimento, armazenamento e distribuição de materiais.',
                'active' => true,
            ]
        );
        $environment = WorkEnvironment::query()->updateOrCreate(
            [
                'local_3_id' => $local3->id,
                'name' => 'Área de Armazenagem do Almoxarifado',
            ],
            [
                'description' => 'Área de recebimento, guarda, separação e expedição de materiais.',
                'active' => true,
            ]
        );

        $accounts = collect($this->accounts())->mapWithKeys(function (array $account) use ($local1, $local2, $local3): array {
            $user = User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'phone' => $account['phone'],
                    'local_1_id' => $local1->id,
                    'local_2_id' => $local2->id,
                    'local_3_id' => $local3->id,
                    'job_title' => $account['job_title'],
                    'active' => true,
                ]
            );
            $operator = Operator::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'password' => self::PASSWORD,
                    'access_level' => $account['access_level']->value,
                    'active' => true,
                ]
            );

            return [$account['key'] => compact('user', 'operator')];
        });

        $labels = collect(ResponseScore::cases())->mapWithKeys(
            fn (ResponseScore $score): array => [$score->fieldName() => $score->defaultLabel()]
        )->all();
        $criteria = collect($this->criteria())->map(
            fn (array $criterion): VerificationCriterion => VerificationCriterion::query()->updateOrCreate(
                ['code' => $criterion['code']],
                [
                    'sense' => $criterion['sense']->value,
                    'question' => $criterion['question'],
                    ...$labels,
                    'active' => true,
                ]
            )
        );
        $environment->verificationCriteria()->syncWithoutDetaching($criteria->pluck('id')->all());

        $this->seedSupervision(
            $environment,
            $accounts->get('respondent')['user'],
            $accounts->get('manager')['operator'],
            $accounts->get('respondent')['operator']
        );
    }

    private function seedSupervision(
        WorkEnvironment $environment,
        User $responsible,
        Operator $creator,
        Operator $respondent
    ): void {
        $startedAt = Carbon::create(2026, 8, 1, 9, 0, 0);
        $existing = Supervision::query()
            ->where('work_environment_id', $environment->id)
            ->where('started_at', $startedAt)
            ->first();

        if ($existing?->status === SupervisionStatus::Finalized) {
            return;
        }

        $service = app(SupervisionService::class);
        $supervision = $existing ?? $service->create([
            'work_environment_id' => $environment->id,
            'responsible_user_id' => $responsible->id,
        ], $creator);

        if (! $existing) {
            $supervision->forceFill(['started_at' => $startedAt])->saveQuietly();
        }

        if ($supervision->status === SupervisionStatus::Draft) {
            $supervision = $service->send($supervision, $creator);
        }
        $answers = $supervision->answers()
            ->orderBy('sense_snapshot')
            ->orderBy('criterion_code_snapshot')
            ->get()
            ->values()
            ->map(function ($answer, int $index): array {
                $isNotApplicable = $answer->criterion_code_snapshot === 'DISC-004';
                $selectedValue = $isNotApplicable ? null : [15, 10, 5, 0][$index % 4];
                $isNonconformity = in_array($selectedValue, [0, 5], true);

                return [
                    'id' => $answer->id,
                    'selected_value' => $selectedValue,
                    'not_applicable' => $isNotApplicable,
                    'observation' => $isNonconformity
                        ? 'Situação identificada durante a supervisão demonstrativa e pendente de correção.'
                        : null,
                    'evidence' => $selectedValue === 0
                        ? 'Registro visual disponível no cenário de demonstração.'
                        : null,
                ];
            })
            ->all();

        $supervision = $service->saveAnswers($supervision, $answers, $respondent);
        $supervision = $service->submit($supervision, $respondent);
        $service->finalize($supervision, $creator);
    }

    /** @return array<int, array<string, mixed>> */
    private function accounts(): array
    {
        return [
            [
                'key' => 'administrator',
                'name' => 'Administrador do Sistema',
                'email' => 'admin@admin.com.br',
                'phone' => '24999990001',
                'job_title' => 'Administrador do SSEP',
                'access_level' => AccessLevel::Administrator,
            ],
            [
                'key' => 'manager',
                'name' => 'Gestor do Almoxarifado',
                'email' => 'gestor.almoxarifado@aman.eb.mil.br',
                'phone' => '24999990002',
                'job_title' => 'Chefe do Almoxarifado',
                'access_level' => AccessLevel::Manager,
            ],
            [
                'key' => 'operator',
                'name' => 'Operador de Supervisão',
                'email' => 'operador.almoxarifado@aman.eb.mil.br',
                'phone' => '24999990003',
                'job_title' => 'Supervisor 5S',
                'access_level' => AccessLevel::Operator,
            ],
            [
                'key' => 'respondent',
                'name' => 'Respondente do Almoxarifado',
                'email' => 'respondente.almoxarifado@aman.eb.mil.br',
                'phone' => '24999990004',
                'job_title' => 'Auxiliar de Almoxarifado',
                'access_level' => AccessLevel::Respondent,
            ],
            [
                'key' => 'viewer',
                'name' => 'Visualizador do Almoxarifado',
                'email' => 'visualizador.almoxarifado@aman.eb.mil.br',
                'phone' => '24999990005',
                'job_title' => 'Observador',
                'access_level' => AccessLevel::Viewer,
            ],
        ];
    }

    /** @return array<int, array{code: string, sense: FiveSSense, question: string}> */
    private function criteria(): array
    {
        return [
            ['code' => 'UTIL-001', 'sense' => FiveSSense::Utilization, 'question' => 'Os materiais sem uso, obsoletos ou danificados estão identificados e segregados?'],
            ['code' => 'UTIL-002', 'sense' => FiveSSense::Utilization, 'question' => 'Os itens mantidos no estoque são necessários às atividades atendidas pelo almoxarifado?'],
            ['code' => 'UTIL-003', 'sense' => FiveSSense::Utilization, 'question' => 'As áreas de circulação estão livres de materiais desnecessários?'],
            ['code' => 'UTIL-004', 'sense' => FiveSSense::Utilization, 'question' => 'As quantidades armazenadas evitam excessos sem comprometer o atendimento?'],
            ['code' => 'ORD-001', 'sense' => FiveSSense::Ordering, 'question' => 'Todos os materiais e suas posições de armazenamento estão claramente identificados?'],
            ['code' => 'ORD-002', 'sense' => FiveSSense::Ordering, 'question' => 'O endereçamento físico dos materiais corresponde aos registros de estoque?'],
            ['code' => 'ORD-003', 'sense' => FiveSSense::Ordering, 'question' => 'Corredores, áreas de recebimento e áreas de expedição estão demarcados e desobstruídos?'],
            ['code' => 'ORD-004', 'sense' => FiveSSense::Ordering, 'question' => 'Os materiais estão organizados de forma segura e com acesso adequado à frequência de uso?'],
            ['code' => 'LIMP-001', 'sense' => FiveSSense::Cleaning, 'question' => 'Pisos, prateleiras e bancadas estão limpos e sem acúmulo de resíduos?'],
            ['code' => 'LIMP-002', 'sense' => FiveSSense::Cleaning, 'question' => 'Existe rotina definida e executada para limpeza do almoxarifado?'],
            ['code' => 'LIMP-003', 'sense' => FiveSSense::Cleaning, 'question' => 'O ambiente está livre de vazamentos, derramamentos e focos de contaminação?'],
            ['code' => 'LIMP-004', 'sense' => FiveSSense::Cleaning, 'question' => 'Equipamentos de movimentação e áreas de difícil acesso apresentam condições adequadas de limpeza?'],
            ['code' => 'PAD-001', 'sense' => FiveSSense::Standardization, 'question' => 'A identificação visual de materiais, endereços e áreas segue um padrão único?'],
            ['code' => 'PAD-002', 'sense' => FiveSSense::Standardization, 'question' => 'Os procedimentos de recebimento, armazenamento e distribuição estão documentados e acessíveis?'],
            ['code' => 'PAD-003', 'sense' => FiveSSense::Standardization, 'question' => 'As sinalizações de segurança e capacidade de armazenamento estão visíveis e atualizadas?'],
            ['code' => 'PAD-004', 'sense' => FiveSSense::Standardization, 'question' => 'As condições de iluminação, ventilação e conservação do ambiente atendem ao padrão estabelecido?'],
            ['code' => 'DISC-001', 'sense' => FiveSSense::Discipline, 'question' => 'A equipe cumpre as rotinas e os padrões definidos para o almoxarifado?'],
            ['code' => 'DISC-002', 'sense' => FiveSSense::Discipline, 'question' => 'Os registros de entrada, saída e inventário são mantidos atualizados?'],
            ['code' => 'DISC-003', 'sense' => FiveSSense::Discipline, 'question' => 'Os desvios identificados são comunicados e tratados dentro dos prazos definidos?'],
            ['code' => 'DISC-004', 'sense' => FiveSSense::Discipline, 'question' => 'São realizadas verificações periódicas para manter as condições dos cinco sensos?'],
        ];
    }
}
