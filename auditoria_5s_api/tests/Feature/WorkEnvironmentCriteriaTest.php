<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Enums\FiveSSense;
use App\Models\Operator;
use App\Models\User;
use App\Models\VerificationCriterion;
use App\Models\WorkEnvironment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkEnvironmentCriteriaTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_view_and_sync_environment_criteria(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
        $environment = WorkEnvironment::factory()->create();
        $activeCriterion = VerificationCriterion::factory()->create([
            'code' => 'UTIL-001',
            'sense' => FiveSSense::Utilization,
        ]);
        $inactiveCriterion = VerificationCriterion::factory()->create([
            'code' => 'LIMP-001',
            'sense' => FiveSSense::Cleaning,
            'active' => false,
        ]);

        $this->actingAs($operator, 'api')
            ->getJson("/api/work-environments/{$environment->id}/criteria")
            ->assertOk()
            ->assertJsonPath('data.work_environment.id', $environment->id)
            ->assertJsonPath('data.criteria.0.code', 'UTIL-001')
            ->assertJsonPath('data.criteria.0.linked', false)
            ->assertJsonPath('data.criteria.1.code', 'LIMP-001')
            ->assertJsonPath('data.criteria.1.active', false);

        $this->putJson("/api/work-environments/{$environment->id}/criteria", [
            'criterion_ids' => [$activeCriterion->id, $inactiveCriterion->id],
        ])->assertOk()
            ->assertJsonPath('data.criteria.0.linked', true)
            ->assertJsonPath('data.criteria.1.linked', true);

        $this->assertDatabaseHas('work_environment_criteria', [
            'work_environment_id' => $environment->id,
            'verification_criterion_id' => $activeCriterion->id,
        ]);

        $this->putJson("/api/work-environments/{$environment->id}/criteria", [
            'criterion_ids' => [$inactiveCriterion->id],
        ])->assertOk();

        $this->assertDatabaseMissing('work_environment_criteria', [
            'work_environment_id' => $environment->id,
            'verification_criterion_id' => $activeCriterion->id,
        ]);
        $this->getJson("/api/work-environments/{$environment->id}")
            ->assertOk()
            ->assertJsonPath('data.verification_criteria_count', 1)
            ->assertJsonPath('data.active_verification_criteria_count', 0);
    }

    public function test_viewer_can_view_but_cannot_sync_environment_criteria(): void
    {
        $viewer = Operator::factory()->create([
            'access_level' => AccessLevel::Viewer->value,
        ]);
        $environment = WorkEnvironment::factory()->create();
        $criterion = VerificationCriterion::factory()->create();

        $this->actingAs($viewer, 'api')
            ->getJson("/api/work-environments/{$environment->id}/criteria")
            ->assertOk();

        $this->putJson("/api/work-environments/{$environment->id}/criteria", [
            'criterion_ids' => [$criterion->id],
        ])->assertForbidden();
    }

    public function test_supervision_uses_only_active_criteria_linked_to_the_environment(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
        $environment = WorkEnvironment::factory()->create();
        $responsible = $this->responsibleFor($environment);
        $linkedActive = VerificationCriterion::factory()->create([
            'code' => 'VINC-ATIVO',
        ]);
        $linkedInactive = VerificationCriterion::factory()->create([
            'code' => 'VINC-INATIVO',
            'active' => false,
        ]);
        VerificationCriterion::factory()->create([
            'code' => 'NAO-VINCULADO',
        ]);
        $environment->verificationCriteria()->attach([
            $linkedActive->id,
            $linkedInactive->id,
        ]);

        $this->actingAs($operator, 'api')->postJson('/api/supervisions', [
            'work_environment_id' => $environment->id,
            'responsible_user_id' => $responsible->id,
        ])->assertCreated()
            ->assertJsonCount(1, 'data.answers')
            ->assertJsonPath('data.answers.0.verification_criterion_id', $linkedActive->id)
            ->assertJsonPath('data.answers.0.criterion_code', 'VINC-ATIVO');
    }

    public function test_environment_without_active_linked_criterion_cannot_start_supervision(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
        $environment = WorkEnvironment::factory()->create();
        $responsible = $this->responsibleFor($environment);
        VerificationCriterion::factory()->create();

        $this->actingAs($operator, 'api')->postJson('/api/supervisions', [
            'work_environment_id' => $environment->id,
            'responsible_user_id' => $responsible->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('criteria');
    }

    private function responsibleFor(WorkEnvironment $environment): User
    {
        $environment->load('local3.local2');
        $responsible = User::factory()->create([
            'local_1_id' => $environment->local3->local2->local_1_id,
            'local_2_id' => $environment->local3->local_2_id,
            'local_3_id' => $environment->local_3_id,
        ]);
        Operator::factory()->create([
            'user_id' => $responsible->id,
            'access_level' => AccessLevel::Respondent->value,
        ]);

        return $responsible;
    }
}
