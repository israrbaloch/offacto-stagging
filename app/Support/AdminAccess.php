<?php

namespace App\Support;

use App\Models\Role;
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
        if (! $user) {
            abort(403, 'You do not have permission to perform this action.');
        }

        if ($user->hasRole('admin')) {
            return;
        }

        if (! $user->hasAnyPermission($anyOf)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }

    /**
     * @return list<string>
     */
    public static function roleNamesForPermissions(array $permissionNames): array
    {
        $permissionNames = array_values(array_intersect($permissionNames, self::all()));
        $roles = [];

        foreach (self::specialistRoles() as $roleName => $permissions) {
            foreach ($permissionNames as $name) {
                if (in_array($name, $permissions, true)) {
                    $roles[] = $roleName;
                }
            }
        }

        return array_values(array_unique($roles));
    }

    /**
     * @return list<int>
     */
    public static function roleIdsForPlatformAccess(string $platformAccess, array $adminPermissions = []): array
    {
        if ($platformAccess === 'full') {
            $admin = Role::query()->where('name', 'admin')->first();

            return $admin ? [$admin->id] : [];
        }

        if ($platformAccess !== 'specialist') {
            return [];
        }

        $names = self::roleNamesForPermissions($adminPermissions);
        if ($names === []) {
            return [];
        }

        return Role::query()->whereIn('name', $names)->pluck('id')->all();
    }

    /**
     * @return array<string, array{label: string, description: string, permissions: list<string>}>
     */
    public static function presets(): array
    {
        return [
            'support' => [
                'label' => 'Support',
                'description' => 'Tickets, support hub, and company directory (with compliance).',
                'permissions' => [self::SUPPORT],
            ],
            'billing' => [
                'label' => 'Billing',
                'description' => 'Subscriptions, plans, coupons, and financial document settings.',
                'permissions' => [self::BILLING],
            ],
            'compliance' => [
                'label' => 'Compliance',
                'description' => 'Legal holds, compliance hub, and company approvals.',
                'permissions' => [self::COMPLIANCE],
            ],
            'security' => [
                'label' => 'Security & users',
                'description' => 'User directory, security hub, fraud queue, and audit logs.',
                'permissions' => [self::SECURITY],
            ],
            'settings' => [
                'label' => 'Platform settings',
                'description' => 'Integrations, communications, and product content.',
                'permissions' => [self::SETTINGS],
            ],
            'governance' => [
                'label' => 'Governance & infra',
                'description' => 'Infrastructure, governance, and destructive platform operations.',
                'permissions' => [self::GOVERNANCE],
            ],
        ];
    }
}
