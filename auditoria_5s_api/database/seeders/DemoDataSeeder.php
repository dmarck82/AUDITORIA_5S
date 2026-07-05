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
        $data = [
            'aman' => ['name' => 'Academia Militar das Agulhas Negras', 'active' => true],
            'industrial' => ['name' => 'Indústria Modelo 5S', 'active' => true],
            'inactive' => ['name' => 'Organização Inativa para Teste', 'active' => false],
        ];

        $organizations = [];

        foreach ($data as $key => $attributes) {
            $organizations[$key] = Organization::updateOrCreate(
                ['name' => $attributes['name']],
                ['active' => $attributes['active']]
            );
        }

        return $organizations;
    }

    /**
     * @param array<string, Organization> $organizations
     * @return array<string, Unit>
     */
    private function seedUnits(array $organizations): array
    {
        $data = [
            'base_admin' => [
                'organization' => 'aman',
                'name' => 'Base Administrativa',
                'address' => 'Resende - RJ',
                'active' => true,
            ],
            'training' => [
                'organization' => 'aman',
                'name' => 'Área de Treinamento',
                'address' => 'Resende - RJ',
                'active' => true,
            ],
            'factory' => [
                'organization' => 'industrial',
                'name' => 'Planta Industrial',
                'address' => 'Rua das Operações, 100',
                'active' => true,
            ],
            'warehouse' => [
                'organization' => 'industrial',
                'name' => 'Centro de Distribuição',
                'address' => 'Avenida Logística, 450',
                'active' => true,
            ],
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
                    'active' => $attributes['active'],
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
            'it' => ['unit' => 'base_admin', 'name' => 'Tecnologia da Informação', 'description' => 'Suporte e infraestrutura de sistemas.'],
            'hr' => ['unit' => 'base_admin', 'name' => 'Recursos Humanos', 'description' => 'Gestão de pessoas e rotinas administrativas.'],
            'maintenance' => ['unit' => 'base_admin', 'name' => 'Manutenção', 'description' => 'Manutenção predial e equipamentos.'],
            'classrooms' => ['unit' => 'training', 'name' => 'Salas de Aula', 'description' => 'Ambientes de instrução e treinamento.'],
            'armory' => ['unit' => 'training', 'name' => 'Almoxarifado de Treinamento', 'description' => 'Materiais e insumos de treinamento.'],
            'production' => ['unit' => 'factory', 'name' => 'Produção', 'description' => 'Linha produtiva principal.'],
            'quality' => ['unit' => 'factory', 'name' => 'Qualidade', 'description' => 'Inspeção e controle de qualidade.'],
            'locker_room' => ['unit' => 'factory', 'name' => 'Vestiários', 'description' => 'Área de apoio aos colaboradores.'],
            'shipping' => ['unit' => 'warehouse', 'name' => 'Expedição', 'description' => 'Separação e envio de materiais.'],
            'inventory' => ['unit' => 'warehouse', 'name' => 'Estoque', 'description' => 'Armazenagem de produtos.'],
        ];

        $sectors = [];

        foreach ($data as $key => $attributes) {
            $sectors[$key] = Sector::updateOrCreate(
                [
                    'unit_id' => $units[$attributes['unit']]->id,
                    'name' => $attributes['name'],
                ],
                [
                    'description' => $attributes['description'],
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
            'douglas' => ['name' => 'Douglas Marcondes', 'email' => 'douglas.marcondes@example.com', 'phone' => '11970000001', 'job_title' => 'Desenvolvedor', 'organization' => 'aman', 'unit' => 'base_admin', 'sector' => 'it', 'active' => true],
            'ana' => ['name' => 'Ana Oliveira', 'email' => 'ana.oliveira@example.com', 'phone' => '11970000002', 'job_title' => 'Supervisora Administrativa', 'organization' => 'aman', 'unit' => 'base_admin', 'sector' => 'hr', 'active' => true],
            'bruno' => ['name' => 'Bruno Almeida', 'email' => 'bruno.almeida@example.com', 'phone' => '11970000003', 'job_title' => 'Técnico de Manutenção', 'organization' => 'aman', 'unit' => 'base_admin', 'sector' => 'maintenance', 'active' => true],
            'camila' => ['name' => 'Camila Rocha', 'email' => 'camila.rocha@example.com', 'phone' => '11970000004', 'job_title' => 'Instrutora', 'organization' => 'aman', 'unit' => 'training', 'sector' => 'classrooms', 'active' => true],
            'daniel' => ['name' => 'Daniel Pereira', 'email' => 'daniel.pereira@example.com', 'phone' => '11970000005', 'job_title' => 'Responsável de Almoxarifado', 'organization' => 'aman', 'unit' => 'training', 'sector' => 'armory', 'active' => true],
            'elisa' => ['name' => 'Elisa Martins', 'email' => 'elisa.martins@example.com', 'phone' => '11970000006', 'job_title' => 'Coordenadora de Produção', 'organization' => 'industrial', 'unit' => 'factory', 'sector' => 'production', 'active' => true],
            'fabio' => ['name' => 'Fábio Costa', 'email' => 'fabio.costa@example.com', 'phone' => '11970000007', 'job_title' => 'Analista da Qualidade', 'organization' => 'industrial', 'unit' => 'factory', 'sector' => 'quality', 'active' => true],
            'gabriela' => ['name' => 'Gabriela Nunes', 'email' => 'gabriela.nunes@example.com', 'phone' => '11970000008', 'job_title' => 'Líder de Expedição', 'organization' => 'industrial', 'unit' => 'warehouse', 'sector' => 'shipping', 'active' => true],
            'henrique' => ['name' => 'Henrique Lima', 'email' => 'henrique.lima@example.com', 'phone' => '11970000009', 'job_title' => 'Estoquista', 'organization' => 'industrial', 'unit' => 'warehouse', 'sector' => 'inventory', 'active' => true],
            'inactive' => ['name' => 'Pessoa Inativa', 'email' => 'pessoa.inativa@example.com', 'phone' => '11970000010', 'job_title' => 'Registro inativo', 'organization' => 'industrial', 'unit' => 'factory', 'sector' => 'locker_room', 'active' => false],
        ];

        $people = [];

        foreach ($data as $key => $attributes) {
            $people[$key] = Person::updateOrCreate(
                ['email' => $attributes['email']],
                [
                    'name' => $attributes['name'],
                    'phone' => $attributes['phone'],
                    'organization_id' => $organizations[$attributes['organization']]->id,
                    'unit_id' => $units[$attributes['unit']]->id,
                    'sector_id' => $sectors[$attributes['sector']]->id,
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
        $userLevels = [
            'douglas' => AccessLevel::Manager->value,
            'ana' => AccessLevel::Operator->value,
            'elisa' => AccessLevel::Respondent->value,
            'gabriela' => AccessLevel::Viewer->value,
        ];

        foreach ($userLevels as $key => $accessLevel) {
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
