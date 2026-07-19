<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Models\Methodology;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MethodologyTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_methodology(): void
    {
        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/methodologies', [
                'code' => '5s',
                'name' => '5S',
                'description' => 'Metodologia 5S.',
                'active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.code', '5S')
            ->assertJsonPath('data.name', '5S');

        $this->assertDatabaseHas('methodologies', [
            'code' => '5S',
            'name' => '5S',
        ]);
    }

    public function test_methodology_requires_unique_code_and_name_field(): void
    {
        Methodology::factory()->create(['code' => '5S']);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->postJson('/api/methodologies', [
                'code' => '5s',
                'name' => '',
            ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['code', 'name']);
    }

    public function test_administrator_can_update_methodology(): void
    {
        $methodology = Methodology::factory()->create([
            'code' => 'GA',
            'name' => 'Gestão Ambiental',
            'active' => true,
        ]);

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->putJson("/api/methodologies/{$methodology->id}", [
                'code' => 'GAMB',
                'name' => 'Gestão Ambiental Corporativa',
                'description' => null,
                'active' => false,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.code', 'GAMB')
            ->assertJsonPath('data.active', false);

        $this->assertDatabaseHas('methodologies', [
            'id' => $methodology->id,
            'code' => 'GAMB',
            'active' => false,
        ]);
    }

    public function test_administrator_can_delete_methodology(): void
    {
        $methodology = Methodology::factory()->create();

        $response = $this
            ->actingAs($this->adminUser(), 'api')
            ->deleteJson("/api/methodologies/{$methodology->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('methodologies', ['id' => $methodology->id]);
    }

    private function adminUser(): User
    {
        return User::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
    }
}
