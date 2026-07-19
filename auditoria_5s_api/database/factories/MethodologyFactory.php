<?php

namespace Database\Factories;

use App\Models\Methodology;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Methodology>
 */
class MethodologyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('MET-###')),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'active' => true,
        ];
    }
}
