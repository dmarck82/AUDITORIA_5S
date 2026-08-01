<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Enums\FiveSSense;
use App\Enums\SupervisionStatus;
use App\Models\Local1;
use App\Models\Local2;
use App\Models\Local3;
use App\Models\Operator;
use App\Models\Supervision;
use App\Models\User;
use App\Models\VerificationCriterion;
use App\Models\WorkEnvironment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class WarehouseDemoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seed_creates_an_idempotent_warehouse_validation_scenario(): void
    {
        $this->seed();
        $this->seed();

        $local1 = Local1::query()->where('name', 'AMAN')->sole();
        $local2 = Local2::query()
            ->where('local_1_id', $local1->id)
            ->where('name', 'Base Administrativa')
            ->sole();
        $local3 = Local3::query()
            ->where('local_2_id', $local2->id)
            ->where('name', 'Almoxarifado')
            ->sole();
        $environment = WorkEnvironment::query()
            ->where('local_3_id', $local3->id)
            ->where('name', 'Área de Armazenagem do Almoxarifado')
            ->sole();

        $this->assertSame(20, $environment->verificationCriteria()->count());
        foreach (FiveSSense::cases() as $sense) {
            $this->assertSame(
                4,
                $environment->verificationCriteria()
                    ->where('sense', $sense->value)
                    ->count()
            );
        }
        $this->assertSame(20, VerificationCriterion::query()->count());

        $accounts = [
            'admin@admin.com.br' => AccessLevel::Administrator,
            'gestor.almoxarifado@aman.eb.mil.br' => AccessLevel::Manager,
            'operador.almoxarifado@aman.eb.mil.br' => AccessLevel::Operator,
            'respondente.almoxarifado@aman.eb.mil.br' => AccessLevel::Respondent,
            'visualizador.almoxarifado@aman.eb.mil.br' => AccessLevel::Viewer,
        ];

        foreach ($accounts as $email => $accessLevel) {
            $user = User::query()->where('email', $email)->sole();
            $operator = Operator::query()->where('user_id', $user->id)->sole();

            $this->assertSame($accessLevel->value, $operator->access_level);
            $this->assertTrue(Hash::check('resende123', $operator->password));
            $this->postJson('/api/auth/login', [
                'login' => $email,
                'password' => 'resende123',
            ])->assertOk();
        }

        $this->assertSame(5, User::query()->count());
        $this->assertSame(5, Operator::query()->count());
        $this->assertSame(2, Supervision::query()->count());

        $finalized = Supervision::query()
            ->with('answers')
            ->where('status', SupervisionStatus::Finalized->value)
            ->sole();
        $score = $finalized->scoreSummary();

        $this->assertSame(20, $score['total_criteria']);
        $this->assertSame(20, $score['answered_criteria']);
        $this->assertSame(19, $score['applicable_criteria']);
        $this->assertSame(1, $score['not_applicable_criteria']);
        $this->assertSame(9, $score['nonconformities']);
        $this->assertSame(150, $score['obtained_points']);
        $this->assertSame(285, $score['maximum_points']);
        $this->assertSame(52.63, $score['percentage']);
        $this->assertSame(
            9,
            $finalized->answers
                ->filter(fn ($answer): bool => $answer->isNonconformity())
                ->filter(fn ($answer): bool => filled($answer->observation))
                ->count()
        );

        $respondent = User::query()
            ->where('email', 'respondente.almoxarifado@aman.eb.mil.br')
            ->with('operator')
            ->sole();
        $pending = Supervision::query()
            ->where('status', SupervisionStatus::Pending->value)
            ->sole();

        $this->assertSame($respondent->id, $pending->responsible_user_id);
        $this->assertSame(0, $pending->scoreSummary()['answered_criteria']);
        $this->actingAs($respondent->operator, 'api')
            ->getJson('/api/supervisions')
            ->assertOk()
            ->assertJsonPath('data.0.id', $pending->id)
            ->assertJsonPath('data.0.actions.can_answer', true);
    }
}
