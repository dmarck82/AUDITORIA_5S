<?php

namespace Database\Factories;

use App\Models\Local2;
use App\Models\Local3;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Local3>
 */
class Local3Factory extends Factory
{
    public function definition(): array
    {
        return [
            'local_2_id' => Local2::factory(),
            'name' => fake()->jobTitle(),
            'description' => fake()->sentence(),
            'active' => true,
        ];
    }
}
