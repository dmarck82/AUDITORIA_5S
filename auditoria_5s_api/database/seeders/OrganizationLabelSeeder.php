<?php

namespace Database\Seeders;

use App\Models\OrganizationLabel;
use Illuminate\Database\Seeder;

class OrganizationLabelSeeder extends Seeder
{
    public function run(): void
    {
        $labels = [
            'organization' => 'Organização',
            'unit' => 'Unidade',
            'sector' => 'Setor',
            'people' => 'Pessoas',
            'users' => 'Usuários',
            'assessment' => 'Avaliações',
            'question' => 'Perguntas',
            'answer' => 'Respostas',
            'evidence' => 'Evidências',
        ];

        foreach ($labels as $entity => $label) {
            OrganizationLabel::query()->updateOrCreate(
                [
                    'organization_id' => null,
                    'entity' => $entity,
                ],
                [
                    'label' => $label,
                ]
            );
        }
    }
}
