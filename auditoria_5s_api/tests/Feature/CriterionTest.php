<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Models\Criterion;
use App\Models\EvaluationDimension;
use App\Models\EvaluationModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CriterionTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_criterion_with_dimension_and_model(): void
    {
        $dimension = EvaluationDimension::factory()->create(['code' => 'ORG']);
        $model = EvaluationModel::factory()->create(['code' => 'M02']);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/criteria', [
                'evaluation_dimension_id' => $dimension->id,
                'evaluation_model_id' => $model->id,
                'code' => 'org-001',
                'text' => 'Os recursos necessários estão organizados conforme o padrão estabelecido.',
                'description' => 'Critério universal de organização.',
                'active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.code', 'ORG-001')
            ->assertJsonPath('data.evaluation_dimension_id', $dimension->id)
            ->assertJsonPath('data.evaluation_model_id', $model->id);

        $this->assertDatabaseHas('criteria', [
            'evaluation_dimension_id' => $dimension->id,
            'evaluation_model_id' => $model->id,
            'code' => 'ORG-001',
            'active' => true,
        ]);
    }

    public function test_criterion_code_is_generated_when_missing(): void
    {
        $dimension = EvaluationDimension::factory()->create();
        $model = EvaluationModel::factory()->create();

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/criteria', [
                'evaluation_dimension_id' => $dimension->id,
                'evaluation_model_id' => $model->id,
                'text' => 'Critério criado sem informar código.',
                'description' => null,
                'active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.code', 'CRI-001');

        $this->assertDatabaseHas('criteria', [
            'evaluation_dimension_id' => $dimension->id,
            'evaluation_model_id' => $model->id,
            'code' => 'CRI-001',
        ]);
    }

    public function test_criterion_requires_existing_dimension_model_and_unique_code(): void
    {
        $criterion = Criterion::factory()->create(['code' => 'ORG-001']);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/criteria', [
                'evaluation_dimension_id' => $criterion->evaluation_dimension_id,
                'evaluation_model_id' => 999999,
                'code' => 'org-001',
                'text' => '',
            ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['evaluation_model_id', 'code', 'text']);
    }

    public function test_administrator_can_update_criterion(): void
    {
        $criterion = Criterion::factory()->create([
            'code' => 'ORG-001',
            'active' => true,
        ]);
        $dimension = EvaluationDimension::factory()->create(['code' => 'RES']);
        $model = EvaluationModel::factory()->create(['code' => 'M01']);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->putJson("/api/criteria/{$criterion->id}", [
                'evaluation_dimension_id' => $dimension->id,
                'evaluation_model_id' => $model->id,
                'code' => 'res-002',
                'text' => 'Os resíduos são acondicionados conforme orientação vigente.',
                'description' => null,
                'active' => false,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.code', 'RES-002')
            ->assertJsonPath('data.active', false);

        $this->assertDatabaseHas('criteria', [
            'id' => $criterion->id,
            'evaluation_dimension_id' => $dimension->id,
            'evaluation_model_id' => $model->id,
            'code' => 'RES-002',
            'active' => false,
        ]);
    }

    public function test_criteria_can_be_filtered_by_methodology_dimension_model_and_status(): void
    {
        $dimension = EvaluationDimension::factory()->create();
        $model = EvaluationModel::factory()->create();
        $matching = Criterion::factory()->create([
            'evaluation_dimension_id' => $dimension->id,
            'evaluation_model_id' => $model->id,
            'code' => 'ORG-001',
            'active' => true,
        ]);
        Criterion::factory()->create(['code' => 'RES-001', 'active' => false]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->getJson("/api/criteria?methodology_id={$dimension->methodology_id}&evaluation_dimension_id={$dimension->id}&evaluation_model_id={$model->id}&active=1");

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matching->id);
    }

    public function test_administrator_can_delete_criterion(): void
    {
        $criterion = Criterion::factory()->create();

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->deleteJson("/api/criteria/{$criterion->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('criteria', ['id' => $criterion->id]);
    }

    private function adminUser(): User
    {
        return User::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
    }
}
