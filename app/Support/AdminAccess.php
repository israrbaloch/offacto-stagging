<?php

namespace App\Support;

use App\Models\User;

final class AdminAccess
{
    public const SUPPORT = 'admin.support';

    public const BILLING = 'admin.billing';

    public const COMPLIANCE = 'admin.compliance';

    public const SECURITY = 'admin.security';

    public const SETTINGS = 'admin.settings';

    public const GOVERNANCE = 'admin.governance';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::SUPPORT,
            self::BILLING,
            self::COMPLIANCE,
            self::SECURITY,
            self::SETTINGS,
            self::GOVERNANCE,
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function labels(): array
    {
        return [
            self::SUPPORT => 'Support and company workspace',
            self::BILLING => 'Billing and subscriptions',
            self::COMPLIANCE => 'Compliance and legal holds',
            self::SECURITY => 'Security and user administration',
            self::SETTINGS => 'Platform settings and integrations',
            self::GOVERNANCE => 'Governance, infrastructure, and destructive operations',
        ];
    }

    /**
     * Optional specialist roles. Not assigned to existing users.
     *
     * @return array<string, list<string>>
     */
    public static function specialistRoles(): array
    {
        return [
            'admin_support' => [self::SUPPORT],
            'admin_billing' => [self::BILLING],
            'admin_compliance' => [self::COMPLIANCE],
            'admin_security' => [self::SECURITY],
            'admin_settings' => [self::SETTINGS],
            'admin_governance' => [self::GOVERNANCE],
        ];
    }

    public static function canAccessAdminArea(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole('admin') || $user->hasAnyPermission(self::all());
    }

    public static function assert(?User $user, string ...$anyOf): void
    {
        if (! $user || ! $user->hasAnyPermission($anyOf)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }
}
