<?php

namespace Database\Factories;

use App\Models\EvaluationModel;
use App\Models\EvaluationModelOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EvaluationModelOption>
 */
class EvaluationModelOptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'evaluation_model_id' => EvaluationModel::factory(),
            'value' => (string) $this->faker->numberBetween(0, 100),
            'description' => $this->faker->sentence(),
            'sort_order' => $this->faker->numberBetween(1, 10),
            'active' => true,
        ];
    }
}
