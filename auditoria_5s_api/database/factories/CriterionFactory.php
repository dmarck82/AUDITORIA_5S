<?php

namespace Database\Factories;

use App\Models\Criterion;
use App\Models\EvaluationDimension;
use App\Models\EvaluationModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Criterion>
 */
class CriterionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'evaluation_dimension_id' => EvaluationDimension::factory(),
            'evaluation_model_id' => EvaluationModel::factory(),
            'code' => strtoupper($this->faker->unique()->bothify('CRI-###')),
            'text' => $this->faker->sentence(12),
            'description' => $this->faker->sentence(),
            'active' => true,
        ];
    }
}
