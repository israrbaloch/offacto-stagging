<?php

namespace App\Support;

use App\Models\SiteSetting;

/**
 * Platform compliance settings for runtime checks (retention, exports, authority workflow).
 */
final class CompliancePolicy
{
    public static function defaultJurisdiction(): string
    {
        return SiteSetting::get('comp_platform_default_jurisdiction', 'BE');
    }

    public static function invoiceRetentionYears(): int
    {
        return max(1, SiteSetting::getInteger('comp_retention_invoices_years', 7));
    }

    public static function exportRequiresDualConfirm(): bool
    {
        return SiteSetting::getBoolean('comp_export_require_dual_confirm', true);
    }

    public static function emergencyDisclosureEnabled(): bool
    {
        return SiteSetting::getBoolean('comp_emergency_enabled', true);
    }
}
