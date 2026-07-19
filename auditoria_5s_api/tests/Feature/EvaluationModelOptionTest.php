<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Models\EvaluationModel;
use App\Models\EvaluationModelOption;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluationModelOptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_evaluation_model_option(): void
    {
        $model = EvaluationModel::factory()->create(['code' => 'M02']);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/evaluation-model-options', [
                'evaluation_model_id' => $model->id,
                'value' => '10',
                'description' => 'Atende parcialmente ao padrão',
                'sort_order' => 3,
                'active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.value', '10')
            ->assertJsonPath('data.evaluation_model_id', $model->id);

        $this->assertDatabaseHas('evaluation_model_options', [
            'evaluation_model_id' => $model->id,
            'value' => '10',
            'sort_order' => 3,
        ]);
    }

    public function test_option_requires_existing_model_and_unique_value_per_model(): void
    {
        $model = EvaluationModel::factory()->create();
        EvaluationModelOption::factory()->create([
            'evaluation_model_id' => $model->id,
            'value' => '10',
            'sort_order' => 1,
        ]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/evaluation-model-options', [
                'evaluation_model_id' => $model->id,
                'value' => '10',
                'description' => '',
                'sort_order' => 2,
            ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['value']);
    }

    public function test_administrator_can_update_evaluation_model_option(): void
    {
        $option = EvaluationModelOption::factory()->create([
            'value' => '5',
            'description' => 'Apresenta falhas significativas',
            'sort_order' => 2,
            'active' => true,
        ]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->putJson("/api/evaluation-model-options/{$option->id}", [
                'evaluation_model_id' => $option->evaluation_model_id,
                'value' => '6',
                'description' => 'Descrição ajustada',
                'sort_order' => 3,
                'active' => false,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.value', '6')
            ->assertJsonPath('data.active', false);

        $this->assertDatabaseHas('evaluation_model_options', [
            'id' => $option->id,
            'value' => '6',
            'sort_order' => 3,
            'active' => false,
        ]);
    }

    public function test_option_order_can_be_reordered_with_all_model_options(): void
    {
        $model = EvaluationModel::factory()->create();
        $first = EvaluationModelOption::factory()->create(['evaluation_model_id' => $model->id, 'value' => '0', 'sort_order' => 1]);
        $second = EvaluationModelOption::factory()->create(['evaluation_model_id' => $model->id, 'value' => '5', 'sort_order' => 2]);
        $third = EvaluationModelOption::factory()->create(['evaluation_model_id' => $model->id, 'value' => '10', 'sort_order' => 3]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/evaluation-model-options/reorder', [
                'evaluation_model_id' => $model->id,
                'options' => [$third->id, $first->id, $second->id],
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('evaluation_model_options', ['id' => $third->id, 'sort_order' => 1]);
        $this->assertDatabaseHas('evaluation_model_options', ['id' => $first->id, 'sort_order' => 2]);
        $this->assertDatabaseHas('evaluation_model_options', ['id' => $second->id, 'sort_order' => 3]);
    }

    public function test_reorder_rejects_partial_option_list(): void
    {
        $model = EvaluationModel::factory()->create();
        $first = EvaluationModelOption::factory()->create(['evaluation_model_id' => $model->id, 'value' => '0', 'sort_order' => 1]);
        EvaluationModelOption::factory()->create(['evaluation_model_id' => $model->id, 'value' => '5', 'sort_order' => 2]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/evaluation-model-options/reorder', [
                'evaluation_model_id' => $model->id,
                'options' => [$first->id],
            ]);

        $response->assertUnprocessable();
    }

    public function test_administrator_can_delete_evaluation_model_option(): void
    {
        $option = EvaluationModelOption::factory()->create();

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->deleteJson("/api/evaluation-model-options/{$option->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('evaluation_model_options', ['id' => $option->id]);
    }

    private function adminUser(): User
    {
        return User::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
    }
}
