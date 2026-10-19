<?php

namespace App\Support;

use App\Models\SiteSetting;

final class SupportSettings
{
    public static function customerPortalEnabled(): bool
    {
        return SiteSetting::getBoolean('sup_customer_portal_enabled', true);
    }
}
