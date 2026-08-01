<?php

namespace Database\Factories;

use App\Models\Local1;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
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
            'local_1_id' => Local1::factory(),
            'local_2_id' => null,
            'local_3_id' => null,
            'job_title' => fake()->jobTitle(),
            'active' => true,
        ];
    }
}
