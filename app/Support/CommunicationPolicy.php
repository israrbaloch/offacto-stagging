<?php

namespace App\Support;

use App\Models\CommunicationSuppression;
use App\Models\SiteSetting;

final class CommunicationPolicy
{
    public static function shouldValidateMergeCodes(): bool
    {
        return SiteSetting::getBoolean('comm_validate_merge_codes', true);
    }

    public static function isMarketingSuppressed(string $email): bool
    {
        if (! SiteSetting::getBoolean('comm_honor_unsubscribe', true)) {
            return false;
        }

        $hash = CommunicationSuppression::hashEmail($email);

        return CommunicationSuppression::query()
            ->where('email_hash', $hash)
            ->whereIn('reason', ['unsubscribe', 'bounce'])
            ->exists();
    }

    public static function scheduledJobsEnabled(): bool
    {
        return SiteSetting::getBoolean('comm_scheduled_enabled', true);
    }
}
