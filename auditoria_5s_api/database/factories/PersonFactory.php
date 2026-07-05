<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Person;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Person>
 */
class PersonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->unique()->phoneNumber(),
            'organization_id' => Organization::factory(),
            'unit_id' => null,
            'sector_id' => null,
            'job_title' => fake()->jobTitle(),
            'active' => true,
        ];
    }
}
