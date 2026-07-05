<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $organizationId = DB::table('organizations')->orderBy('id')->value('id');

        if (!$organizationId) {
            $organizationId = DB::table('organizations')->insertGetId([
                'name' => 'Default Organization',
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('people')
            ->whereNull('organization_id')
            ->update([
                'organization_id' => $organizationId,
                'unit_id' => null,
                'sector_id' => null,
                'updated_at' => now(),
            ]);

        Schema::table('people', function ($table) {
            $table->dropForeign(['organization_id']);
        });

        DB::statement('ALTER TABLE people MODIFY organization_id BIGINT UNSIGNED NOT NULL');

        Schema::table('people', function ($table) {
            $table
                ->foreign('organization_id')
                ->references('id')
                ->on('organizations')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('people', function ($table) {
            $table->dropForeign(['organization_id']);
        });

        DB::statement('ALTER TABLE people MODIFY organization_id BIGINT UNSIGNED NULL');

        Schema::table('people', function ($table) {
            $table
                ->foreign('organization_id')
                ->references('id')
                ->on('organizations')
                ->nullOnDelete();
        });
    }
};
