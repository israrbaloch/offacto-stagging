<?php

namespace App\Support;

use App\Models\SiteSetting;

final class GovernancePolicy
{
    public static function environmentLabel(): string
    {
        return SiteSetting::get('gov_environment_label', config('app.env', 'production'));
    }

    public static function isProductionEnvironment(): bool
    {
        return app()->environment('production');
    }

    public static function blockDestructiveInProduction(): bool
    {
        return SiteSetting::getBoolean('gov_block_destructive_in_production', true);
    }

    public static function bulkRequiresDualConfirm(): bool
    {
        return SiteSetting::getBoolean('gov_bulk_dual_confirm', true);
    }

    public static function exportExpiryDays(): int
    {
        return max(1, SiteSetting::getInteger('gov_export_expiry_days', 7));
    }

    public static function assertOperationalMutationAllowed(): void
    {
        if (self::isProductionEnvironment() && self::blockDestructiveInProduction()) {
            abort(403, 'Destructive operations are blocked in the production environment.');
        }
    }
}
