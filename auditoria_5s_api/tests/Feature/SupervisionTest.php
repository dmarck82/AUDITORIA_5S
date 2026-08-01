<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Enums\FiveSSense;
use App\Models\Local1;
use App\Models\Local2;
use App\Models\Local3;
use App\Models\Operator;
use App\Models\User;
use App\Models\VerificationCriterion;
use App\Models\WorkEnvironment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupervisionTest extends TestCase
{
    use RefreshDatabase;

    public function test_criterion_uses_defaults_for_blank_labels_and_accepts_custom_labels(): void
    {
        $administrator = $this->operator(AccessLevel::Administrator);

        $response = $this->actingAs($administrator, 'api')->postJson('/api/verification-criteria', [
            'sense' => FiveSSense::Utilization->value,
            'question' => 'O requisito é atendido?',
            'response_0_label' => '',
            'response_5_label' => 'Resposta personalizada de cinco pontos',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.response_0_label', 'Não atende ao requisito')
            ->assertJsonPath('data.response_5_label', 'Resposta personalizada de cinco pontos')
            ->assertJsonPath('data.response_10_label', 'Atende, com pequenas oportunidades de melhoria')
            ->assertJsonPath('data.response_15_label', 'Atende plenamente ao padrão estabelecido');
    }

    public function test_complete_workflow_supports_partial_answers_and_historical_snapshots(): void
    {
        $scope = $this->scope('Fluxo');
        $manager = $this->operator(AccessLevel::Manager, $scope['local2']);
        $respondent = $this->operator(AccessLevel::Respondent, $scope['local2'], $scope['local3a']);
        $criteria = collect(FiveSSense::cases())->map(fn (FiveSSense $sense, int $index) => VerificationCriterion::factory()->create([
            'code' => 'FLOW-'.($index + 1),
            'sense' => $sense,
            'question' => "Pergunta {$index}?",
        ]));
        $scope['environmentA']->verificationCriteria()->sync($criteria->pluck('id'));

        $create = $this->actingAs($manager, 'api')->postJson('/api/supervisions', [
            'work_environment_id' => $scope['environmentA']->id,
            'responsible_user_id' => $respondent->user_id,
        ])->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.actions.can_send', true)
            ->assertJsonPath('data.actions.can_answer', false)
            ->assertJsonPath('data.answers.0.question', 'Pergunta 0?');

        $supervisionId = $create->json('data.id');
        $answers = $create->json('data.answers');
        $criteria->first()->update(['question' => 'Pergunta alterada depois da criação?']);

        $this->actingAs($respondent, 'api')->getJson('/api/supervisions')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->actingAs($manager, 'api')->postJson("/api/supervisions/{$supervisionId}/send")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending');

        $this->actingAs($respondent, 'api')->getJson("/api/supervisions/{$supervisionId}")
            ->assertOk()
            ->assertJsonPath('data.actions.can_answer', true)
            ->assertJsonPath('data.answers.0.question', 'Pergunta 0?');

        $this->putJson("/api/supervisions/{$supervisionId}/answers", [
            'answers' => [[
                'id' => $answers[0]['id'],
                'selected_value' => null,
                'not_applicable' => false,
            ]],
        ])->assertOk()
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.score.answered_criteria', 0);

        $values = [0, 5, 10, 15, null];
        $payload = collect($answers)->map(function (array $answer, int $index) use ($values): array {
            $notApplicable = $index === 4;

            return [
                'id' => $answer['id'],
                'selected_value' => $notApplicable ? null : $values[$index],
                'not_applicable' => $notApplicable,
                'observation' => in_array($values[$index], [0, 5], true) ? 'Falha registrada.' : null,
                'evidence' => $index === 0 ? 'Registro visual disponível.' : null,
            ];
        })->all();

        $this->putJson("/api/supervisions/{$supervisionId}/answers", ['answers' => $payload])
            ->assertOk()
            ->assertJsonPath('data.score.answered_criteria', 5)
            ->assertJsonPath('data.score.percentage', 50)
            ->assertJsonPath('data.score.nonconformities', 2);

        $this->postJson("/api/supervisions/{$supervisionId}/submit")
            ->assertOk()
            ->assertJsonPath('data.status', 'answered')
            ->assertJsonPath('data.actions.can_answer', false);

        $this->actingAs($manager, 'api')->postJson("/api/supervisions/{$supervisionId}/finalize")
            ->assertOk()
            ->assertJsonPath('data.status', 'finalized')
            ->assertJsonPath('data.can_edit', false);

        $this->putJson("/api/supervisions/{$supervisionId}/answers", ['answers' => $payload])
            ->assertConflict();
        $this->deleteJson("/api/supervisions/{$supervisionId}")
            ->assertConflict();
    }

    public function test_invalid_transitions_and_answer_rules_are_rejected(): void
    {
        $scope = $this->scope('Validação');
        $manager = $this->operator(AccessLevel::Manager, $scope['local2']);
        $respondent = $this->operator(AccessLevel::Respondent, $scope['local2'], $scope['local3a']);
        $supervisionId = $this->createDraft($manager, $scope['environmentA'], $respondent->user)->json('data.id');

        $this->actingAs($manager, 'api')->postJson("/api/supervisions/{$supervisionId}/finalize")
            ->assertConflict();

        $this->postJson("/api/supervisions/{$supervisionId}/send")->assertOk();
        $this->postJson("/api/supervisions/{$supervisionId}/send")->assertConflict();

        $show = $this->actingAs($respondent, 'api')->getJson("/api/supervisions/{$supervisionId}")->assertOk();
        $answerId = $show->json('data.answers.0.id');

        $this->putJson("/api/supervisions/{$supervisionId}/answers", [
            'answers' => [[
                'id' => $answerId,
                'selected_value' => 7,
                'not_applicable' => false,
            ]],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('answers.0.selected_value');

        $this->putJson("/api/supervisions/{$supervisionId}/answers", [
            'answers' => [[
                'id' => $answerId,
                'selected_value' => 5,
                'not_applicable' => false,
                'observation' => '',
            ]],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('answers.0.observation');

        $this->postJson("/api/supervisions/{$supervisionId}/submit")
            ->assertUnprocessable();
    }

    public function test_visibility_and_creation_options_follow_local_2_and_local_3_scope(): void
    {
        $scopeA = $this->scope('A');
        $scopeB = $this->scope('B');
        $managerA = $this->operator(AccessLevel::Manager, $scopeA['local2']);
        $managerA3 = $this->operator(AccessLevel::Manager, $scopeA['local2'], $scopeA['local3a']);
        $managerB = $this->operator(AccessLevel::Manager, $scopeB['local2']);
        $operatorA3 = $this->operator(AccessLevel::Operator, $scopeA['local2'], $scopeA['local3a']);
        $respondentA1 = $this->operator(AccessLevel::Respondent, $scopeA['local2'], $scopeA['local3a']);
        $respondentA2 = $this->operator(AccessLevel::Respondent, $scopeA['local2'], $scopeA['local3b']);
        $respondentB = $this->operator(AccessLevel::Respondent, $scopeB['local2'], $scopeB['local3a']);
        $viewer = $this->operator(AccessLevel::Viewer, $scopeA['local2']);

        $a1 = $this->createAndSend($managerA, $scopeA['environmentA'], $respondentA1->user);
        $this->createAndSend($managerA, $scopeA['environmentB'], $respondentA2->user);
        $b1 = $this->createAndSend($managerB, $scopeB['environmentA'], $respondentB->user);

        $this->actingAs($managerA, 'api')->getJson('/api/supervisions')
            ->assertOk()->assertJsonCount(2, 'data');
        $this->actingAs($operatorA3, 'api')->getJson('/api/supervisions')
            ->assertOk()->assertJsonCount(1, 'data');
        $this->actingAs($respondentA1, 'api')->getJson('/api/supervisions')
            ->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $a1);
        $this->actingAs($respondentA1, 'api')->getJson("/api/supervisions/{$b1}")
            ->assertForbidden();
        $this->actingAs($viewer, 'api')->getJson('/api/supervisions')
            ->assertForbidden();

        $local2Options = $this->actingAs($managerA, 'api')->getJson('/api/supervisions/options')
            ->assertOk();
        $this->assertCount(2, $local2Options->json('data.work_environments'));

        $local3Options = $this->actingAs($managerA3, 'api')->getJson('/api/supervisions/options')
            ->assertOk();
        $this->assertSame(
            [$scopeA['environmentA']->id],
            collect($local3Options->json('data.work_environments'))->pluck('id')->all()
        );
    }

    public function test_creation_and_deletion_respect_profile_scope_and_authorship(): void
    {
        $scopeA = $this->scope('Permissão A');
        $scopeB = $this->scope('Permissão B');
        $manager = $this->operator(AccessLevel::Manager, $scopeA['local2']);
        $otherManager = $this->operator(AccessLevel::Manager, $scopeA['local2']);
        $operator = $this->operator(AccessLevel::Operator, $scopeA['local2']);
        $respondentA = $this->operator(AccessLevel::Respondent, $scopeA['local2'], $scopeA['local3a']);
        $respondentB = $this->operator(AccessLevel::Respondent, $scopeB['local2'], $scopeB['local3a']);

        $this->actingAs($operator, 'api')->postJson('/api/supervisions', [
            'work_environment_id' => $scopeA['environmentA']->id,
            'responsible_user_id' => $respondentA->user_id,
        ])->assertForbidden();

        $this->actingAs($manager, 'api')->postJson('/api/supervisions', [
            'work_environment_id' => $scopeB['environmentA']->id,
            'responsible_user_id' => $respondentB->user_id,
        ])->assertForbidden();

        $draft = $this->createDraft($manager, $scopeA['environmentA'], $respondentA->user);
        $draftId = $draft->json('data.id');

        $this->actingAs($otherManager, 'api')->deleteJson("/api/supervisions/{$draftId}")
            ->assertForbidden();
        $this->actingAs($manager, 'api')->deleteJson("/api/supervisions/{$draftId}")
            ->assertNoContent();
    }

    public function test_manager_or_operator_can_assume_with_justification_and_history(): void
    {
        $scope = $this->scope('Assunção');
        $otherScope = $this->scope('Assunção externa');
        $manager = $this->operator(AccessLevel::Manager, $scope['local2']);
        $operator = $this->operator(AccessLevel::Operator, $scope['local2']);
        $outsideOperator = $this->operator(AccessLevel::Operator, $otherScope['local2']);
        $respondent = $this->operator(AccessLevel::Respondent, $scope['local2'], $scope['local3a']);
        $supervisionId = $this->createAndSend($manager, $scope['environmentA'], $respondent->user);

        $this->actingAs($operator, 'api')->postJson("/api/supervisions/{$supervisionId}/assume", [
            'justification' => '',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('justification');

        $this->actingAs($outsideOperator, 'api')->postJson("/api/supervisions/{$supervisionId}/assume", [
            'justification' => 'Substituição externa.',
        ])->assertForbidden();

        $this->actingAs($respondent, 'api')->postJson("/api/supervisions/{$supervisionId}/assume", [
            'justification' => 'Tentativa do respondente.',
        ])->assertForbidden();

        $this->actingAs($operator, 'api')->postJson("/api/supervisions/{$supervisionId}/assume", [
            'justification' => 'Responsável original está afastado.',
        ])->assertOk()
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.responsible_user_id', $operator->user_id)
            ->assertJsonPath('data.responsibility_transfers.0.from_user_id', $respondent->user_id)
            ->assertJsonPath('data.responsibility_transfers.0.to_user_id', $operator->user_id)
            ->assertJsonPath('data.responsibility_transfers.0.justification', 'Responsável original está afastado.')
            ->assertJsonPath('data.actions.can_answer', true);

        $this->actingAs($respondent, 'api')->getJson('/api/supervisions')
            ->assertOk()->assertJsonCount(0, 'data');
    }

    /** @return array{local1: Local1, local2: Local2, local3a: Local3, local3b: Local3, environmentA: WorkEnvironment, environmentB: WorkEnvironment} */
    private function scope(string $suffix): array
    {
        $local1 = Local1::factory()->create(['name' => "Organização {$suffix}"]);
        $local2 = Local2::factory()->create(['local_1_id' => $local1->id, 'name' => "Setor {$suffix}"]);
        $local3a = Local3::factory()->create(['local_2_id' => $local2->id, 'name' => "Seção A {$suffix}"]);
        $local3b = Local3::factory()->create(['local_2_id' => $local2->id, 'name' => "Seção B {$suffix}"]);
        $environmentA = WorkEnvironment::factory()->create(['local_3_id' => $local3a->id, 'name' => "Ambiente A {$suffix}"]);
        $environmentB = WorkEnvironment::factory()->create(['local_3_id' => $local3b->id, 'name' => "Ambiente B {$suffix}"]);
        $criterion = VerificationCriterion::factory()->create();
        $environmentA->verificationCriteria()->attach($criterion);
        $environmentB->verificationCriteria()->attach($criterion);

        return compact('local1', 'local2', 'local3a', 'local3b', 'environmentA', 'environmentB');
    }

    private function operator(AccessLevel $level, ?Local2 $local2 = null, ?Local3 $local3 = null): Operator
    {
        $user = User::factory()->create([
            'local_1_id' => $local2?->local_1_id ?? Local1::factory(),
            'local_2_id' => $local2?->id,
            'local_3_id' => $local3?->id,
        ]);

        return Operator::factory()->create([
            'user_id' => $user->id,
            'access_level' => $level->value,
        ]);
    }

    private function createDraft(Operator $creator, WorkEnvironment $environment, User $responsible)
    {
        return $this->actingAs($creator, 'api')->postJson('/api/supervisions', [
            'work_environment_id' => $environment->id,
            'responsible_user_id' => $responsible->id,
        ])->assertCreated();
    }

    private function createAndSend(Operator $creator, WorkEnvironment $environment, User $responsible): int
    {
        $id = $this->createDraft($creator, $environment, $responsible)->json('data.id');
        $this->postJson("/api/supervisions/{$id}/send")->assertOk();

        return $id;
    }
}
