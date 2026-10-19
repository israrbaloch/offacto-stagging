<?php

namespace App\Support;

final class PlatformSettingsRegistry
{
    /**
     * @return list<array{id: string, group: string, title: string, description: string}>
     */
    public static function sections(): array
    {
        return array_values(array_map(
            fn (string $id, array $def) => [
                'id' => $id,
                'group' => $def['group'],
                'title' => $def['title'],
                'description' => $def['description'],
            ],
            array_keys(self::definitions()),
            self::definitions(),
        ));
    }

    public static function definition(string $id): ?array
    {
        return self::definitions()[$id] ?? null;
    }

    /**
     * @return array<string, array{group: string, title: string, description: string, fields: list<array<string, mixed>>}>
     */
    public static function definitions(): array
    {
        return [
            'general' => [
                'group' => 'Platform',
                'title' => 'General settings',
                'description' => 'Platform identity, defaults, and core behavior.',
                'fields' => [
                    ['key' => 'site_name', 'type' => 'string', 'label' => 'Platform name', 'default' => 'Offacto', 'max' => 120],
                    ['key' => 'platform_tagline', 'type' => 'string', 'label' => 'Tagline', 'default' => '', 'max' => 255],
                    ['key' => 'admin_email', 'type' => 'email', 'label' => 'Admin contact email', 'default' => ''],
                    ['key' => 'platform_logo', 'type' => 'upload', 'label' => 'Platform logo', 'default' => '', 'accept' => 'image'],
                    ['key' => 'platform_favicon', 'type' => 'upload', 'label' => 'Favicon', 'default' => '', 'accept' => 'favicon'],
                    ['key' => 'platform_default_timezone', 'type' => 'select', 'label' => 'Default timezone', 'default' => 'Europe/Amsterdam', 'options' => ['Europe/Amsterdam', 'Europe/Brussels', 'Europe/Paris', 'UTC']],
                    ['key' => 'platform_default_locale', 'type' => 'select', 'label' => 'Default locale', 'default' => 'en', 'options' => PlatformLocales::codes()],
                    ['key' => 'platform_default_currency', 'type' => 'select', 'label' => 'Default currency', 'default' => 'EUR', 'options' => ['EUR', 'USD', 'GBP']],
                    ['key' => 'allow_user_registration', 'type' => 'boolean', 'label' => 'Allow user registration', 'default' => true],
                    ['key' => 'send_welcome_email', 'type' => 'boolean', 'label' => 'Send welcome email', 'default' => true],
                    ['key' => 'require_company_approval', 'type' => 'boolean', 'label' => 'Require company approval', 'default' => false],
                    ['key' => 'require_service_approval', 'type' => 'boolean', 'label' => 'Require service approval', 'default' => false],
                ],
            ],
            'theme' => [
                'group' => 'Platform',
                'title' => 'Theme & branding',
                'description' => 'Global colors, typography, and default appearance.',
                'fields' => [
                    ['key' => 'theme_primary_color', 'type' => 'color', 'label' => 'Primary color', 'default' => '#0f172a'],
                    ['key' => 'theme_secondary_color', 'type' => 'color', 'label' => 'Secondary color', 'default' => '#64748b'],
                    ['key' => 'theme_default_appearance', 'type' => 'select', 'label' => 'Default appearance', 'default' => 'light', 'options' => ['light', 'dark', 'system']],
                    ['key' => 'theme_font_family', 'type' => 'select', 'label' => 'Font stack', 'default' => 'system', 'options' => ['system', 'inter', 'geist']],
                    ['key' => 'theme_nav_style', 'type' => 'select', 'label' => 'Navigation style', 'default' => 'default', 'options' => ['default', 'compact']],
                ],
            ],
            'company-branding' => [
                'group' => 'Platform',
                'title' => 'Company branding policies',
                'description' => 'What tenants may customize vs. platform-controlled assets.',
                'fields' => [
                    ['key' => 'branding_allow_company_logo', 'type' => 'boolean', 'label' => 'Companies can upload logos', 'default' => true],
                    ['key' => 'branding_allow_company_colors', 'type' => 'boolean', 'label' => 'Companies can set brand colors', 'default' => true],
                    ['key' => 'branding_allow_invoice_logo', 'type' => 'boolean', 'label' => 'Companies can set invoice/quote logos', 'default' => true],
                    ['key' => 'branding_require_platform_footer', 'type' => 'boolean', 'label' => 'Show platform footer on tenant documents', 'default' => false],
                    ['key' => 'branding_locked_fields', 'type' => 'structured', 'widget' => 'branding_locked', 'label' => 'Company-locked branding', 'default' => []],
                ],
            ],
            'languages' => [
                'group' => 'Localization',
                'title' => 'Languages & translations',
                'description' => 'Enabled locales and string overrides (merged at runtime).',
                'fields' => [
                    ['key' => 'platform_enabled_locales', 'type' => 'structured', 'widget' => 'enabled_locales', 'label' => 'Enabled languages', 'default' => PlatformLocales::codes()],
                    ['key' => 'translation_overrides', 'type' => 'structured', 'widget' => 'translation_overrides', 'label' => 'Custom wording', 'default' => []],
                ],
            ],
            'regional' => [
                'group' => 'Localization',
                'title' => 'Regional & locale formats',
                'description' => 'Date, number, and currency display defaults for new companies.',
                'fields' => [
                    ['key' => 'regional_date_format', 'type' => 'select', 'label' => 'Date format', 'default' => 'd-m-Y', 'options' => ['d-m-Y', 'Y-m-d', 'm/d/Y']],
                    ['key' => 'regional_time_format', 'type' => 'select', 'label' => 'Time format', 'default' => '24h', 'options' => ['24h', '12h']],
                    ['key' => 'regional_decimal_separator', 'type' => 'select', 'label' => 'Decimal separator', 'default' => ',', 'options' => [',', '.']],
                    ['key' => 'regional_thousands_separator', 'type' => 'select', 'label' => 'Thousands separator', 'default' => '.', 'options' => ['.', ',', ' ']],
                    ['key' => 'regional_currency_position', 'type' => 'select', 'label' => 'Currency symbol position', 'default' => 'before', 'options' => ['before', 'after']],
                ],
            ],
            'tax' => [
                'group' => 'Commercial defaults',
                'title' => 'Global tax defaults',
                'description' => 'Default VAT and supported tax categories for new companies.',
                'fields' => [
                    ['key' => 'default_vat_rate', 'type' => 'integer', 'label' => 'Default VAT rate (%)', 'default' => 21, 'min' => 0, 'max' => 100],
                    ['key' => 'tax_categories', 'type' => 'structured', 'widget' => 'tax_categories', 'label' => 'Tax categories', 'default' => [
                        ['code' => 'standard', 'name' => 'Standard rate', 'rate' => 21],
                        ['code' => 'reduced', 'name' => 'Reduced rate', 'rate' => 9],
                        ['code' => 'zero', 'name' => 'Zero rate', 'rate' => 0],
                    ]],
                ],
            ],
            'document-templates' => [
                'group' => 'Documents',
                'title' => 'Invoice & quotation templates',
                'description' => 'Default layout, typography, and blocks for generated documents.',
                'fields' => [
                    ['key' => 'document_template_offers', 'type' => 'structured', 'widget' => 'document_template_offers', 'label' => 'Quotation template defaults', 'default' => [
                        'show_logo' => true, 'header_align' => 'left', 'footer_text' => '', 'font_size' => 'medium',
                    ]],
                    ['key' => 'document_template_invoices', 'type' => 'structured', 'widget' => 'document_template_invoices', 'label' => 'Invoice template defaults', 'default' => [
                        'show_logo' => true, 'header_align' => 'left', 'footer_text' => '', 'font_size' => 'medium',
                    ]],
                ],
            ],
            'email-templates' => [
                'group' => 'Communication',
                'title' => 'Email templates',
                'description' => 'Transactional email subjects and bodies. Use merge fields like {{company_name}}.',
                'fields' => [
                    ['key' => 'email_templates', 'type' => 'structured', 'widget' => 'email_templates', 'label' => 'Template definitions', 'default' => [
                        'verification' => ['subject' => 'Verify your email', 'body' => ''],
                        'password_reset' => ['subject' => 'Reset your password', 'body' => ''],
                        'offer_sent' => ['subject' => 'Your quotation', 'body' => ''],
                        'invoice_sent' => ['subject' => 'Your invoice', 'body' => ''],
                        'payment_reminder' => ['subject' => 'Payment reminder', 'body' => ''],
                        'subscription_renewal' => ['subject' => 'Subscription renewal', 'body' => ''],
                        'subscription_cancelled' => ['subject' => 'Subscription cancelled', 'body' => ''],
                    ]],
                ],
            ],
            'pdf-layout' => [
                'group' => 'Documents',
                'title' => 'PDF layout',
                'description' => 'Margins, logo placement, and footer content for PDF exports.',
                'fields' => [
                    ['key' => 'pdf_layout', 'type' => 'structured', 'widget' => 'pdf_layout', 'label' => 'PDF layout options', 'default' => [
                        'margin_top' => 24, 'margin_bottom' => 24, 'margin_left' => 20, 'margin_right' => 20,
                        'logo_position' => 'top-left', 'legal_note' => '', 'show_page_numbers' => true,
                    ]],
                ],
            ],
            'numbering' => [
                'group' => 'Commercial defaults',
                'title' => 'Numbering policies',
                'description' => 'Default series for new companies.',
                'fields' => [
                    ['key' => 'invoice_prefix', 'type' => 'string', 'label' => 'Invoice prefix', 'default' => 'INV-', 'max' => 32],
                    ['key' => 'offer_prefix', 'type' => 'string', 'label' => 'Quotation prefix', 'default' => 'OFF-', 'max' => 32],
                    ['key' => 'numbering_defaults', 'type' => 'structured', 'widget' => 'numbering_defaults', 'label' => 'Advanced numbering', 'default' => [
                        'separator' => '-', 'year_token' => true, 'pad_width' => 4, 'reset_policy' => 'yearly',
                    ]],
                ],
            ],
            'payment-terms' => [
                'group' => 'Commercial defaults',
                'title' => 'Default payment terms',
                'description' => 'Due dates, instructions, and late-payment wording.',
                'fields' => [
                    ['key' => 'payment_terms_days', 'type' => 'integer', 'label' => 'Default due days', 'default' => 14, 'min' => 0, 'max' => 365],
                    ['key' => 'payment_instructions', 'type' => 'textarea', 'label' => 'Bank transfer instructions', 'default' => ''],
                    ['key' => 'payment_late_wording', 'type' => 'textarea', 'label' => 'Late payment wording', 'default' => ''],
                    ['key' => 'payment_methods_enabled', 'type' => 'structured', 'widget' => 'payment_methods', 'label' => 'Enabled payment methods', 'default' => ['bank_transfer', 'mollie']],
                ],
            ],
            'payment-gateway' => [
                'group' => 'Commercial defaults',
                'title' => 'Payment gateway',
                'description' => 'Subscription and checkout payment provider (Mollie).',
                'fields' => [
                    ['key' => 'payment_gateway', 'type' => 'select', 'label' => 'Gateway', 'default' => 'mollie', 'options' => ['mollie', 'none']],
                    ['key' => 'payment_mollie_mode', 'type' => 'select', 'label' => 'Mollie mode', 'default' => 'test', 'options' => ['test', 'live']],
                    ['key' => 'payment_mollie_test_key', 'type' => 'password', 'label' => 'Mollie test API key', 'default' => '', 'optional' => true],
                    ['key' => 'payment_mollie_live_key', 'type' => 'password', 'label' => 'Mollie live API key', 'default' => '', 'optional' => true],
                ],
            ],
            'copyright-licenses' => [
                'group' => 'Documents',
                'title' => 'Copyright & license templates',
                'description' => 'Default clauses for offers and deliverables.',
                'fields' => [
                    ['key' => 'copyright_templates', 'type' => 'structured', 'widget' => 'copyright_templates', 'label' => 'Clause library', 'default' => [
                        ['id' => 'transfer', 'title' => 'Copyright transfer', 'body' => ''],
                        ['id' => 'license', 'title' => 'License grant', 'body' => ''],
                    ]],
                ],
            ],
            'legal-library' => [
                'group' => 'Documents',
                'title' => 'Legal document library',
                'description' => 'Platform terms, privacy notices, and auto-attach rules.',
                'fields' => [
                    ['key' => 'legal_document_library', 'type' => 'structured', 'widget' => 'legal_documents', 'label' => 'Documents', 'default' => [
                        ['id' => 'terms', 'title' => 'Terms of service', 'version' => '1.0', 'url' => '', 'auto_attach' => false],
                        ['id' => 'privacy', 'title' => 'Privacy notice', 'version' => '1.0', 'url' => '', 'auto_attach' => false],
                    ]],
                ],
            ],
            'navigation' => [
                'group' => 'Product',
                'title' => 'Navigation configuration',
                'description' => 'Workspace menu visibility and ordering.',
                'fields' => [
                    ['key' => 'navigation_config', 'type' => 'structured', 'widget' => 'navigation_menu', 'label' => 'Menu configuration', 'default' => [
                        'items' => [
                            ['id' => 'dashboard', 'enabled' => true, 'order' => 1],
                            ['id' => 'customers', 'enabled' => true, 'order' => 2],
                            ['id' => 'offers', 'enabled' => true, 'order' => 3],
                            ['id' => 'invoices', 'enabled' => true, 'order' => 4],
                            ['id' => 'briefings', 'enabled' => true, 'order' => 5],
                        ],
                    ]],
                ],
            ],
            'feature-toggles' => [
                'group' => 'Product',
                'title' => 'Feature toggles',
                'description' => 'Global feature flags. Plan and company overrides are managed separately.',
                'fields' => [
                    ['key' => 'global_feature_flags', 'type' => 'structured', 'widget' => 'feature_flags', 'label' => 'Global flags', 'default' => [
                        'peppol' => false, 'postbode' => true, 'ai_briefings' => false, 'recurring_invoices' => true,
                    ]],
                ],
            ],
            'custom-fields' => [
                'group' => 'Product',
                'title' => 'Custom field builder',
                'description' => 'Additional fields on customers, offers, and invoices.',
                'fields' => [
                    ['key' => 'custom_field_schemas', 'type' => 'structured', 'widget' => 'custom_fields', 'label' => 'Field definitions', 'default' => [
                        'customers' => [], 'companies' => [], 'services' => [], 'offers' => [], 'invoices' => [],
                    ]],
                ],
            ],
            'status-workflows' => [
                'group' => 'Product',
                'title' => 'Status & workflows',
                'description' => 'Status labels, transitions, and approval requirements.',
                'fields' => [
                    ['key' => 'status_workflows', 'type' => 'structured', 'widget' => 'workflows_info', 'label' => 'Workflow definitions', 'default' => [], 'hint' => 'Offers, invoices, and approvals use built-in statuses today. Custom approval chains will be configurable here in a future update.'],
                ],
            ],
            'forms' => [
                'group' => 'Product',
                'title' => 'Form builder',
                'description' => 'Registration, company profile, and briefing form defaults.',
                'fields' => [
                    ['key' => 'forms_config', 'type' => 'structured', 'widget' => 'forms_info', 'label' => 'Form configurations', 'default' => [
                        'registration' => ['fields' => []], 'company_profile' => ['fields' => []], 'briefing' => ['fields' => []],
                    ], 'hint' => 'Registration and briefing forms use standard fields. Optional extra questions will be managed here when released.'],
                ],
            ],
            'dashboard-widgets' => [
                'group' => 'Product',
                'title' => 'Dashboard widgets',
                'description' => 'Default dashboard layout by role.',
                'fields' => [
                    ['key' => 'dashboard_widgets', 'type' => 'structured', 'widget' => 'dashboard_widgets', 'label' => 'Widget layout', 'default' => [
                        'owner' => ['trial', 'revenue', 'pipeline'], 'member' => ['tasks', 'recent_offers'],
                    ]],
                ],
            ],
            'notifications' => [
                'group' => 'Communication',
                'title' => 'Notification preferences',
                'description' => 'Default channels and triggers before user overrides.',
                'fields' => [
                    ['key' => 'notification_defaults', 'type' => 'structured', 'widget' => 'notification_defaults', 'label' => 'Notification defaults', 'default' => [
                        'email' => ['invoice_sent' => true, 'offer_sent' => true], 'in_app' => ['mentions' => true],
                    ]],
                ],
            ],
            'public-pages' => [
                'group' => 'Product',
                'title' => 'Public page customization',
                'description' => 'Branding for public briefing and quotation pages.',
                'fields' => [
                    ['key' => 'public_pages', 'type' => 'structured', 'widget' => 'public_pages', 'label' => 'Public page settings', 'default' => [
                        'briefing' => ['show_platform_logo' => true, 'accent_color' => '#0f172a'],
                        'quotation' => ['show_platform_logo' => true, 'accent_color' => '#0f172a'],
                    ]],
                ],
            ],
            'maintenance' => [
                'group' => 'Platform',
                'title' => 'Maintenance mode',
                'description' => 'Restrict nonessential access during planned work.',
                'fields' => [
                    ['key' => 'maintenance_enabled', 'type' => 'boolean', 'label' => 'Maintenance mode active', 'default' => false],
                    ['key' => 'maintenance_message', 'type' => 'textarea', 'label' => 'Public message', 'default' => 'We are performing scheduled maintenance. Please try again shortly.'],
                    ['key' => 'maintenance_allow_admins', 'type' => 'boolean', 'label' => 'Allow platform admins full access', 'default' => true],
                ],
            ],
        ];
    }
}
