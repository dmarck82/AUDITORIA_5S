<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            OrganizationLabelSeeder::class,
            GenericTableSeeder::class,
            DemoDataSeeder::class,
            MethodologySeeder::class,
            EvaluationDimensionSeeder::class,
            EvaluationModelSeeder::class,
            EvaluationModelOptionSeeder::class,
            CriterionSeeder::class,
            QuestionnairesSeeder::class,
            QuestionsSeeder::class,
            ProcessesAndActivitiesSeeder::class,
            AssessmentSeeder::class,
        ]);
    }
}
