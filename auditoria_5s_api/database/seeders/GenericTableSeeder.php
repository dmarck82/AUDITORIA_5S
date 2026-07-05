<?php

namespace Database\Seeders;

use App\Models\GenericTable;
use Illuminate\Database\Seeder;

class GenericTableSeeder extends Seeder
{
    public function run(): void
    {
        $tables = [
            'ASSESSMENT_STATUS' => [
                'name' => 'Assessment Status',
                'items' => ['Draft', 'Available', 'In Progress', 'Completed', 'Cancelled'],
            ],
            'ANSWER_SCALE' => [
                'name' => 'Answer Scale',
                'items' => ['Very Bad', 'Bad', 'Regular', 'Good', 'Very Good'],
            ],
            'QUESTION_CATEGORY' => [
                'name' => 'Question Category',
                'items' => ['SORT', 'SET_IN_ORDER', 'SHINE', 'STANDARDIZE', 'SUSTAIN'],
            ],
            'PERSON_STATUS' => [
                'name' => 'Person Status',
                'items' => ['Active', 'Inactive'],
            ],
            'USER_STATUS' => [
                'name' => 'User Status',
                'items' => ['Active', 'Inactive'],
            ],
        ];

        foreach ($tables as $code => $tableData) {
            $genericTable = GenericTable::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $tableData['name'],
                    'active' => true,
                ]
            );

            foreach ($tableData['items'] as $index => $itemName) {
                $genericTable->items()->updateOrCreate(
                    ['code' => $this->codeFromName($itemName)],
                    [
                        'name' => $itemName,
                        'sort_order' => $index + 1,
                        'active' => true,
                    ]
                );
            }
        }
    }

    private function codeFromName(string $name): string
    {
        return str($name)->upper()->replace(' ', '_')->toString();
    }
}
