<?php

namespace Database\Factories;

use App\Enums\AccessLevel;
use App\Models\Operator;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<Operator>
 */
class OperatorFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'password' => static::$password ??= Hash::make('password'),
            'access_level' => AccessLevel::Viewer->value,
            'active' => true,
            'remember_token' => Str::random(10),
        ];
    }
}
