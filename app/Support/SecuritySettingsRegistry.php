<?php

namespace App\Support;

final class SecuritySettingsRegistry
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
                'href' => '/admin/security/'.$id,
            ],
            array_keys(self::definitions()),
            self::definitions(),
        );

        $ops = array_map(
            fn (array $row) => [...$row, 'kind' => 'operation', 'href' => '/admin/security/operations/'.$row['id']],
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
            ['id' => 'suspicious-activity', 'group' => 'Monitoring', 'title' => 'Suspicious activity monitor', 'description' => 'Unusual logins, exports, privilege changes, and payment signals.'],
            ['id' => 'account-risk', 'group' => 'Response', 'title' => 'Account risk & restrictions', 'description' => 'Documented reviews, temporary limits, and authorized suspensions.'],
            ['id' => 'fraud-queue', 'group' => 'Fraud', 'title' => 'Fraud review queue', 'description' => 'Registrations, payments, refunds, and abuse reports.'],
            ['id' => 'secret-rotation', 'group' => 'Secrets', 'title' => 'Secret rotation management', 'description' => 'Plan and record credential rotations.'],
            ['id' => 'security-audit-log', 'group' => 'Audit', 'title' => 'Security audit log', 'description' => 'Security events, privileged actions, and access decisions.'],
            ['id' => 'vulnerability-management', 'group' => 'Posture', 'title' => 'Vulnerability management', 'description' => 'Dependency advisories and remediation tracking.'],
            ['id' => 'security-incidents', 'group' => 'Incidents', 'title' => 'Security incident response', 'description' => 'Severity, containment, evidence, and recovery.'],
            ['id' => 'policy-exceptions', 'group' => 'Governance', 'title' => 'Security policy exceptions', 'description' => 'Temporary approved exceptions with expiry.'],
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
            'security-policy-center' => [
                'group' => 'Policies',
                'title' => 'Security policy center',
                'description' => 'Password, session, MFA, and privileged-access baseline.',
                'fields' => [
                    ['key' => 'sec_password_min_length', 'type' => 'integer', 'label' => 'Minimum password length', 'default' => 12, 'min' => 8],
                    ['key' => 'sec_password_require_mixed', 'type' => 'boolean', 'label' => 'Require letters and numbers', 'default' => true],
                    ['key' => 'sec_session_lifetime_minutes', 'type' => 'integer', 'label' => 'Session lifetime (minutes)', 'default' => 120, 'min' => 15],
                    ['key' => 'sec_mfa_required_admin', 'type' => 'boolean', 'label' => 'Require MFA for platform admins (when available)', 'default' => false],
                    ['key' => 'sec_privileged_actions_logged', 'type' => 'boolean', 'label' => 'Log all privileged admin actions', 'default' => true],
                ],
            ],
            'rate-limiting' => [
                'group' => 'Policies',
                'title' => 'Rate limiting & abuse protection',
                'description' => 'Platform defaults; route middleware may use these targets over time.',
                'fields' => [
                    ['key' => 'sec_rate_limits', 'type' => 'structured', 'widget' => 'rate_limits', 'label' => 'Endpoint limits (per minute)', 'default' => [
                        'login' => 10,
                        'register' => 10,
                        'password_reset' => 6,
                        'public_quote' => 30,
                        'briefing_form' => 20,
                    ]],
                    ['key' => 'sec_block_tor_vpn', 'type' => 'boolean', 'label' => 'Flag logins from known anonymizer ranges (log only)', 'default' => false],
                ],
            ],
            'file-upload-security' => [
                'group' => 'Policies',
                'title' => 'File upload security',
                'description' => 'Limits for attachments, logos, and briefing uploads.',
                'fields' => [
                    ['key' => 'sec_upload_max_mb', 'type' => 'integer', 'label' => 'Max file size (MB)', 'default' => 10, 'min' => 1],
                    ['key' => 'sec_upload_allowed_mimes', 'type' => 'structured', 'widget' => 'upload_mimes', 'label' => 'Allowed MIME groups', 'default' => [
                        'images' => true, 'pdf' => true, 'office' => false, 'audio' => true,
                    ]],
                    ['key' => 'sec_upload_scan_malware', 'type' => 'boolean', 'label' => 'Scan uploads when AV integration is configured', 'default' => false],
                    ['key' => 'sec_sensitive_attachments_admin_only', 'type' => 'boolean', 'label' => 'Restrict voice/signature downloads to authorized roles', 'default' => true],
                ],
            ],
            'encryption-keys' => [
                'group' => 'Cryptography',
                'title' => 'Encryption & key management',
                'description' => 'Laravel APP_KEY and encrypted columns; document rotation procedures.',
                'fields' => [
                    ['key' => 'sec_app_key_rotation_months', 'type' => 'integer', 'label' => 'Review APP_KEY rotation every (months)', 'default' => 12, 'min' => 6],
                    ['key' => 'sec_encrypt_company_secrets', 'type' => 'boolean', 'label' => 'Company integration secrets use encrypted casts', 'default' => true],
                    ['key' => 'sec_encryption_notes', 'type' => 'textarea', 'label' => 'Internal key custody notes', 'default' => 'APP_KEY is managed at deploy time. Company Mollie/Postbode keys use Laravel encrypted casts.'],
                ],
            ],
            'privileged-actions' => [
                'group' => 'Controls',
                'title' => 'Privileged action controls',
                'description' => 'High-impact operations requiring confirmation or re-auth when enforced.',
                'fields' => [
                    ['key' => 'sec_privileged_confirm_actions', 'type' => 'structured', 'widget' => 'privileged_actions', 'label' => 'Actions requiring confirmation', 'default' => [
                        'permanent_delete' => true,
                        'bulk_export' => true,
                        'refund_issue' => true,
                        'credential_change' => true,
                        'company_suspend' => true,
                    ]],
                    ['key' => 'sec_reauth_minutes', 'type' => 'integer', 'label' => 'Re-auth valid for (minutes) after password confirm', 'default' => 15, 'min' => 5],
                ],
            ],
            'separation-of-duties' => [
                'group' => 'Controls',
                'title' => 'Separation of duties',
                'description' => 'Independent approver for sensitive financial and security operations.',
                'fields' => [
                    ['key' => 'sec_sod_rules', 'type' => 'structured', 'widget' => 'sod_rules', 'label' => 'SoD rules', 'default' => [
                        ['action' => 'subscription_adjustment', 'require_second_admin' => true],
                        ['action' => 'disclosure_approval', 'require_second_admin' => true],
                        ['action' => 'deletion_job_approve', 'require_second_admin' => true],
                    ]],
                ],
            ],
        ];
    }
}
