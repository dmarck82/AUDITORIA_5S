<?php

namespace Database\Factories;

use App\Models\Local3;
use App\Models\WorkEnvironment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkEnvironment>
 */
class WorkEnvironmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'local_3_id' => Local3::factory(),
            'name' => fake()->unique()->words(3, true),
            'description' => fake()->sentence(),
            'active' => true,
        ];
    }
}
