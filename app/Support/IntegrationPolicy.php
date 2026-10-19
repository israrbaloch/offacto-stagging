<?php

namespace App\Support;

use App\Models\SiteSetting;

final class IntegrationPolicy
{
    public static function platformMollieMode(): string
    {
        $mode = SiteSetting::get('payment_mollie_mode', 'test');

        return $mode === 'live' ? 'live' : 'test';
    }

    public static function blockLiveCompanyInTest(): bool
    {
        return SiteSetting::getBoolean('int_block_live_company_in_test', true);
    }

    public static function apiRatePerMinute(): int
    {
        return max(10, SiteSetting::getInteger('int_api_rate_per_minute', 120));
    }

    public static function whatsappShareEnabled(): bool
    {
        return SiteSetting::getBoolean('int_whatsapp_share_enabled', true);
    }

    public static function peppolEndpoint(): ?string
    {
        return SiteSetting::get('int_peppol_endpoint') ?: config('services.peppol.endpoint') ?: null;
    }

    public static function peppolToken(): ?string
    {
        return SiteSetting::get('int_peppol_token') ?: config('services.peppol.token') ?: null;
    }
}
