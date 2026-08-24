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
        // Seed in correct order: languages and countries first (used by companies and customers),
        // then roles, permissions, users, companies, and statuses
        $this->call([
            AddLanguages::class,
            AddCountries::class,
            AddRoles::class,
            AddPermissions::class,
            AddUser::class,
            AddCompanyForStaff::class,
            AddStatuses::class,
            SiteSettingsSeeder::class,
            DemoDataSeeder::class,
        ]);
    }
}
