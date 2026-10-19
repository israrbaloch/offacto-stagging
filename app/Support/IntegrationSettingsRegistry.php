<?php

namespace App\Support;

final class IntegrationSettingsRegistry
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
                'href' => '/admin/integrations/'.$id,
            ],
            array_keys(self::definitions()),
            self::definitions(),
        );

        $ops = array_map(
            fn (array $row) => [...$row, 'kind' => 'operation', 'href' => '/admin/integrations/operations/'.$row['id']],
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
            ['id' => 'webhooks', 'group' => 'API & webhooks', 'title' => 'Webhook management', 'description' => 'Outbound webhook endpoints, events, signatures, and delivery history.'],
            ['id' => 'api-keys', 'group' => 'API & webhooks', 'title' => 'API key management', 'description' => 'Create, scope, rotate, and revoke platform API credentials.'],
            ['id' => 'health-checks', 'group' => 'Monitoring', 'title' => 'Integration health checks', 'description' => 'Connectivity tests without exposing secrets.'],
            ['id' => 'failure-queue', 'group' => 'Monitoring', 'title' => 'Integration failure queue', 'description' => 'Failed payments, postal, Peppol, email, and webhook jobs.'],
            ['id' => 'provider-registry', 'group' => 'Governance', 'title' => 'Third-party provider registry', 'description' => 'Providers, data access, purposes, and compliance links.'],
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
            'credentials-secrets' => [
                'group' => 'Security',
                'title' => 'Credentials & secrets',
                'description' => 'Platform credentials live in site settings; company Mollie/Postbode keys are encrypted on company_settings.',
                'fields' => [
                    ['key' => 'int_credentials_admin_only', 'type' => 'boolean', 'label' => 'Only platform admins may view integration settings', 'default' => true],
                    ['key' => 'int_credentials_rotate_reminder_days', 'type' => 'integer', 'label' => 'Remind to rotate platform keys after (days)', 'default' => 180, 'min' => 30],
                    ['key' => 'int_company_key_policy', 'type' => 'textarea', 'label' => 'Company credential policy (internal)', 'default' => 'Companies manage their own Mollie and Postbode tokens under Settings → Integrations. Platform staff must not copy company secrets into tickets.'],
                ],
            ],
            'environment-management' => [
                'group' => 'Environments',
                'title' => 'Environment management',
                'description' => 'Separate test and live behavior; reduce accidental production charges or sends.',
                'fields' => [
                    ['key' => 'payment_mollie_mode', 'type' => 'select', 'label' => 'Platform Mollie mode', 'default' => 'test', 'options' => ['test', 'live']],
                    ['key' => 'int_block_live_company_in_test', 'type' => 'boolean', 'label' => 'Block live company integrations when platform is in test', 'default' => true],
                    ['key' => 'int_show_test_banner', 'type' => 'boolean', 'label' => 'Show test-mode banner in admin', 'default' => true],
                    ['key' => 'int_prevent_peppol_live_in_local', 'type' => 'boolean', 'label' => 'Block Peppol send when APP_ENV is local', 'default' => true],
                ],
            ],
            'mollie-administration' => [
                'group' => 'Providers',
                'title' => 'Mollie administration',
                'description' => 'Subscription checkout payments and webhook reconciliation (shared keys with Settings → Payment gateway).',
                'fields' => [
                    ['key' => 'payment_gateway', 'type' => 'select', 'label' => 'Gateway', 'default' => 'mollie', 'options' => ['mollie', 'none']],
                    ['key' => 'payment_mollie_mode', 'type' => 'select', 'label' => 'Mode', 'default' => 'test', 'options' => ['test', 'live']],
                    ['key' => 'payment_mollie_test_key', 'type' => 'password', 'label' => 'Test API key', 'default' => '', 'optional' => true],
                    ['key' => 'payment_mollie_live_key', 'type' => 'password', 'label' => 'Live API key', 'default' => '', 'optional' => true],
                    ['key' => 'int_mollie_webhook_override', 'type' => 'string', 'label' => 'Webhook URL override (optional)', 'default' => '', 'hint' => 'Falls back to MOLLIE_WEBHOOK_URL env when empty.'],
                    ['key' => 'int_mollie_auto_reconcile', 'type' => 'boolean', 'label' => 'Log webhook reconciliation events to activity log', 'default' => true],
                ],
            ],
            'peppol-administration' => [
                'group' => 'Providers',
                'title' => 'Peppol administration',
                'description' => 'Platform access point defaults (env vars used when site settings empty).',
                'fields' => [
                    ['key' => 'int_peppol_endpoint', 'type' => 'string', 'label' => 'Access point URL', 'default' => ''],
                    ['key' => 'int_peppol_token', 'type' => 'password', 'label' => 'Access point token', 'default' => '', 'optional' => true],
                    ['key' => 'int_peppol_formats', 'type' => 'structured', 'widget' => 'peppol_formats', 'label' => 'Supported formats', 'default' => ['ubl_bis3' => true, 'cen16931' => true]],
                    ['key' => 'int_peppol_monitor_failures', 'type' => 'boolean', 'label' => 'Record transmission failures in failure queue', 'default' => true],
                ],
            ],
            'postbode-administration' => [
                'group' => 'Providers',
                'title' => 'Postbode administration',
                'description' => 'Platform defaults; each company configures mailbox, envelope, and tokens.',
                'fields' => [
                    ['key' => 'int_postbode_v2_base', 'type' => 'string', 'label' => 'API v2 base URL', 'default' => 'https://postbode.app/api/v2'],
                    ['key' => 'int_postbode_default_country', 'type' => 'string', 'label' => 'Default country (new companies)', 'default' => 'BE', 'max' => 2],
                    ['key' => 'int_postbode_default_registered', 'type' => 'boolean', 'label' => 'Default registered mail opt-in', 'default' => false],
                    ['key' => 'int_postbode_default_api_version', 'type' => 'select', 'label' => 'Default API version', 'default' => 'v2', 'options' => ['v1', 'v2']],
                ],
            ],
            'email-provider' => [
                'group' => 'Providers',
                'title' => 'Email provider settings',
                'description' => 'Platform mail identity; production should use a transactional provider.',
                'fields' => [
                    ['key' => 'int_mail_driver', 'type' => 'select', 'label' => 'Driver', 'default' => 'smtp', 'options' => ['smtp', 'postmark', 'resend', 'ses', 'log']],
                    ['key' => 'int_mail_from_address', 'type' => 'string', 'label' => 'Default from address', 'default' => ''],
                    ['key' => 'int_mail_from_name', 'type' => 'string', 'label' => 'Default from name', 'default' => 'Offacto'],
                    ['key' => 'int_mail_reply_to', 'type' => 'string', 'label' => 'Default reply-to', 'default' => ''],
                    ['key' => 'int_smtp_password', 'type' => 'password', 'label' => 'SMTP / provider API secret', 'default' => '', 'optional' => true],
                ],
            ],
            'whatsapp-policies' => [
                'group' => 'Messaging',
                'title' => 'WhatsApp sharing policies',
                'description' => 'User-initiated share links only — not WhatsApp Business API delivery.',
                'fields' => [
                    ['key' => 'int_whatsapp_share_enabled', 'type' => 'boolean', 'label' => 'Allow WhatsApp share action on invoices', 'default' => true],
                    ['key' => 'int_whatsapp_api_delivery', 'type' => 'boolean', 'label' => 'Enable API-based WhatsApp delivery', 'default' => false],
                    ['key' => 'int_whatsapp_templates', 'type' => 'structured', 'widget' => 'whatsapp_templates', 'label' => 'Share message templates', 'default' => [
                        'invoice' => 'Here is your invoice {{number}} from {{company}}: {{link}}',
                        'quotation' => 'Your quotation {{number}} from {{company}}: {{link}}',
                    ]],
                ],
            ],
            'api-rate-limits' => [
                'group' => 'API & webhooks',
                'title' => 'API rate limits',
                'description' => 'Per-client limits for platform API keys (when enforced at gateway).',
                'fields' => [
                    ['key' => 'int_api_rate_per_minute', 'type' => 'integer', 'label' => 'Requests per minute', 'default' => 120, 'min' => 10],
                    ['key' => 'int_api_burst', 'type' => 'integer', 'label' => 'Burst allowance', 'default' => 30, 'min' => 0],
                    ['key' => 'int_api_daily_quota', 'type' => 'integer', 'label' => 'Daily quota per key (0 = unlimited)', 'default' => 10000, 'min' => 0],
                ],
            ],
            'retry-policies' => [
                'group' => 'Reliability',
                'title' => 'Integration retry policies',
                'description' => 'Backoff, idempotency, and duplicate prevention defaults.',
                'fields' => [
                    ['key' => 'int_retry_policies', 'type' => 'structured', 'widget' => 'retry_policies', 'label' => 'Provider retries', 'default' => [
                        'mollie_webhook' => ['max' => 5, 'backoff_minutes' => 15],
                        'postbode' => ['max' => 3, 'backoff_minutes' => 60],
                        'peppol' => ['max' => 3, 'backoff_minutes' => 30],
                        'outbound_webhook' => ['max' => 5, 'backoff_minutes' => 10],
                    ]],
                    ['key' => 'int_retry_idempotency_keys', 'type' => 'boolean', 'label' => 'Require idempotency keys for retried payment operations', 'default' => true],
                ],
            ],
        ];
    }
}
