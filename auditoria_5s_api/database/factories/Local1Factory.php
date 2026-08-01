<?php

namespace Database\Factories;

use App\Models\Local1;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Local1>
 */
class Local1Factory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'active' => true,
        ];
    }
}
