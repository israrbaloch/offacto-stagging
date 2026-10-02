<?php

namespace App\Support;

use App\Models\Company;
use App\Models\CompanySetting;

class CompanyIntegrations
{
    public static function settings(?Company $company): ?CompanySetting
    {
        if (! $company) {
            return null;
        }

        $settings = $company->companySetting;
        if (! $settings) {
            $company->ensureDefaults();
            $settings = $company->fresh()?->companySetting;
        }

        return $settings;
    }

    public static function mode(CompanySetting $settings): string
    {
        return in_array($settings->integrations_mode, ['test', 'live'], true)
            ? $settings->integrations_mode
            : 'test';
    }

    public static function mollieApiKey(CompanySetting $settings): ?string
    {
        $mode = self::mode($settings);

        return $mode === 'live'
            ? ($settings->mollie_live_key ?: null)
            : ($settings->mollie_test_key ?: $settings->mollie_live_key);
    }

    public static function mollieConfigured(?Company $company): bool
    {
        $settings = self::settings($company);

        return $settings && filled(self::mollieApiKey($settings));
    }

    public static function postbodeToken(CompanySetting $settings): ?string
    {
        $mode = self::mode($settings);

        return $mode === 'live'
            ? ($settings->postbode_live_token ?: null)
            : ($settings->postbode_test_token ?: $settings->postbode_live_token);
    }

    public static function postbodeConfigured(?Company $company): bool
    {
        $settings = self::settings($company);
        if (! $settings || ! filled(self::postbodeToken($settings))) {
            return false;
        }

        if ($settings->postbode_api_version === 'v1') {
            return filled($settings->postbode_v1_mailbox_id);
        }

        return filled($settings->postbode_mailbox_code) && filled($settings->postbode_envelope_uuid);
    }

    /**
     * @return array<string, mixed>
     */
    public static function postbodeFormDefaults(?CompanySetting $settings): array
    {
        return [
            'integrations_mode' => $settings?->integrations_mode ?? 'test',
            'postbode_mailbox_code' => $settings?->postbode_mailbox_code ?? '',
            'postbode_envelope_uuid' => $settings?->postbode_envelope_uuid ?? '',
            'postbode_v1_mailbox_id' => $settings?->postbode_v1_mailbox_id ?? '',
            'postbode_v1_envelope_id' => $settings?->postbode_v1_envelope_id ?? 2,
            'postbode_default_country' => $settings?->postbode_default_country ?? 'NL',
            'postbode_registered' => (bool) ($settings?->postbode_registered ?? false),
            'postbode_send_immediately' => (bool) ($settings?->postbode_send_immediately ?? true),
            'postbode_api_version' => $settings?->postbode_api_version ?? 'v2',
            'mollie_test_key_set' => filled($settings?->mollie_test_key),
            'mollie_live_key_set' => filled($settings?->mollie_live_key),
            'postbode_test_token_set' => filled($settings?->postbode_test_token),
            'postbode_live_token_set' => filled($settings?->postbode_live_token),
            'postbode_configured' => $settings ? self::postbodeConfigured($settings->company) : false,
            'mollie_configured' => $settings ? filled(self::mollieApiKey($settings)) : false,
        ];
    }
}
