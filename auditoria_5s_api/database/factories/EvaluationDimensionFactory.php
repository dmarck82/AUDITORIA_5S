<?php

namespace Database\Factories;

use App\Models\EvaluationDimension;
use App\Models\Methodology;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EvaluationDimension>
 */
class EvaluationDimensionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'methodology_id' => Methodology::factory(),
            'code' => strtoupper($this->faker->bothify('DIM-###')),
            'name' => ucfirst($this->faker->words(2, true)),
            'objective' => $this->faker->sentence(),
            'sort_order' => $this->faker->numberBetween(1, 10),
            'active' => true,
        ];
    }
}
