<?php

namespace App\Support;

final class CommunicationSettingsRegistry
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
                'href' => '/admin/communications/'.$id,
            ],
            array_keys(self::definitions()),
            self::definitions(),
        );

        $ops = array_map(
            fn (array $row) => [...$row, 'kind' => 'operation', 'href' => '/admin/communications/operations/'.$row['id']],
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
            ['id' => 'preview-testing', 'group' => 'Testing', 'title' => 'Email preview & testing', 'description' => 'Preview with sample data and send tests to your admin address only.'],
            ['id' => 'delivery-analytics', 'group' => 'Monitoring', 'title' => 'Email delivery analytics', 'description' => 'Delivered, bounced, deferred, and failed counts from logged events.'],
            ['id' => 'queue-monitor', 'group' => 'Monitoring', 'title' => 'Email queue monitor', 'description' => 'Queued and failed jobs with safe retry.'],
            ['id' => 'communication-history', 'group' => 'History', 'title' => 'Customer communication history', 'description' => 'Metadata and delivery events — not full message bodies for all admins.'],
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
            'template-library' => [
                'group' => 'Templates',
                'title' => 'Email template library',
                'description' => 'Central transactional templates (shared with Settings → Email templates). Use merge codes from the variables manager.',
                'fields' => [
                    ['key' => 'email_templates', 'type' => 'structured', 'widget' => 'email_templates', 'label' => 'Templates', 'default' => [
                        'verification' => ['subject' => 'Verify your email', 'body' => ''],
                        'password_reset' => ['subject' => 'Reset your password', 'body' => ''],
                        'offer_sent' => ['subject' => 'Your quotation', 'body' => ''],
                        'invoice_sent' => ['subject' => 'Your invoice', 'body' => ''],
                        'payment_reminder' => ['subject' => 'Payment reminder', 'body' => ''],
                        'subscription_renewal' => ['subject' => 'Subscription renewal', 'body' => ''],
                        'subscription_cancelled' => ['subject' => 'Subscription cancelled', 'body' => ''],
                    ]],
                    ['key' => 'comm_validate_merge_codes', 'type' => 'boolean', 'label' => 'Reject save when unknown merge codes are detected', 'default' => true],
                ],
            ],
            'email-variables' => [
                'group' => 'Templates',
                'title' => 'Email variables manager',
                'description' => 'Document supported merge codes and optional custom placeholders.',
                'fields' => [
                    ['key' => 'comm_custom_merge_codes', 'type' => 'structured', 'widget' => 'custom_merge_codes', 'label' => 'Custom codes', 'default' => []],
                    ['key' => 'comm_merge_code_help', 'type' => 'textarea', 'label' => 'Internal documentation', 'default' => 'Use #CODE# syntax. Invoice and offer sends replace codes at dispatch time.'],
                ],
            ],
            'notification-rules' => [
                'group' => 'Rules',
                'title' => 'Notification rules engine',
                'description' => 'Event-driven notifications by role and channel (email / in-app where supported).',
                'fields' => [
                    ['key' => 'comm_notification_rules', 'type' => 'structured', 'widget' => 'notification_rules', 'label' => 'Rules', 'default' => [
                        ['event' => 'invoice.sent', 'channel' => 'email', 'roles' => ['owner'], 'enabled' => true],
                        ['event' => 'offer.sent', 'channel' => 'email', 'roles' => ['owner'], 'enabled' => true],
                        ['event' => 'subscription.expiring', 'channel' => 'email', 'roles' => ['owner'], 'enabled' => true],
                    ]],
                ],
            ],
            'scheduled-notifications' => [
                'group' => 'Rules',
                'title' => 'Scheduled notifications',
                'description' => 'Trial expiry, renewals, and payment reminders (requires scheduler commands).',
                'fields' => [
                    ['key' => 'comm_scheduled_notifications', 'type' => 'structured', 'widget' => 'scheduled_notifications', 'label' => 'Schedules', 'default' => [
                        'trial_expiry_days' => [7, 3, 1],
                        'subscription_renewal_days' => [14, 7],
                        'invoice_reminder_use_company_settings' => true,
                    ]],
                    ['key' => 'comm_scheduled_enabled', 'type' => 'boolean', 'label' => 'Enable platform scheduled communication jobs', 'default' => true],
                ],
            ],
            'communication-suppression' => [
                'group' => 'Compliance',
                'title' => 'Communication suppression',
                'description' => 'Unsubscribe, marketing consent, bounces, and transactional exceptions.',
                'fields' => [
                    ['key' => 'comm_honor_unsubscribe', 'type' => 'boolean', 'label' => 'Honor marketing unsubscribe list', 'default' => true],
                    ['key' => 'comm_marketing_requires_consent', 'type' => 'boolean', 'label' => 'Block marketing email without recorded consent', 'default' => true],
                    ['key' => 'comm_bounce_suppress_days', 'type' => 'integer', 'label' => 'Suppress address after hard bounce (days)', 'default' => 90, 'min' => 1],
                    ['key' => 'comm_transactional_override', 'type' => 'boolean', 'label' => 'Allow transactional messages despite marketing unsubscribe', 'default' => true],
                    ['key' => 'notification_defaults', 'type' => 'structured', 'widget' => 'notification_defaults', 'label' => 'Default user notification prefs', 'default' => [
                        'email' => ['invoice_sent' => true, 'offer_sent' => true], 'in_app' => ['mentions' => true],
                    ]],
                ],
            ],
        ];
    }
}
