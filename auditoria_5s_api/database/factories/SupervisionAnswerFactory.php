<?php

namespace Database\Factories;

use App\Enums\FiveSSense;
use App\Models\Supervision;
use App\Models\SupervisionAnswer;
use App\Models\VerificationCriterion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupervisionAnswer>
 */
class SupervisionAnswerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'supervision_id' => Supervision::factory(),
            'verification_criterion_id' => VerificationCriterion::factory(),
            'criterion_code_snapshot' => fake()->unique()->bothify('CV-####'),
            'sense_snapshot' => fake()->randomElement(FiveSSense::cases()),
            'criterion_question_snapshot' => fake()->sentence().'?',
            'response_0_label_snapshot' => 'Não atende ao requisito',
            'response_5_label_snapshot' => 'Atende parcialmente, com falhas relevantes',
            'response_10_label_snapshot' => 'Atende, com pequenas oportunidades de melhoria',
            'response_15_label_snapshot' => 'Atende plenamente ao padrão estabelecido',
            'selected_value' => 15,
            'not_applicable' => false,
            'observation' => null,
            'evidence' => null,
        ];
    }
}
