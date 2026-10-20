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
            'outgoing-email' => [
                'group' => 'Delivery',
                'title' => 'Outgoing email (SMTP & providers)',
                'description' => 'Configure how Offacto sends invoices, reminders, verification codes, and admin notifications.',
                'fields' => [
                    ['key' => 'int_mail_driver', 'type' => 'select', 'label' => 'Sending method', 'default' => 'smtp', 'options' => ['smtp', 'postmark', 'resend', 'ses', 'log']],
                    ['key' => 'int_mail_from_address', 'type' => 'email', 'label' => 'From email address', 'default' => '', 'hint' => 'Must be allowed by your mail provider (SPF/DKIM).'],
                    ['key' => 'int_mail_from_name', 'type' => 'string', 'label' => 'From name', 'default' => 'Offacto', 'max' => 120],
                    ['key' => 'int_mail_reply_to', 'type' => 'email', 'label' => 'Reply-to address (optional)', 'default' => '', 'optional' => true],
                    ['key' => 'int_smtp_host', 'type' => 'string', 'label' => 'SMTP server', 'default' => '', 'hint' => 'For SMTP only, e.g. smtp.office365.com'],
                    ['key' => 'int_smtp_port', 'type' => 'integer', 'label' => 'SMTP port', 'default' => 587, 'min' => 1, 'max' => 65535],
                    ['key' => 'int_smtp_encryption', 'type' => 'select', 'label' => 'SMTP encryption', 'default' => 'tls', 'options' => ['tls', 'ssl', 'none']],
                    ['key' => 'int_smtp_username', 'type' => 'string', 'label' => 'SMTP username', 'default' => ''],
                    ['key' => 'int_smtp_password', 'type' => 'password', 'label' => 'SMTP password', 'default' => '', 'optional' => true],
                    ['key' => 'int_postmark_token', 'type' => 'password', 'label' => 'Postmark server token', 'default' => '', 'optional' => true],
                    ['key' => 'int_resend_api_key', 'type' => 'password', 'label' => 'Resend API key', 'default' => '', 'optional' => true],
                    ['key' => 'comm_outbound_use_env_fallback', 'type' => 'boolean', 'label' => 'Use server .env values when a field above is left empty', 'default' => true],
                ],
            ],
            'incoming-email' => [
                'group' => 'Delivery',
                'title' => 'Incoming email',
                'description' => 'Receive customer replies and new support messages into the ticket queue.',
                'fields' => [
                    ['key' => 'comm_inbound_enabled', 'type' => 'boolean', 'label' => 'Enable incoming email processing', 'default' => false],
                    ['key' => 'comm_inbound_address', 'type' => 'email', 'label' => 'Support inbox address', 'default' => '', 'hint' => 'The address customers email (e.g. support@yourdomain.com).'],
                    ['key' => 'comm_inbound_provider', 'type' => 'select', 'label' => 'Email provider', 'default' => 'postmark', 'options' => ['postmark', 'mailgun', 'sendgrid', 'generic']],
                    ['key' => 'comm_inbound_mode', 'type' => 'select', 'label' => 'How mail reaches Offacto', 'default' => 'webhook', 'options' => ['webhook', 'forward_only']],
                    ['key' => 'comm_inbound_webhook_secret', 'type' => 'password', 'label' => 'Webhook secret', 'default' => '', 'optional' => true, 'hint' => 'Your provider must send this in the X-Inbound-Secret header. Query parameters are not accepted.'],
                    ['key' => 'comm_inbound_create_tickets', 'type' => 'boolean', 'label' => 'Create a ticket when no open ticket matches the sender', 'default' => true],
                    ['key' => 'comm_inbound_forward_emails', 'type' => 'structured', 'widget' => 'email_recipient_list', 'label' => 'Also forward copies to (optional)', 'default' => []],
                ],
            ],
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
                'title' => 'Personalization codes',
                'description' => 'Built-in codes for emails plus any custom codes your team defines.',
                'fields' => [
                    ['key' => 'comm_custom_merge_codes', 'type' => 'structured', 'widget' => 'custom_merge_codes', 'label' => 'Your custom codes', 'default' => []],
                    ['key' => 'comm_merge_code_help', 'type' => 'textarea', 'label' => 'Notes for your team (optional)', 'default' => 'Codes like #CLIENTNAME# are filled in automatically when an email is sent.'],
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
