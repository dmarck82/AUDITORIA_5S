<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Models\Local3;
use App\Models\Operator;
use App\Models\WorkEnvironment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkEnvironmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_manage_work_environments(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
        $local3 = Local3::factory()->create();

        $createResponse = $this->actingAs($operator, 'api')->postJson('/api/work-environments', [
            'local_3_id' => $local3->id,
            'name' => 'Almoxarifado Central',
            'description' => 'Área destinada ao armazenamento de materiais.',
            'active' => true,
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.name', 'Almoxarifado Central')
            ->assertJsonPath('data.local3.id', $local3->id)
            ->assertJsonPath('data.updated_by', $operator->id);

        $workEnvironmentId = $createResponse->json('data.id');

        $this->getJson('/api/work-environments')
            ->assertOk()
            ->assertJsonPath('data.0.id', $workEnvironmentId);

        $this->getJson("/api/work-environments/{$workEnvironmentId}")
            ->assertOk()
            ->assertJsonPath('data.description', 'Área destinada ao armazenamento de materiais.');

        $this->putJson("/api/work-environments/{$workEnvironmentId}", [
            'local_3_id' => $local3->id,
            'name' => 'Almoxarifado Principal',
            'description' => null,
            'active' => false,
        ])->assertOk()
            ->assertJsonPath('data.name', 'Almoxarifado Principal')
            ->assertJsonPath('data.active', false);

        $this->deleteJson("/api/work-environments/{$workEnvironmentId}")
            ->assertNoContent();

        $this->assertDatabaseMissing('work_environments', ['id' => $workEnvironmentId]);
    }

    public function test_work_environment_requires_a_valid_local3_and_unique_name_within_it(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
        $local3 = Local3::factory()->create();
        WorkEnvironment::factory()->create([
            'local_3_id' => $local3->id,
            'name' => 'Sala Técnica',
        ]);

        $this->actingAs($operator, 'api')->postJson('/api/work-environments', [
            'name' => 'Sem vínculo',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('local_3_id');

        $this->postJson('/api/work-environments', [
            'local_3_id' => $local3->id,
            'name' => 'Sala Técnica',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_viewer_can_view_but_cannot_change_work_environments(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Viewer->value,
        ]);
        $workEnvironment = WorkEnvironment::factory()->create();

        $this->actingAs($operator, 'api')
            ->getJson('/api/work-environments')
            ->assertOk();

        $this->postJson('/api/work-environments', [
            'local_3_id' => $workEnvironment->local_3_id,
            'name' => 'Ambiente sem permissão',
        ])->assertForbidden();

        $this->deleteJson("/api/work-environments/{$workEnvironment->id}")
            ->assertForbidden();
    }

    public function test_local3_with_work_environment_cannot_be_deleted(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
        $workEnvironment = WorkEnvironment::factory()->create();

        $this->actingAs($operator, 'api')
            ->deleteJson("/api/local3s/{$workEnvironment->local_3_id}")
            ->assertConflict()
            ->assertJsonPath(
                'message',
                'This local3 cannot be deleted because it has work environments linked to it.'
            );

        $this->assertDatabaseHas('local_3s', ['id' => $workEnvironment->local_3_id]);
    }
}
