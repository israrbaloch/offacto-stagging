<?php

namespace App\Support;

final class InfrastructureSettingsRegistry
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
                'href' => '/admin/infrastructure/'.$id,
            ],
            array_keys(self::definitions()),
            self::definitions(),
        );

        $ops = array_map(
            fn (array $row) => [...$row, 'kind' => 'operation', 'href' => '/admin/infrastructure/operations/'.$row['id']],
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
            ['id' => 'database-health', 'group' => 'Monitoring', 'title' => 'Database health', 'description' => 'Availability, connections, capacity, and table scale.'],
            ['id' => 'queue-workers', 'group' => 'Processing', 'title' => 'Queue & worker monitor', 'description' => 'Queue depth, failed jobs, and worker guidance.'],
            ['id' => 'scheduled-tasks', 'group' => 'Processing', 'title' => 'Scheduled task monitor', 'description' => 'Recurring invoices, subscriptions, and daily commands.'],
            ['id' => 'backup-management', 'group' => 'Resilience', 'title' => 'Backup management', 'description' => 'Recorded backup runs, encryption, and retention.'],
            ['id' => 'restore-dr', 'group' => 'Resilience', 'title' => 'Restore & disaster recovery', 'description' => 'Authorized restore tests and results.'],
            ['id' => 'storage-management', 'group' => 'Storage', 'title' => 'Storage management', 'description' => 'Disk usage and uploaded asset growth.'],
            ['id' => 'failed-jobs', 'group' => 'Processing', 'title' => 'Failed job management', 'description' => 'Inspect failures and replay with confirmation.'],
            ['id' => 'system-logs', 'group' => 'Monitoring', 'title' => 'System log viewer', 'description' => 'Recent application log lines with redaction.'],
            ['id' => 'data-integrity', 'group' => 'Monitoring', 'title' => 'Data integrity monitor', 'description' => 'Orphans, balance mismatches, and broken links.'],
            ['id' => 'maintenance-windows', 'group' => 'Operations', 'title' => 'Maintenance & upgrades', 'description' => 'Planned windows, queue pauses, and maintenance mode coordination.'],
            ['id' => 'dr-metrics', 'group' => 'Resilience', 'title' => 'Disaster recovery metrics', 'description' => 'RTO/RPO targets and latest restore test.'],
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
            'backup-policies' => [
                'group' => 'Resilience',
                'title' => 'Backup policies',
                'description' => 'Schedule expectations and retention (actual backups run outside the app or via your host).',
                'fields' => [
                    ['key' => 'infra_backup_frequency', 'type' => 'select', 'label' => 'Expected frequency', 'default' => 'daily', 'options' => ['hourly', 'daily', 'weekly']],
                    ['key' => 'infra_backup_retention_days', 'type' => 'integer', 'label' => 'Retention (days)', 'default' => 30, 'min' => 7],
                    ['key' => 'infra_backup_encrypted', 'type' => 'boolean', 'label' => 'Backups must be encrypted at rest', 'default' => true],
                    ['key' => 'infra_backup_destinations', 'type' => 'structured', 'widget' => 'backup_destinations', 'label' => 'Destinations', 'default' => [
                        ['name' => 'Primary object storage', 'region' => 'EEA'],
                    ]],
                ],
            ],
            'attachment-lifecycle' => [
                'group' => 'Storage',
                'title' => 'Attachment lifecycle',
                'description' => 'Retention and cleanup for PDFs, uploads, signatures, and voice notes.',
                'fields' => [
                    ['key' => 'infra_attach_temp_days', 'type' => 'integer', 'label' => 'Temporary files (days)', 'default' => 7, 'min' => 1],
                    ['key' => 'infra_attach_pdf_years', 'type' => 'integer', 'label' => 'Generated PDFs minimum retention (years)', 'default' => 7, 'min' => 1],
                    ['key' => 'infra_attach_voice_days', 'type' => 'integer', 'label' => 'Voice recordings default (days, 0=keep)', 'default' => 0, 'min' => 0],
                    ['key' => 'infra_attach_cleanup_enabled', 'type' => 'boolean', 'label' => 'Enable scheduled attachment cleanup job', 'default' => false],
                ],
            ],
            'disaster-recovery-targets' => [
                'group' => 'Resilience',
                'title' => 'DR targets (RTO/RPO)',
                'description' => 'Objectives for recovery planning and test cadence.',
                'fields' => [
                    ['key' => 'infra_rpo_hours', 'type' => 'integer', 'label' => 'Recovery point objective (hours)', 'default' => 24, 'min' => 1],
                    ['key' => 'infra_rto_hours', 'type' => 'integer', 'label' => 'Recovery time objective (hours)', 'default' => 4, 'min' => 1],
                    ['key' => 'infra_restore_test_days', 'type' => 'integer', 'label' => 'Restore test every (days)', 'default' => 90, 'min' => 30],
                ],
            ],
            'maintenance-controls' => [
                'group' => 'Operations',
                'title' => 'Maintenance controls',
                'description' => 'Links platform maintenance mode (also under Settings → Maintenance).',
                'fields' => [
                    ['key' => 'maintenance_enabled', 'type' => 'boolean', 'label' => 'Maintenance mode active', 'default' => false],
                    ['key' => 'maintenance_message', 'type' => 'textarea', 'label' => 'Public message', 'default' => 'We are performing scheduled maintenance. Please try again shortly.'],
                    ['key' => 'maintenance_allow_admins', 'type' => 'boolean', 'label' => 'Allow platform admins during maintenance', 'default' => true],
                    ['key' => 'infra_pause_queues_on_maintenance', 'type' => 'boolean', 'label' => 'Recommend pausing queue workers during maintenance', 'default' => true],
                ],
            ],
        ];
    }
}
