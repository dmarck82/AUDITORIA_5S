<?php

namespace Database\Factories;

use App\Models\Local1;
use App\Models\Local2;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Local2>
 */
class Local2Factory extends Factory
{
    public function definition(): array
    {
        return [
            'local_1_id' => Local1::factory(),
            'name' => fake()->companySuffix(),
            'address' => fake()->address(),
            'active' => true,
        ];
    }
}
