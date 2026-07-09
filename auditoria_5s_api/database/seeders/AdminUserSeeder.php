<?php

namespace Database\Seeders;

use App\Enums\AccessLevel;
use App\Models\Organization;
use App\Models\Person;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::firstOrCreate(
            ['name' => 'System Organization'],
            ['active' => true]
        );

        $examples = [
            ['name' => 'Administrator', 'email' => 'admin@admin.com.br', 'phone' => null, 'level' => AccessLevel::Administrator->value],
            ['name' => 'Manager', 'email' => 'manager@admin.com.br', 'phone' => '41970004002', 'level' => AccessLevel::Manager->value],
            ['name' => 'Operator', 'email' => 'operator@admin.com.br', 'phone' => '41970004003', 'level' => AccessLevel::Operator->value],
            ['name' => 'Respondent', 'email' => 'respondent@admin.com.br', 'phone' => '41970004004', 'level' => AccessLevel::Respondent->value],
            ['name' => 'Viewer', 'email' => 'viewer@admin.com.br', 'phone' => '41970004005', 'level' => AccessLevel::Viewer->value],
        ];

        foreach ($examples as $example) {
            $person = Person::updateOrCreate(
                ['email' => $example['email']],
                [
                    'name' => $example['name'],
                    'phone' => $example['phone'],
                    'organization_id' => $organization->id,
                    'unit_id' => null,
                    'sector_id' => null,
                    'active' => true,
                ]
            );

            User::updateOrCreate(
                ['person_id' => $person->id],
                [
                    'password' => Hash::make('resende123'),
                    'access_level' => $example['level'],
                    'active' => true,
                ]
            );
        }
    }
}
