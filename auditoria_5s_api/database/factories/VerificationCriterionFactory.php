<?php

namespace Database\Factories;

use App\Enums\FiveSSense;
use App\Models\VerificationCriterion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VerificationCriterion>
 */
class VerificationCriterionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('CV-####'),
            'sense' => fake()->randomElement(FiveSSense::cases()),
            'question' => fake()->sentence().'?',
            'active' => true,
        ];
    }
}
