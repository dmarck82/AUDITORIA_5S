<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'name' => fake()->companySuffix(),
            'address' => fake()->address(),
            'active' => true,
        ];
    }
}
