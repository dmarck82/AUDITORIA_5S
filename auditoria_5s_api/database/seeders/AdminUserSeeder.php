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

        $adminPerson = Person::updateOrCreate(
            ['email' => 'admin@admin.com.br'],
            [
                'name'      => 'Administrator',
                'phone'     => null,
                'organization_id' => $organization->id,
                'unit_id' => null,
                'sector_id' => null,
                'active'    => true,
            ]
        );

        User::updateOrCreate(
            ['person_id' => $adminPerson->id],
            [
                'password' => Hash::make('resende123'),
                'access_level' => AccessLevel::Administrator->value,
                'active'   => true,
            ]
        );

        $examples = [
            ['name' => 'Example Administrator', 'email' => 'administrator@example.com', 'phone' => '41970003001', 'level' => AccessLevel::Administrator->value],
            ['name' => 'Example Manager', 'email' => 'manager@example.com', 'phone' => '41970003002', 'level' => AccessLevel::Manager->value],
            ['name' => 'Example Operator', 'email' => 'operator@example.com', 'phone' => '41970003003', 'level' => AccessLevel::Operator->value],
            ['name' => 'Example Respondent', 'email' => 'respondent@example.com', 'phone' => '41970003004', 'level' => AccessLevel::Respondent->value],
            ['name' => 'Example Viewer', 'email' => 'viewer@example.com', 'phone' => '41970003005', 'level' => AccessLevel::Viewer->value],
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
                    'password' => Hash::make('password'),
                    'access_level' => $example['level'],
                    'active' => true,
                ]
            );
        }
    }
}
