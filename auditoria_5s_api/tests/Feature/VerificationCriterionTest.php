<?php

namespace Tests\Feature;

use App\Enums\AccessLevel;
use App\Enums\FiveSSense;
use App\Models\Operator;
use App\Models\VerificationCriterion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class VerificationCriterionTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_manage_verification_criteria(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);

        $createResponse = $this->actingAs($operator, 'api')->postJson('/api/verification-criteria', [
            'sense' => FiveSSense::Utilization->value,
            'question' => 'Existem somente materiais necessários no ambiente?',
            'active' => true,
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.code', 'UTIL-001')
            ->assertJsonPath('data.sense', FiveSSense::Utilization->value)
            ->assertJsonPath('data.sense_label', 'Utilização')
            ->assertJsonPath('data.updated_by', $operator->id)
            ->assertJsonMissingPath('data.description')
            ->assertJsonMissingPath('data.evaluation_model_id');

        $criterionId = $createResponse->json('data.id');

        $this->getJson('/api/verification-criteria')
            ->assertOk()
            ->assertJsonPath('data.0.id', $criterionId);

        $this->getJson("/api/verification-criteria/{$criterionId}")
            ->assertOk()
            ->assertJsonPath('data.question', 'Existem somente materiais necessários no ambiente?');

        $this->putJson("/api/verification-criteria/{$criterionId}", [
            'question' => 'Os materiais necessários estão identificados?',
            'active' => false,
        ])->assertOk()
            ->assertJsonPath('data.code', 'UTIL-001')
            ->assertJsonPath('data.sense_label', 'Utilização')
            ->assertJsonPath('data.active', false);

        $this->deleteJson("/api/verification-criteria/{$criterionId}")
            ->assertNoContent();

        $this->assertDatabaseMissing('verification_criteria', ['id' => $criterionId]);
    }

    public function test_criterion_requires_valid_sense_and_rejects_manual_code(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);

        $this->actingAs($operator, 'api')->postJson('/api/verification-criteria', [
            'sense' => 'invalid-sense',
            'question' => 'Pergunta inválida?',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('sense');

        $this->postJson('/api/verification-criteria', [
            'code' => 'LIMP-999',
            'sense' => FiveSSense::Cleaning->value,
            'question' => 'O ambiente está limpo?',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('code');

        $this->postJson('/api/verification-criteria', [
            'sense' => FiveSSense::Discipline->value,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('question');
    }

    public function test_codes_are_sequential_per_sense_and_are_not_reused(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
        VerificationCriterion::factory()->create([
            'code' => 'UTIL-004',
            'sense' => FiveSSense::Utilization,
        ]);

        $first = $this->actingAs($operator, 'api')->postJson('/api/verification-criteria', [
            'sense' => FiveSSense::Utilization->value,
            'question' => 'Primeiro critério gerado?',
        ])->assertCreated()
            ->assertJsonPath('data.code', 'UTIL-005');

        $this->deleteJson('/api/verification-criteria/'.$first->json('data.id'))
            ->assertNoContent();

        $this->postJson('/api/verification-criteria', [
            'sense' => FiveSSense::Utilization->value,
            'question' => 'Segundo critério gerado?',
        ])->assertCreated()
            ->assertJsonPath('data.code', 'UTIL-006');

        $this->postJson('/api/verification-criteria', [
            'sense' => FiveSSense::Cleaning->value,
            'question' => 'Primeiro critério de limpeza?',
        ])->assertCreated()
            ->assertJsonPath('data.code', 'LIMP-001');
    }

    public function test_code_sequence_continues_above_three_digits(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
        DB::table('verification_criterion_code_sequences')
            ->where('sense', FiveSSense::Ordering->value)
            ->update(['last_number' => 999]);

        $this->actingAs($operator, 'api')->postJson('/api/verification-criteria', [
            'sense' => FiveSSense::Ordering->value,
            'question' => 'A sequência continua?',
        ])->assertCreated()
            ->assertJsonPath('data.code', 'ORD-1000');
    }

    public function test_code_and_sense_cannot_be_changed(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Administrator->value,
        ]);
        $criterion = VerificationCriterion::factory()->create([
            'code' => 'ORD-009',
            'sense' => FiveSSense::Ordering,
        ]);

        $this->actingAs($operator, 'api')->putJson("/api/verification-criteria/{$criterion->id}", [
            'code' => 'LIMP-009',
            'sense' => FiveSSense::Cleaning->value,
            'question' => 'Tentativa de alteração?',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['code', 'sense']);

        $this->assertDatabaseHas('verification_criteria', [
            'id' => $criterion->id,
            'code' => 'ORD-009',
            'sense' => FiveSSense::Ordering->value,
        ]);
    }

    public function test_all_five_senses_have_the_expected_labels_and_prefixes(): void
    {
        $expected = [
            'utilization' => ['Utilização', 'UTIL'],
            'ordering' => ['Ordenação', 'ORD'],
            'cleaning' => ['Limpeza', 'LIMP'],
            'standardization' => ['Padronização', 'PAD'],
            'discipline' => ['Disciplina', 'DISC'],
        ];

        $actual = [];
        foreach (FiveSSense::cases() as $sense) {
            $actual[$sense->value] = [$sense->label(), $sense->codePrefix()];
        }

        $this->assertSame($expected, $actual);
    }

    public function test_viewer_can_view_but_cannot_change_verification_criteria(): void
    {
        $operator = Operator::factory()->create([
            'access_level' => AccessLevel::Viewer->value,
        ]);
        $criterion = VerificationCriterion::factory()->create();

        $this->actingAs($operator, 'api')
            ->getJson('/api/verification-criteria')
            ->assertOk();

        $this->postJson('/api/verification-criteria', [
            'sense' => FiveSSense::Standardization->value,
            'question' => 'Esta pergunta não deve ser criada?',
        ])->assertForbidden();

        $this->deleteJson("/api/verification-criteria/{$criterion->id}")
            ->assertForbidden();
    }
}
