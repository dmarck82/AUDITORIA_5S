<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Models\Activity;
use App\Models\Process as WorkProcess;
use App\Models\Sector;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProcessActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_process_for_sector(): void
    {
        $user = $this->adminUser();
        $sector = Sector::factory()->create();

        $response = $this
            ->actingAs($user, 'api')
            ->postJson('/api/processes', [
                'sector_id' => $sector->id,
                'name' => 'Gestão do Almoxarifado',
                'description' => 'Processo operacional do setor.',
                'active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Gestão do Almoxarifado')
            ->assertJsonPath('data.sector_id', $sector->id);

        $this->assertDatabaseHas('processes', [
            'sector_id' => $sector->id,
            'name' => 'Gestão do Almoxarifado',
        ]);
    }

    public function test_process_requires_existing_sector_and_name(): void
    {
        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/processes', [
                'sector_id' => 999999,
                'name' => '',
            ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['sector_id', 'name']);
    }

    public function test_process_with_activities_cannot_be_deleted(): void
    {
        $process = WorkProcess::factory()->create();
        Activity::factory()->create(['process_id' => $process->id, 'sort_order' => 1]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->deleteJson("/api/processes/{$process->id}");

        $response->assertStatus(409);
        $this->assertDatabaseHas('processes', ['id' => $process->id]);
    }

    public function test_sector_with_processes_cannot_be_deleted(): void
    {
        $sector = Sector::factory()->create();
        WorkProcess::factory()->create(['sector_id' => $sector->id]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->deleteJson("/api/sectors/{$sector->id}");

        $response->assertStatus(409);
        $this->assertDatabaseHas('sectors', ['id' => $sector->id]);
    }

    public function test_administrator_can_create_activity_for_process(): void
    {
        $process = WorkProcess::factory()->create();

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/activities', [
                'process_id' => $process->id,
                'name' => 'Armazenamento',
                'description' => 'Guardar materiais conforme padrão.',
                'sort_order' => 1,
                'active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Armazenamento')
            ->assertJsonPath('data.process_id', $process->id);

        $this->assertDatabaseHas('activities', [
            'process_id' => $process->id,
            'name' => 'Armazenamento',
            'sort_order' => 1,
        ]);
    }

    public function test_activity_order_can_be_reordered_with_all_process_activities(): void
    {
        $process = WorkProcess::factory()->create();
        $first = Activity::factory()->create(['process_id' => $process->id, 'sort_order' => 1]);
        $second = Activity::factory()->create(['process_id' => $process->id, 'sort_order' => 2]);
        $third = Activity::factory()->create(['process_id' => $process->id, 'sort_order' => 3]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/activities/reorder', [
                'process_id' => $process->id,
                'activities' => [$third->id, $first->id, $second->id],
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('activities', ['id' => $third->id, 'sort_order' => 1]);
        $this->assertDatabaseHas('activities', ['id' => $first->id, 'sort_order' => 2]);
        $this->assertDatabaseHas('activities', ['id' => $second->id, 'sort_order' => 3]);
    }

    public function test_reorder_rejects_partial_activity_list(): void
    {
        $process = WorkProcess::factory()->create();
        $first = Activity::factory()->create(['process_id' => $process->id, 'sort_order' => 1]);
        Activity::factory()->create(['process_id' => $process->id, 'sort_order' => 2]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/activities/reorder', [
                'process_id' => $process->id,
                'activities' => [$first->id],
            ]);

        $response->assertUnprocessable();
    }

    private function adminUser(): User
    {
        return User::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
    }
}
