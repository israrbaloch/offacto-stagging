<?php

namespace App\Support;

final class ComplianceSettingsRegistry
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function sections(): array
    {
        $config = array_map(
            fn (string $id, array $def) => [
                'id' => $id,
                'group' => $def['group'],
                'title' => $def['title'],
                'description' => $def['description'],
                'kind' => 'config',
                'href' => '/admin/compliance/'.$id,
            ],
            array_keys(self::definitions()),
            self::definitions(),
        );

        $ops = array_map(
            fn (array $row) => [...$row, 'kind' => 'operation', 'href' => '/admin/compliance/operations/'.$row['id']],
            self::operationSections(),
        );

        return array_values([...$config, ...$ops]);
    }

    /**
     * @return list<array{id: string, group: string, title: string, description: string}>
     */
    public static function operationSections(): array
    {
        return [
            ['id' => 'legal-notices', 'group' => 'Records & registers', 'title' => 'Legal document versioning', 'description' => 'Terms, privacy policies, DPAs, and notice publication history.'],
            ['id' => 'consent-records', 'group' => 'Records & registers', 'title' => 'Consent & acknowledgements', 'description' => 'Consent, terms acceptance, notice versions, and withdrawals.'],
            ['id' => 'data-subject-requests', 'group' => 'Privacy requests', 'title' => 'Data subject requests', 'description' => 'Access, correction, export, restriction, and eligible deletion.'],
            ['id' => 'legal-holds', 'group' => 'Retention & deletion', 'title' => 'Legal hold management', 'description' => 'Preservation holds with authorization and release.'],
            ['id' => 'deletion-jobs', 'group' => 'Retention & deletion', 'title' => 'Deletion & anonymization jobs', 'description' => 'Approved retention-based cleanup tasks.'],
            ['id' => 'privacy-access', 'group' => 'Privacy oversight', 'title' => 'Privacy access review', 'description' => 'Privileged access patterns — not bulk surveillance.'],
            ['id' => 'breach-management', 'group' => 'Incidents', 'title' => 'Data breach management', 'description' => 'Incidents, containment, notifications, and deadlines.'],
            ['id' => 'authority-requests', 'group' => 'Lawful requests', 'title' => 'Law-enforcement request register', 'description' => 'Formal authority requests with documented scope and status.'],
            ['id' => 'legal-request-review', 'group' => 'Lawful requests', 'title' => 'Legal request review', 'description' => 'Verify authenticity, jurisdiction, and enforceability before any disclosure.'],
            ['id' => 'evidence-preservation', 'group' => 'Lawful requests', 'title' => 'Evidence preservation', 'description' => 'Hashes, timestamps, and chain-of-custody for lawful investigations.'],
            ['id' => 'controlled-disclosure', 'group' => 'Lawful requests', 'title' => 'Controlled disclosure', 'description' => 'Record exactly what was disclosed — never automatic bulk export.'],
            ['id' => 'compliance-cases', 'group' => 'Case management', 'title' => 'Compliance case management', 'description' => 'Restricted cases separate from customer support.'],
            ['id' => 'peppol-monitoring', 'group' => 'E-invoicing', 'title' => 'Peppol monitoring', 'description' => 'Recent structured invoice transmissions (connectivity is configured per company).'],
            ['id' => 'compliance-reports', 'group' => 'Reporting', 'title' => 'Compliance reports', 'description' => 'Controlled exports for retention, privacy, and disclosure obligations.'],
        ];
    }

    public static function definition(string $id): ?array
    {
        return self::definitions()[$id] ?? null;
    }

    public static function isOperationSection(string $id): bool
    {
        return collect(self::operationSections())->contains(fn ($s) => $s['id'] === $id);
    }

    /**
     * @return array<string, array{group: string, title: string, description: string, fields: list<array<string, mixed>>}>
     */
    public static function definitions(): array
    {
        return [
            'jurisdiction-profiles' => [
                'group' => 'Jurisdiction & tax',
                'title' => 'Jurisdiction profiles',
                'description' => 'Supported markets and baseline invoicing, privacy, retention, and e-document requirements. Belgium is the platform default.',
                'fields' => [
                    ['key' => 'comp_jurisdiction_profiles', 'type' => 'structured', 'widget' => 'jurisdiction_profiles', 'label' => 'Enabled jurisdictions', 'default' => [
                        'BE' => ['enabled' => true, 'privacy_law' => 'GDPR + Belgian implementation', 'invoice_rules' => 'Belgian VAT / company law', 'retention_years_invoices' => 7],
                        'NL' => ['enabled' => false, 'privacy_law' => 'GDPR + AVG', 'invoice_rules' => 'Dutch VAT', 'retention_years_invoices' => 7],
                        'FR' => ['enabled' => false, 'privacy_law' => 'GDPR + Loi Informatique et Libertés', 'invoice_rules' => 'French VAT', 'retention_years_invoices' => 10],
                    ]],
                    ['key' => 'comp_platform_default_jurisdiction', 'type' => 'select', 'label' => 'Platform default jurisdiction', 'default' => 'BE', 'options' => ['BE', 'NL', 'FR', 'EU']],
                ],
            ],
            'jurisdictional-tax' => [
                'group' => 'Jurisdiction & tax',
                'title' => 'Jurisdictional tax rules',
                'description' => 'Effective-dated rates, exemptions, reverse charge, and required wording (configure; financial docs apply Belgium defaults separately).',
                'fields' => [
                    ['key' => 'comp_tax_rules', 'type' => 'structured', 'widget' => 'jurisdictional_tax', 'label' => 'Tax rule sets', 'default' => [
                        ['jurisdiction' => 'BE', 'effective_from' => '2024-01-01', 'standard_rate' => 21, 'reduced_rates' => [6, 12], 'reverse_charge_note' => 'Art. 44 EU VAT — autoliquidation'],
                    ]],
                ],
            ],
            'e-invoicing' => [
                'group' => 'E-invoicing',
                'title' => 'E-invoicing compliance',
                'description' => 'Supported structured formats, validation, and transmission requirements.',
                'fields' => [
                    ['key' => 'comp_einvoice_formats', 'type' => 'structured', 'widget' => 'einvoice_formats', 'label' => 'Formats', 'default' => [
                        'ubl_peppol' => true, 'ubl_be' => true, 'pdf_a' => true, 'factur_x' => false,
                    ]],
                    ['key' => 'comp_einvoice_validate_before_send', 'type' => 'boolean', 'label' => 'Validate structured payload before transmission', 'default' => true],
                    ['key' => 'comp_einvoice_be_mandatory_note', 'type' => 'textarea', 'label' => 'Belgium rollout note (internal)', 'default' => 'Track B2B e-invoicing obligations separately from platform configuration; rules evolve by sector and date.'],
                ],
            ],
            'peppol-policy' => [
                'group' => 'E-invoicing',
                'title' => 'Peppol policy',
                'description' => 'Platform-level retry and monitoring defaults (credentials remain per company integration).',
                'fields' => [
                    ['key' => 'comp_peppol_retry_max', 'type' => 'integer', 'label' => 'Max automatic retries', 'default' => 3, 'min' => 0, 'max' => 10],
                    ['key' => 'comp_peppol_retry_hours', 'type' => 'integer', 'label' => 'Hours between retries', 'default' => 6, 'min' => 1],
                    ['key' => 'comp_peppol_log_validation_failures', 'type' => 'boolean', 'label' => 'Log validation failures to activity log', 'default' => true],
                ],
            ],
            'data-retention' => [
                'group' => 'Retention & deletion',
                'title' => 'Data retention policies',
                'description' => 'Review and retention periods subject to legal holds and stronger national obligations.',
                'fields' => [
                    ['key' => 'comp_retention_invoices_years', 'type' => 'integer', 'label' => 'Invoices & credit notes (years)', 'default' => 7, 'min' => 1],
                    ['key' => 'comp_retention_payments_years', 'type' => 'integer', 'label' => 'Payment records (years)', 'default' => 7, 'min' => 1],
                    ['key' => 'comp_retention_logs_months', 'type' => 'integer', 'label' => 'Security & activity logs (months)', 'default' => 24, 'min' => 6],
                    ['key' => 'comp_retention_support_years', 'type' => 'integer', 'label' => 'Support tickets / comms (years)', 'default' => 3, 'min' => 1],
                    ['key' => 'comp_retention_account_after_close_days', 'type' => 'integer', 'label' => 'Account data after closure (days)', 'default' => 90, 'min' => 30],
                ],
            ],
            'data-residency' => [
                'group' => 'Transfers',
                'title' => 'Data residency & transfers',
                'description' => 'Document hosting and cross-border transfer safeguards (SCCs, adequacy, or other mechanisms).',
                'fields' => [
                    ['key' => 'comp_primary_hosting_region', 'type' => 'string', 'label' => 'Primary hosting region', 'default' => 'EU (Belgium / EEA)', 'max' => 128],
                    ['key' => 'comp_subprocessors', 'type' => 'structured', 'widget' => 'subprocessor_list', 'label' => 'Subprocessors', 'default' => [
                        ['name' => 'Hosting provider', 'purpose' => 'Application hosting', 'region' => 'EEA', 'transfer_mechanism' => 'EEA-only'],
                    ]],
                    ['key' => 'comp_transfer_safeguards_note', 'type' => 'textarea', 'label' => 'Transfer safeguards summary', 'default' => 'Personal data is processed within the EEA unless a subprocessors entry documents an approved transfer mechanism.'],
                ],
            ],
            'export-security' => [
                'group' => 'Safeguards',
                'title' => 'Export security controls',
                'description' => 'Authorization, field limits, expiry, and download audit for compliance exports.',
                'fields' => [
                    ['key' => 'comp_export_require_dual_confirm', 'type' => 'boolean', 'label' => 'Require explicit confirmation checkbox on exports', 'default' => true],
                    ['key' => 'comp_export_link_expiry_hours', 'type' => 'integer', 'label' => 'Generated export link expiry (hours)', 'default' => 24, 'min' => 1],
                    ['key' => 'comp_export_redact_fields', 'type' => 'structured', 'widget' => 'export_redactions', 'label' => 'Redact in standard exports', 'default' => [
                        'national_id' => true, 'bank_full' => true, 'voice_recordings' => false,
                    ]],
                    ['key' => 'comp_export_log_all', 'type' => 'boolean', 'label' => 'Log every compliance export download', 'default' => true],
                ],
            ],
            'disclosure-notification' => [
                'group' => 'Lawful requests',
                'title' => 'Disclosure notification rules',
                'description' => 'Whether customers may be notified when data is disclosed to authorities.',
                'fields' => [
                    ['key' => 'comp_notify_customer_default', 'type' => 'select', 'label' => 'Default when disclosure occurs', 'default' => 'case_by_case', 'options' => ['permitted', 'required', 'delayed', 'restricted', 'case_by_case']],
                    ['key' => 'comp_notify_delay_days', 'type' => 'integer', 'label' => 'Typical delay when legally permitted (days)', 'default' => 0, 'min' => 0],
                    ['key' => 'comp_notify_legal_review_required', 'type' => 'boolean', 'label' => 'Legal review required before customer notification', 'default' => true],
                ],
            ],
            'emergency-disclosure' => [
                'group' => 'Lawful requests',
                'title' => 'Emergency disclosure workflow',
                'description' => 'Narrowly scoped emergencies with retrospective review — not a bypass for ordinary requests.',
                'fields' => [
                    ['key' => 'comp_emergency_enabled', 'type' => 'boolean', 'label' => 'Allow emergency flag on authority requests', 'default' => true],
                    ['key' => 'comp_emergency_retrospective_hours', 'type' => 'integer', 'label' => 'Complete retrospective review within (hours)', 'default' => 72, 'min' => 24],
                    ['key' => 'comp_emergency_min_approvers', 'type' => 'integer', 'label' => 'Minimum approvers for emergency disclosure', 'default' => 2, 'min' => 1],
                ],
            ],
            'processing-register' => [
                'group' => 'Records & registers',
                'title' => 'Data processing register',
                'description' => 'High-level RoPA-style record for platform processing (not a substitute for your DPO register).',
                'fields' => [
                    ['key' => 'comp_processing_register', 'type' => 'structured', 'widget' => 'processing_register', 'label' => 'Processing activities', 'default' => [
                        ['category' => 'Account & identity', 'purpose' => 'Provide the Offacto service', 'legal_basis' => 'Contract', 'retention' => 'Life of account + statutory'],
                        ['category' => 'Invoices & quotations', 'purpose' => 'Billing documents for customers', 'legal_basis' => 'Contract / legal obligation', 'retention' => '7 years (BE default)'],
                        ['category' => 'Voice / signatures', 'purpose' => 'Optional capture features', 'legal_basis' => 'Consent / contract', 'retention' => 'Per company policy'],
                    ]],
                ],
            ],
        ];
    }
}
