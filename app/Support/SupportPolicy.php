<?php

namespace App\Support;

use App\Models\SiteSetting;

final class SupportPolicy
{
    public static function slaHoursForPriority(string $priority): int
    {
        $raw = SiteSetting::get('sup_sla_first_response_hours', null);
        $map = is_string($raw) ? json_decode($raw, true) : $raw;
        if (! is_array($map)) {
            $map = (array) (SupportSettingsRegistry::definition('sla-policies')['fields'][0]['default'] ?? []);
        }

        return max(1, (int) ($map[$priority] ?? $map['normal'] ?? 24));
    }

    public static function accessApprovalRequired(): bool
    {
        return SiteSetting::getBoolean('sup_require_access_approval', true);
    }
}
