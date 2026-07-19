<?php

namespace Database\Factories;

use App\Models\Process;
use App\Models\Sector;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Process>
 */
class ProcessFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sector_id' => Sector::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'active' => true,
        ];
    }
}
