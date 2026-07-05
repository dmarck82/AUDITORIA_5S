<?php

namespace Database\Factories;

use App\Models\Sector;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sector>
 */
class SectorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'unit_id' => Unit::factory(),
            'name' => fake()->jobTitle(),
            'description' => fake()->sentence(),
            'active' => true,
        ];
    }
}
