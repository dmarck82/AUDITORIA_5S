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

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->firstOrNew();
        $organization->fill([
            'name' => 'Organização Modelo SSEP',
            'active' => true,
        ]);
        $organization->save();

        $units = [
            'sede' => Unit::query()->updateOrCreate(
                ['organization_id' => $organization->id, 'name' => 'Sede Administrativa'],
                ['address' => 'Resende - RJ', 'active' => true]
            ),
            'operacional' => Unit::query()->updateOrCreate(
                ['organization_id' => $organization->id, 'name' => 'Unidade Operacional'],
                ['address' => 'Resende - RJ', 'active' => true]
            ),
        ];

        $sectors = [
            'almoxarifado' => Sector::query()->updateOrCreate(
                ['unit_id' => $units['operacional']->id, 'name' => 'Almoxarifado'],
                ['description' => 'Setor usado como base para os exemplos de processos, atividades e critérios.', 'active' => true]
            ),
            'manutencao' => Sector::query()->updateOrCreate(
                ['unit_id' => $units['operacional']->id, 'name' => 'Manutenção'],
                ['description' => 'Setor complementar para testes de navegação e filtros.', 'active' => true]
            ),
        ];

        $people = [
            'admin' => $this->person('Administrador do Sistema', 'admin@admin.com.br', '21970000001', 'Administrador', $organization, $units['sede'], $sectors['almoxarifado']),
            'douglas' => $this->person('Douglas Marcondes', 'douglas@exemplo.com', '21970000002', 'Gestor do Almoxarifado', $organization, $units['operacional'], $sectors['almoxarifado']),
            'marcello' => $this->person('Marcello Silva', 'marcello@exemplo.com', '21970000003', 'Operador do Almoxarifado', $organization, $units['operacional'], $sectors['almoxarifado']),
        ];

        $this->user($people['admin'], AccessLevel::Administrator->value);
        $this->user($people['douglas'], AccessLevel::Manager->value);
        $this->user($people['marcello'], AccessLevel::Operator->value);
    }

    private function person(string $name, string $email, string $phone, string $jobTitle, Organization $organization, Unit $unit, Sector $sector): Person
    {
        return Person::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'phone' => $phone,
                'organization_id' => $organization->id,
                'unit_id' => $unit->id,
                'sector_id' => $sector->id,
                'job_title' => $jobTitle,
                'active' => true,
            ]
        );
    }

    private function user(Person $person, int $accessLevel): void
    {
        User::query()->updateOrCreate(
            ['person_id' => $person->id],
            [
                'password' => Hash::make('resende123'),
                'access_level' => $accessLevel,
                'active' => true,
            ]
        );
    }
}
