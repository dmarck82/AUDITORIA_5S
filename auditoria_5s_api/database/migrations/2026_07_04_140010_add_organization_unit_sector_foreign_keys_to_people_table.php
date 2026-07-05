<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('UPDATE people SET organization_id = NULL WHERE organization_id IS NOT NULL AND organization_id NOT IN (SELECT id FROM organizations)');
        DB::statement('UPDATE people SET unit_id = NULL WHERE unit_id IS NOT NULL AND unit_id NOT IN (SELECT id FROM units)');
        DB::statement('UPDATE people SET sector_id = NULL WHERE sector_id IS NOT NULL AND sector_id NOT IN (SELECT id FROM sectors)');

        Schema::table('people', function (Blueprint $table) {
            $table->foreign('organization_id')->references('id')->on('organizations')->nullOnDelete();
            $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
            $table->foreign('sector_id')->references('id')->on('sectors')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('people', function (Blueprint $table) {
            $table->dropForeign(['organization_id']);
            $table->dropForeign(['unit_id']);
            $table->dropForeign(['sector_id']);
        });
    }
};
