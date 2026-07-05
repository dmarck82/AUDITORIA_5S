<?php

namespace Database\Seeders;

use App\Enums\AccessLevel;
use App\Models\Organization;
use App\Models\Person;
use App\Models\Sector;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RelationshipSeeder extends Seeder
{
    public function run(): void
    {
        $organizations = $this->seedOrganizations();
        $units = $this->seedUnits($organizations);
        $sectors = $this->seedSectors($units);
        $people = $this->seedPeople($organizations, $units, $sectors);

        $this->seedUsers($people);
    }

    /**
     * @return array<string, Organization>
     */
    private function seedOrganizations(): array
    {
        return [
            'alpha' => Organization::updateOrCreate(
                ['name' => 'Empresa Alpha'],
                ['active' => true]
            ),
            'beta' => Organization::updateOrCreate(
                ['name' => 'Empresa Beta'],
                ['active' => true]
            ),
        ];
    }

    /**
     * @param array<string, Organization> $organizations
     * @return array<string, Unit>
     */
    private function seedUnits(array $organizations): array
    {
        $data = [
            'alpha_headquarters' => ['organization' => 'alpha', 'name' => 'Matriz', 'address' => 'Curitiba - PR'],
            'alpha_curitiba' => ['organization' => 'alpha', 'name' => 'Filial Curitiba', 'address' => 'Curitiba - PR'],
            'alpha_cascavel' => ['organization' => 'alpha', 'name' => 'Filial Cascavel', 'address' => 'Cascavel - PR'],
            'beta_headquarters' => ['organization' => 'beta', 'name' => 'Matriz Beta', 'address' => 'São Paulo - SP'],
            'beta_operations' => ['organization' => 'beta', 'name' => 'Operações Beta', 'address' => 'Campinas - SP'],
        ];

        $units = [];

        foreach ($data as $key => $attributes) {
            $units[$key] = Unit::updateOrCreate(
                [
                    'organization_id' => $organizations[$attributes['organization']]->id,
                    'name' => $attributes['name'],
                ],
                [
                    'address' => $attributes['address'],
                    'active' => true,
                ]
            );
        }

        return $units;
    }

    /**
     * @param array<string, Unit> $units
     * @return array<string, Sector>
     */
    private function seedSectors(array $units): array
    {
        $data = [
            'alpha_production' => ['unit' => 'alpha_headquarters', 'name' => 'Produção'],
            'alpha_shipping' => ['unit' => 'alpha_headquarters', 'name' => 'Expedição'],
            'alpha_quality' => ['unit' => 'alpha_curitiba', 'name' => 'Qualidade'],
            'alpha_hr' => ['unit' => 'alpha_cascavel', 'name' => 'RH'],
            'alpha_finance' => ['unit' => 'alpha_cascavel', 'name' => 'Financeiro'],
            'beta_production' => ['unit' => 'beta_headquarters', 'name' => 'Produção'],
            'beta_quality' => ['unit' => 'beta_headquarters', 'name' => 'Qualidade'],
            'beta_shipping' => ['unit' => 'beta_operations', 'name' => 'Expedição'],
            'beta_hr' => ['unit' => 'beta_operations', 'name' => 'RH'],
            'beta_finance' => ['unit' => 'beta_operations', 'name' => 'Financeiro'],
        ];

        $sectors = [];

        foreach ($data as $key => $attributes) {
            $sectors[$key] = Sector::updateOrCreate(
                [
                    'unit_id' => $units[$attributes['unit']]->id,
                    'name' => $attributes['name'],
                ],
                [
                    'description' => "Setor de {$attributes['name']}.",
                    'active' => true,
                ]
            );
        }

        return $sectors;
    }

    /**
     * @param array<string, Organization> $organizations
     * @param array<string, Unit> $units
     * @param array<string, Sector> $sectors
     * @return array<string, Person>
     */
    private function seedPeople(array $organizations, array $units, array $sectors): array
    {
        $data = [
            'alpha_admin' => ['name' => 'Alice Alpha', 'email' => 'alice.alpha@example.com', 'phone' => '41970001001', 'job_title' => 'Administradora', 'organization' => 'alpha', 'unit' => 'alpha_headquarters', 'sector' => 'alpha_production', 'active' => true],
            'alpha_manager' => ['name' => 'Marcos Alpha', 'email' => 'marcos.alpha@example.com', 'phone' => '41970001002', 'job_title' => 'Gerente', 'organization' => 'alpha', 'unit' => 'alpha_curitiba', 'sector' => 'alpha_quality', 'active' => true],
            'alpha_operator' => ['name' => 'Olivia Alpha', 'email' => 'olivia.alpha@example.com', 'phone' => '41970001003', 'job_title' => 'Operadora', 'organization' => 'alpha', 'unit' => 'alpha_cascavel', 'sector' => 'alpha_finance', 'active' => true],
            'alpha_no_unit' => ['name' => 'Paulo Alpha', 'email' => 'paulo.alpha@example.com', 'phone' => '41970001004', 'job_title' => 'Consultor', 'organization' => 'alpha', 'unit' => null, 'sector' => null, 'active' => true],
            'beta_admin' => ['name' => 'Bianca Beta', 'email' => 'bianca.beta@example.com', 'phone' => '11970002001', 'job_title' => 'Administradora', 'organization' => 'beta', 'unit' => 'beta_headquarters', 'sector' => 'beta_quality', 'active' => true],
            'beta_respondent' => ['name' => 'Renato Beta', 'email' => 'renato.beta@example.com', 'phone' => '11970002002', 'job_title' => 'Respondente', 'organization' => 'beta', 'unit' => 'beta_operations', 'sector' => 'beta_shipping', 'active' => true],
            'beta_viewer' => ['name' => 'Vanessa Beta', 'email' => 'vanessa.beta@example.com', 'phone' => '11970002003', 'job_title' => 'Visualizadora', 'organization' => 'beta', 'unit' => 'beta_operations', 'sector' => 'beta_hr', 'active' => true],
            'beta_inactive' => ['name' => 'Inativo Beta', 'email' => 'inativo.beta@example.com', 'phone' => '11970002004', 'job_title' => 'Registro inativo', 'organization' => 'beta', 'unit' => 'beta_operations', 'sector' => 'beta_finance', 'active' => false],
        ];

        $people = [];

        foreach ($data as $key => $attributes) {
            $people[$key] = Person::updateOrCreate(
                ['email' => $attributes['email']],
                [
                    'name' => $attributes['name'],
                    'phone' => $attributes['phone'],
                    'organization_id' => $organizations[$attributes['organization']]->id,
                    'unit_id' => $attributes['unit'] ? $units[$attributes['unit']]->id : null,
                    'sector_id' => $attributes['sector'] ? $sectors[$attributes['sector']]->id : null,
                    'job_title' => $attributes['job_title'],
                    'active' => $attributes['active'],
                ]
            );
        }

        return $people;
    }

    /**
     * @param array<string, Person> $people
     */
    private function seedUsers(array $people): void
    {
        $users = [
            'alpha_admin' => AccessLevel::Administrator->value,
            'alpha_manager' => AccessLevel::Manager->value,
            'alpha_operator' => AccessLevel::Operator->value,
            'beta_admin' => AccessLevel::Administrator->value,
            'beta_respondent' => AccessLevel::Respondent->value,
            'beta_viewer' => AccessLevel::Viewer->value,
        ];

        foreach ($users as $key => $accessLevel) {
            User::updateOrCreate(
                ['person_id' => $people[$key]->id],
                [
                    'password' => Hash::make('password'),
                    'access_level' => $accessLevel,
                    'active' => true,
                ]
            );
        }
    }
}
