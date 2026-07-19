<?php

namespace Database\Factories;

use App\Models\EvaluationModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EvaluationModel>
 */
class EvaluationModelFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->bothify('MOD-###')),
            'name' => ucfirst($this->faker->words(3, true)),
            'description' => $this->faker->sentence(),
            'active' => true,
        ];
    }
}
