<?php

namespace App\Support;

use App\Models\SiteSetting;

final class InfrastructurePolicy
{
    public static function attachmentTempDays(): int
    {
        return max(1, SiteSetting::getInteger('infra_attach_temp_days', 7));
    }

    public static function restoreTestIntervalDays(): int
    {
        return max(30, SiteSetting::getInteger('infra_restore_test_days', 90));
    }

    public static function rpoHours(): int
    {
        return max(1, SiteSetting::getInteger('infra_rpo_hours', 24));
    }

    public static function rtoHours(): int
    {
        return max(1, SiteSetting::getInteger('infra_rto_hours', 4));
    }
}
