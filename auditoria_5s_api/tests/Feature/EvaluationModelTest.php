<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Models\EvaluationModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluationModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_evaluation_model(): void
    {
        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/evaluation-models', [
                'code' => 'm01',
                'name' => 'Graduação específica',
                'description' => 'Modelo de resposta por graduação.',
                'active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.code', 'M01')
            ->assertJsonPath('data.name', 'Graduação específica');

        $this->assertDatabaseHas('evaluation_models', [
            'code' => 'M01',
            'name' => 'Graduação específica',
        ]);
    }

    public function test_evaluation_model_requires_unique_code_and_name_field(): void
    {
        EvaluationModel::factory()->create(['code' => 'M01']);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/evaluation-models', [
                'code' => 'm01',
                'name' => '',
            ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['code', 'name']);
    }

    public function test_administrator_can_update_evaluation_model(): void
    {
        $model = EvaluationModel::factory()->create([
            'code' => 'M02',
            'name' => 'Aspectos e condição de atendimento',
            'active' => true,
        ]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->putJson("/api/evaluation-models/{$model->id}", [
                'code' => 'M02A',
                'name' => 'Aspectos com condição de atendimento',
                'description' => null,
                'active' => false,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.code', 'M02A')
            ->assertJsonPath('data.active', false);

        $this->assertDatabaseHas('evaluation_models', [
            'id' => $model->id,
            'code' => 'M02A',
            'active' => false,
        ]);
    }

    public function test_administrator_can_delete_evaluation_model(): void
    {
        $model = EvaluationModel::factory()->create();

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->deleteJson("/api/evaluation-models/{$model->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('evaluation_models', ['id' => $model->id]);
    }

    private function adminUser(): User
    {
        return User::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
    }
}
