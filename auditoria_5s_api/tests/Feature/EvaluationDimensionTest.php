<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Models\EvaluationDimension;
use App\Models\Methodology;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluationDimensionTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_evaluation_dimension_for_methodology(): void
    {
        $methodology = Methodology::factory()->create(['code' => '5S']);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/evaluation-dimensions', [
                'methodology_id' => $methodology->id,
                'code' => 'org',
                'name' => 'Organização',
                'objective' => 'Avaliar condições de organização.',
                'sort_order' => 1,
                'active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.code', 'ORG')
            ->assertJsonPath('data.methodology_id', $methodology->id);

        $this->assertDatabaseHas('evaluation_dimensions', [
            'methodology_id' => $methodology->id,
            'code' => 'ORG',
            'name' => 'Organização',
            'sort_order' => 1,
        ]);
    }

    public function test_dimension_requires_existing_methodology_and_unique_code_per_methodology(): void
    {
        $methodology = Methodology::factory()->create();
        EvaluationDimension::factory()->create([
            'methodology_id' => $methodology->id,
            'code' => 'ORG',
            'sort_order' => 1,
        ]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/evaluation-dimensions', [
                'methodology_id' => $methodology->id,
                'code' => 'org',
                'name' => '',
                'sort_order' => 2,
            ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['code', 'name']);
    }

    public function test_administrator_can_update_evaluation_dimension(): void
    {
        $dimension = EvaluationDimension::factory()->create([
            'code' => 'RES',
            'name' => 'Resíduos',
            'sort_order' => 1,
            'active' => true,
        ]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->putJson("/api/evaluation-dimensions/{$dimension->id}", [
                'methodology_id' => $dimension->methodology_id,
                'code' => 'AGUA',
                'name' => 'Água',
                'objective' => null,
                'sort_order' => 2,
                'active' => false,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.code', 'AGUA')
            ->assertJsonPath('data.active', false);

        $this->assertDatabaseHas('evaluation_dimensions', [
            'id' => $dimension->id,
            'code' => 'AGUA',
            'sort_order' => 2,
            'active' => false,
        ]);
    }

    public function test_dimension_order_can_be_reordered_with_all_methodology_dimensions(): void
    {
        $methodology = Methodology::factory()->create();
        $first = EvaluationDimension::factory()->create(['methodology_id' => $methodology->id, 'sort_order' => 1]);
        $second = EvaluationDimension::factory()->create(['methodology_id' => $methodology->id, 'sort_order' => 2]);
        $third = EvaluationDimension::factory()->create(['methodology_id' => $methodology->id, 'sort_order' => 3]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/evaluation-dimensions/reorder', [
                'methodology_id' => $methodology->id,
                'dimensions' => [$third->id, $first->id, $second->id],
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('evaluation_dimensions', ['id' => $third->id, 'sort_order' => 1]);
        $this->assertDatabaseHas('evaluation_dimensions', ['id' => $first->id, 'sort_order' => 2]);
        $this->assertDatabaseHas('evaluation_dimensions', ['id' => $second->id, 'sort_order' => 3]);
    }

    public function test_reorder_rejects_partial_dimension_list(): void
    {
        $methodology = Methodology::factory()->create();
        $first = EvaluationDimension::factory()->create(['methodology_id' => $methodology->id, 'sort_order' => 1]);
        EvaluationDimension::factory()->create(['methodology_id' => $methodology->id, 'sort_order' => 2]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/evaluation-dimensions/reorder', [
                'methodology_id' => $methodology->id,
                'dimensions' => [$first->id],
            ]);

        $response->assertUnprocessable();
    }

    public function test_administrator_can_delete_evaluation_dimension(): void
    {
        $dimension = EvaluationDimension::factory()->create();

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->deleteJson("/api/evaluation-dimensions/{$dimension->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('evaluation_dimensions', ['id' => $dimension->id]);
    }

    private function adminUser(): User
    {
        return User::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
    }
}
