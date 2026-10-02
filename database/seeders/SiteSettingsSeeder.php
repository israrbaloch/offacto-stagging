<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General settings
            [
                'key' => 'site_name',
                'value' => 'Offacto',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Site Name',
            ],
            [
                'key' => 'admin_email',
                'value' => 'admin@offacto.com',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Admin Email',
            ],
            
            // Branding settings
            [
                'key' => 'invoice_prefix',
                'value' => 'INV-',
                'type' => 'string',
                'group' => 'branding',
                'label' => 'Invoice Prefix',
            ],
            [
                'key' => 'offer_prefix',
                'value' => 'OFF-',
                'type' => 'string',
                'group' => 'branding',
                'label' => 'Offer Prefix',
            ],
            [
                'key' => 'default_vat_rate',
                'value' => '21',
                'type' => 'integer',
                'group' => 'branding',
                'label' => 'Default VAT Rate (%)',
            ],
            
            // Feature toggles
            [
                'key' => 'require_company_approval',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'features',
                'label' => 'Require Company Approval',
            ],
            [
                'key' => 'require_service_approval',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'features',
                'label' => 'Require Service Approval',
            ],
            [
                'key' => 'allow_user_registration',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'features',
                'label' => 'Allow User Registration',
            ],
            [
                'key' => 'send_welcome_email',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'features',
                'label' => 'Send Welcome Email',
            ],
            [
                'key' => 'platform_default_currency',
                'value' => 'EUR',
                'type' => 'string',
                'group' => 'platform',
                'label' => 'Default currency',
            ],
            [
                'key' => 'payment_gateway',
                'value' => 'mollie',
                'type' => 'string',
                'group' => 'payment',
                'label' => 'Payment gateway',
            ],
            [
                'key' => 'payment_mollie_mode',
                'value' => 'test',
                'type' => 'string',
                'group' => 'payment',
                'label' => 'Mollie mode',
            ],
            [
                'key' => 'payment_mollie_test_key',
                'value' => '',
                'type' => 'string',
                'group' => 'payment',
                'label' => 'Mollie test API key',
            ],
            [
                'key' => 'payment_mollie_live_key',
                'value' => '',
                'type' => 'string',
                'group' => 'payment',
                'label' => 'Mollie live API key',
            ],
        ];

        foreach ($settings as $setting) {
            SiteSetting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
