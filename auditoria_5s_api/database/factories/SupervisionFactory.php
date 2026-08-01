<?php

namespace Database\Factories;

use App\Enums\SupervisionStatus;
use App\Models\Operator;
use App\Models\Supervision;
use App\Models\User;
use App\Models\WorkEnvironment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Supervision>
 */
class SupervisionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'work_environment_id' => WorkEnvironment::factory(),
            'responsible_user_id' => User::factory(),
            'operator_id' => Operator::factory(),
            'status' => SupervisionStatus::Draft,
            'started_at' => now(),
            'finalized_at' => null,
            'work_environment_name_snapshot' => fake()->words(3, true),
            'local_1_name_snapshot' => fake()->company(),
            'local_2_name_snapshot' => fake()->word(),
            'local_3_name_snapshot' => fake()->word(),
            'responsible_user_name_snapshot' => fake()->name(),
            'operator_name_snapshot' => fake()->name(),
        ];
    }
}
