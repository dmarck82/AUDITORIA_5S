<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Process;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'process_id' => Process::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'sort_order' => fake()->numberBetween(1, 20),
            'active' => true,
        ];
    }
}
