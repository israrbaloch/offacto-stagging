<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\Language;
use App\Models\NumberingSeries;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddCompanyForStaff extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get staff user
        $staff = User::where('email', 'staff@example.com')->first();

        if (!$staff) {
            $this->command->warn('Staff user not found. Please run AddUser seeder first.');
            return;
        }

        // Check if staff already has a company
        if ($staff->companies()->exists()) {
            $this->command->info('Staff user already has a company.');
            return;
        }

        // Get or create a default language (English)
        $language = Language::firstOrCreate(
            ['code' => 'en'],
            [
                'name' => 'English',
                'native_name' => 'English',
            ]
        );

        // Create company for staff user
        $company = Company::create([
            'user_id' => $staff->id,
            'first_name' => 'John',
            'surname' => 'Doe',
            'language' => $language->id,
            'self_employed_activity' => 'main_profession',
            'email' => 'company@example.com',
            'phone' => '+1234567890',
            'vat_number' => 'VAT123456789',
            'company_name' => 'Staff Company Ltd',
            'street' => '123 Business Street',
            'house' => 'Suite 100',
            'postal_code' => '12345',
            'city' => 'Business City',
        ]);

        // Create numbering series for the company
        $numberingSeries = NumberingSeries::create([
            'company_id' => $company->id,
            'name' => 'INV-001',
            'type' => 'invoices',
            'prefix' => 'INV',
            'year_month' => 'year',
            'separator' => '-',
            'digits' => '4',
            'next_number' => '0001',
        ]);

        // Create company settings
        CompanySetting::create([
            'company_id' => $company->id,
            'invoice_logo' => null,
            'theme' => json_encode([
                'primary' => '#4054B2',
                'secondary' => '#454545',
            ]),
            'numbering_series' => $numberingSeries->id,
        ]);

        $this->command->info('Company created successfully for staff user.');
    }
}
