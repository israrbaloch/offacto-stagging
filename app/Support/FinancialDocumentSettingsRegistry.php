<?php

namespace App\Support;

final class FinancialDocumentSettingsRegistry
{
    /**
     * @return list<array{id: string, group: string, title: string, description: string, kind?: string}>
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
                'href' => '/admin/financial/'.$id,
            ],
            array_keys(self::definitions()),
            self::definitions(),
        );

        $ops = array_map(
            fn (array $row) => [...$row, 'kind' => 'operation', 'href' => '/admin/financial/operations/'.$row['id']],
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
            ['id' => 'version-history', 'group' => 'Operations', 'title' => 'Document version history', 'description' => 'Revisions, changed fields, and who made each change.'],
            ['id' => 'reconciliation', 'group' => 'Operations', 'title' => 'Financial reconciliation', 'description' => 'Compare invoice balances, recorded payments, and provider transactions.'],
            ['id' => 'exceptions', 'group' => 'Operations', 'title' => 'Financial exceptions', 'description' => 'Unusual totals, tax anomalies, duplicates, and payment inconsistencies.'],
            ['id' => 'delivery-history', 'group' => 'Operations', 'title' => 'Document delivery history', 'description' => 'Email, postal, and Peppol delivery attempts and statuses.'],
            ['id' => 'audit-export', 'group' => 'Operations', 'title' => 'Financial audit export', 'description' => 'Download an authorized export for review or compliance.'],
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
            'document-policy' => [
                'group' => 'Document policies',
                'title' => 'Document policy center',
                'description' => 'Which actions are allowed on quotations and invoices across the platform (Belgium default).',
                'fields' => [
                    ['key' => 'fin_doc_policy', 'type' => 'structured', 'widget' => 'document_policy', 'label' => 'Document permissions', 'default' => [
                        'quotation' => ['create' => true, 'edit' => true, 'send' => true, 'cancel' => true, 'delete' => true],
                        'invoice' => ['create' => true, 'edit' => true, 'send' => true, 'cancel' => false, 'delete' => false],
                        'credit_note' => ['create' => true, 'edit' => true, 'send' => true, 'cancel' => false, 'delete' => false],
                    ]],
                    ['key' => 'fin_default_jurisdiction', 'type' => 'select', 'label' => 'Default jurisdiction', 'default' => 'BE', 'options' => ['BE', 'NL', 'FR', 'EU']],
                ],
            ],
            'invoice-locking' => [
                'group' => 'Document policies',
                'title' => 'Invoice issuance & locking',
                'description' => 'When issued invoices become immutable; corrections via credit notes (Belgian practice).',
                'fields' => [
                    ['key' => 'fin_invoice_lock_trigger', 'type' => 'select', 'label' => 'Lock invoice when', 'default' => 'on_first_send', 'options' => ['on_first_send', 'on_mark_sent', 'on_payment_recorded']],
                    ['key' => 'fin_invoice_allow_edit_after_lock', 'type' => 'boolean', 'label' => 'Allow editing locked invoices (not recommended)', 'default' => false],
                    ['key' => 'fin_invoice_correction_method', 'type' => 'select', 'label' => 'Permitted correction method', 'default' => 'credit_note_only', 'options' => ['credit_note_only', 'credit_note_or_new_invoice']],
                    ['key' => 'fin_invoice_require_credit_reason', 'type' => 'boolean', 'label' => 'Require reason on credit notes', 'default' => true],
                ],
            ],
            'credit-notes' => [
                'group' => 'Document policies',
                'title' => 'Credit note policies',
                'description' => 'Numbering, references, and approval for credit notes.',
                'fields' => [
                    ['key' => 'fin_credit_note_prefix', 'type' => 'string', 'label' => 'Credit note prefix', 'default' => 'CN-', 'max' => 16],
                    ['key' => 'fin_credit_require_original_invoice', 'type' => 'boolean', 'label' => 'Require link to original invoice', 'default' => true],
                    ['key' => 'fin_credit_approval_threshold', 'type' => 'integer', 'label' => 'Internal approval above (EUR)', 'default' => 0, 'min' => 0, 'hint' => '0 = no approval step'],
                    ['key' => 'fin_credit_template_footer', 'type' => 'textarea', 'label' => 'Default credit note footer', 'default' => 'Credit note issued in accordance with Belgian VAT rules.'],
                ],
            ],
            'quotation-acceptance' => [
                'group' => 'Quotations',
                'title' => 'Quotation acceptance policies',
                'description' => 'Validity, client decisions, and public acceptance flows.',
                'fields' => [
                    ['key' => 'fin_quote_default_validity_days', 'type' => 'integer', 'label' => 'Default validity (days)', 'default' => 30, 'min' => 1, 'max' => 365],
                    ['key' => 'fin_quote_require_accept_signature', 'type' => 'boolean', 'label' => 'Require client name on accept', 'default' => true],
                    ['key' => 'fin_quote_allow_public_decline', 'type' => 'boolean', 'label' => 'Allow decline on public quotation page', 'default' => true],
                    ['key' => 'fin_quote_acceptance_workflow', 'type' => 'select', 'label' => 'After client accepts', 'default' => 'notify_company', 'options' => ['notify_company', 'create_draft_invoice', 'manual_follow_up']],
                ],
            ],
            'invoice-approval' => [
                'group' => 'Approvals',
                'title' => 'Invoice approval workflow',
                'description' => 'Optional review before invoices are sent or marked final.',
                'fields' => [
                    ['key' => 'fin_invoice_approval_enabled', 'type' => 'boolean', 'label' => 'Require approval before send', 'default' => false],
                    ['key' => 'fin_invoice_approval_threshold', 'type' => 'integer', 'label' => 'Approval required above (EUR excl. VAT)', 'default' => 2500, 'min' => 0],
                    ['key' => 'fin_invoice_approval_skip_for_recurring', 'type' => 'boolean', 'label' => 'Skip approval for recurring drafts', 'default' => true],
                ],
            ],
            'quotation-approval' => [
                'group' => 'Approvals',
                'title' => 'Quotation approval workflow',
                'description' => 'Internal sign-off for high-value quotations.',
                'fields' => [
                    ['key' => 'fin_quote_approval_enabled', 'type' => 'boolean', 'label' => 'Require internal approval before send', 'default' => false],
                    ['key' => 'fin_quote_approval_threshold', 'type' => 'integer', 'label' => 'Approval required above (EUR excl. VAT)', 'default' => 5000, 'min' => 0],
                ],
            ],
            'vat-rounding' => [
                'group' => 'Tax (Belgium)',
                'title' => 'VAT calculation & rounding',
                'description' => 'Belgian standard rates (21%, 6%, 12%, 0%) and rounding rules.',
                'fields' => [
                    ['key' => 'fin_vat_calculation_mode', 'type' => 'select', 'label' => 'Calculate VAT', 'default' => 'per_line', 'options' => ['per_line', 'on_subtotal']],
                    ['key' => 'fin_vat_rounding_decimals', 'type' => 'select', 'label' => 'Round amounts to', 'default' => '2', 'options' => ['2', '3', '4']],
                    ['key' => 'fin_vat_rounding_difference', 'type' => 'select', 'label' => 'Rounding difference', 'default' => 'adjust_last_line', 'options' => ['adjust_last_line', 'separate_line', 'ignore']],
                    ['key' => 'fin_be_vat_rates', 'type' => 'structured', 'widget' => 'be_vat_rates', 'label' => 'Supported Belgian VAT rates', 'default' => [
                        ['label' => 'Standard', 'rate' => 21],
                        ['label' => 'Reduced', 'rate' => 6],
                        ['label' => 'Intermediate', 'rate' => 12],
                        ['label' => 'Zero', 'rate' => 0],
                    ]],
                ],
            ],
            'tax-exemptions' => [
                'group' => 'Tax (Belgium)',
                'title' => 'Tax exemptions & reverse charge',
                'description' => 'Intra-EU B2B and exempt scenarios with mandatory wording.',
                'fields' => [
                    ['key' => 'fin_reverse_charge_enabled', 'type' => 'boolean', 'label' => 'Enable reverse charge (Art. 44 EU VAT)', 'default' => true],
                    ['key' => 'fin_reverse_charge_wording', 'type' => 'textarea', 'label' => 'Reverse charge invoice text', 'default' => 'Verlegging van heffing / Autoliquidation — VAT to be accounted for by the customer pursuant to Article 44 of Directive 2006/112/EC.'],
                    ['key' => 'fin_exempt_small_business', 'type' => 'boolean', 'label' => 'Support small business exemption mention', 'default' => true],
                    ['key' => 'fin_exempt_wording', 'type' => 'textarea', 'label' => 'Exemption wording (optional)', 'default' => ''],
                ],
            ],
            'invoice-validation' => [
                'group' => 'Validation',
                'title' => 'Invoice validation rules',
                'description' => 'Required fields before an invoice can be sent (aligned with EU/Belgian baseline).',
                'fields' => [
                    ['key' => 'fin_validation_rules', 'type' => 'structured', 'widget' => 'invoice_validation', 'label' => 'Required checks', 'default' => [
                        'seller_vat' => true,
                        'seller_address' => true,
                        'customer_name' => true,
                        'customer_address' => true,
                        'sequential_number' => true,
                        'invoice_date' => true,
                        'line_descriptions' => true,
                        'vat_breakdown' => true,
                        'totals_match' => true,
                        'be_company_number' => true,
                    ]],
                ],
            ],
            'payment-recording' => [
                'group' => 'Payments',
                'title' => 'Payment recording policies',
                'description' => 'How staff may record and reconcile payments.',
                'fields' => [
                    ['key' => 'fin_payment_methods', 'type' => 'structured', 'widget' => 'payment_methods', 'label' => 'Allowed methods', 'default' => ['bank_transfer', 'card', 'cash', 'mollie']],
                    ['key' => 'fin_payment_manual_allowed', 'type' => 'boolean', 'label' => 'Allow manual payment entry', 'default' => true],
                    ['key' => 'fin_payment_require_reference', 'type' => 'boolean', 'label' => 'Require payment reference', 'default' => true],
                    ['key' => 'fin_payment_overpayment_block', 'type' => 'boolean', 'label' => 'Block overpayment without approval', 'default' => true],
                ],
            ],
            'payment-adjustments' => [
                'group' => 'Payments',
                'title' => 'Payment adjustments & refunds',
                'description' => 'Controlled adjustments with audit trail.',
                'fields' => [
                    ['key' => 'fin_adjustment_require_reason', 'type' => 'boolean', 'label' => 'Require reason for adjustments', 'default' => true],
                    ['key' => 'fin_adjustment_admin_only', 'type' => 'boolean', 'label' => 'Only company owners can adjust payments', 'default' => false],
                    ['key' => 'fin_refund_require_mollie_reconcile', 'type' => 'boolean', 'label' => 'Require provider reference for online refunds', 'default' => true],
                ],
            ],
            'overdue-reminders' => [
                'group' => 'Collections',
                'title' => 'Overdue & reminder policies',
                'description' => 'Reminder schedule and dispute exceptions.',
                'fields' => [
                    ['key' => 'fin_reminder_schedule', 'type' => 'structured', 'widget' => 'reminder_schedule', 'label' => 'Reminder days after due date', 'default' => [7, 14, 30]],
                    ['key' => 'fin_reminder_grace_days', 'type' => 'integer', 'label' => 'Grace period before first reminder', 'default' => 0, 'min' => 0],
                    ['key' => 'fin_reminder_pause_on_dispute', 'type' => 'boolean', 'label' => 'Pause reminders when invoice is disputed', 'default' => true],
                    ['key' => 'fin_reminder_escalation_email', 'type' => 'textarea', 'label' => 'Final reminder extra wording', 'default' => 'Without payment we may refer this invoice to a collections procedure.'],
                ],
            ],
            'recurring-invoices' => [
                'group' => 'Recurring',
                'title' => 'Recurring invoice policies',
                'description' => 'Scheduled billing behavior and failures.',
                'fields' => [
                    ['key' => 'fin_recurring_intervals', 'type' => 'structured', 'widget' => 'recurring_intervals', 'label' => 'Permitted intervals', 'default' => ['weekly' => false, 'monthly' => true, 'yearly' => true]],
                    ['key' => 'fin_recurring_create_as_draft', 'type' => 'boolean', 'label' => 'Generate as draft only', 'default' => true],
                    ['key' => 'fin_recurring_require_approval', 'type' => 'boolean', 'label' => 'Require approval before send', 'default' => false],
                    ['key' => 'fin_recurring_on_failure', 'type' => 'select', 'label' => 'When generation fails', 'default' => 'notify_admin', 'options' => ['notify_admin', 'retry_next_day', 'disable_template']],
                ],
            ],
            'document-exports' => [
                'group' => 'Exports',
                'title' => 'Financial document exports',
                'description' => 'Authorized export formats and logging.',
                'fields' => [
                    ['key' => 'fin_export_formats', 'type' => 'structured', 'widget' => 'export_formats', 'label' => 'Allowed export types', 'default' => [
                        'pdf' => true, 'zip' => true, 'ubl' => true, 'accounting_csv' => false,
                    ]],
                    ['key' => 'fin_export_log_access', 'type' => 'boolean', 'label' => 'Log every export download', 'default' => true],
                    ['key' => 'fin_export_admin_only_zip', 'type' => 'boolean', 'label' => 'Bulk ZIP exports: platform admin only', 'default' => false],
                ],
            ],
        ];
    }
}
