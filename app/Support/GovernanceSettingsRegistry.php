<?php

namespace App\Support;

final class GovernanceSettingsRegistry
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
                'href' => '/admin/governance/'.$id,
            ],
            array_keys(self::definitions()),
            self::definitions(),
        );

        $ops = array_map(
            fn (array $row) => [...$row, 'kind' => 'operation', 'href' => '/admin/governance/operations/'.$row['id']],
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
            ['id' => 'bulk-operations', 'group' => 'Operations', 'title' => 'Bulk operations', 'description' => 'Preview, validate, and confirm authorized bulk actions.'],
            ['id' => 'import-migration', 'group' => 'Data movement', 'title' => 'Import & migration center', 'description' => 'CSV imports with mapping, validation, and error reports.'],
            ['id' => 'export-jobs', 'group' => 'Data movement', 'title' => 'Export job manager', 'description' => 'Large exports, expiry, and download tracking.'],
            ['id' => 'config-history', 'group' => 'Configuration', 'title' => 'Configuration change history', 'description' => 'Previous and new values with administrator and timestamp.'],
            ['id' => 'config-versioning', 'group' => 'Configuration', 'title' => 'Versioning & rollback', 'description' => 'Snapshots and section-scoped restore.'],
            ['id' => 'approval-queue', 'group' => 'Approvals', 'title' => 'Admin approval queue', 'description' => 'Pending company, access, and compliance approvals.'],
            ['id' => 'scheduled-changes', 'group' => 'Configuration', 'title' => 'Scheduled configuration changes', 'description' => 'Future-effective pricing, policy, and template updates.'],
            ['id' => 'action-simulation', 'group' => 'Operations', 'title' => 'Admin action simulation', 'description' => 'Preview impact before applying changes.'],
            ['id' => 'runbooks', 'group' => 'Operations', 'title' => 'Operational runbooks', 'description' => 'Approved outage, integration, and recovery procedures.'],
            ['id' => 'global-audit', 'group' => 'Audit', 'title' => 'Global audit search', 'description' => 'Search activity across users, companies, and admin actions.'],
            ['id' => 'reconciliation', 'group' => 'Integrity', 'title' => 'Reconciliation dashboard', 'description' => 'Internal vs payment and document discrepancies.'],
            ['id' => 'admin-api', 'group' => 'Automation', 'title' => 'Admin API & automation', 'description' => 'Scoped keys for reporting and operational automation.'],
            ['id' => 'admin-access-review', 'group' => 'Access', 'title' => 'Admin access review', 'description' => 'Privileged accounts, roles, and inactive administrators.'],
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
            'environment-separation' => [
                'group' => 'Environment',
                'title' => 'Environment separation',
                'description' => 'Label the deployment and block test operations from affecting live data.',
                'fields' => [
                    ['key' => 'gov_environment_label', 'type' => 'select', 'label' => 'Declared environment', 'default' => 'production', 'options' => ['development', 'staging', 'production']],
                    ['key' => 'gov_block_destructive_in_production', 'type' => 'boolean', 'label' => 'Block destructive bulk/import execute in production', 'default' => true],
                    ['key' => 'gov_require_test_payment_keys', 'type' => 'boolean', 'label' => 'Require Mollie test mode outside production label', 'default' => true],
                    ['key' => 'gov_show_environment_banner', 'type' => 'boolean', 'label' => 'Show environment banner to platform admins', 'default' => true],
                ],
            ],
            'bulk-policies' => [
                'group' => 'Operations',
                'title' => 'Bulk operation policies',
                'description' => 'Confirmation and preview requirements.',
                'fields' => [
                    ['key' => 'gov_bulk_dual_confirm', 'type' => 'boolean', 'label' => 'Require dual confirmation for bulk execute', 'default' => true],
                    ['key' => 'gov_bulk_max_rows', 'type' => 'integer', 'label' => 'Maximum rows per bulk batch', 'default' => 500, 'min' => 1],
                ],
            ],
            'export-policies' => [
                'group' => 'Data movement',
                'title' => 'Export policies',
                'description' => 'Retention and access for large exports.',
                'fields' => [
                    ['key' => 'gov_export_expiry_days', 'type' => 'integer', 'label' => 'Download link expiry (days)', 'default' => 7, 'min' => 1],
                    ['key' => 'gov_export_log_downloads', 'type' => 'boolean', 'label' => 'Log export downloads in activity audit', 'default' => true],
                ],
            ],
        ];
    }
}
