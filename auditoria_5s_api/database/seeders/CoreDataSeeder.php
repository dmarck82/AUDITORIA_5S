<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CoreDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(WarehouseDemoSeeder::class);
        $this->call(PendingWarehouseSupervisionSeeder::class);
    }
}
