<?php

namespace App\Support;

use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\User;
use App\Services\WhatsAppApiService;

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

    public static function mollieEnabled(?Company $company): bool
    {
        $settings = self::settings($company);

        return $settings && ($settings->mollie_enabled ?? true);
    }

    public static function postbodeEnabled(?Company $company): bool
    {
        $settings = self::settings($company);

        return $settings && ($settings->postbode_enabled ?? true);
    }

    public static function peppolEnabled(?Company $company): bool
    {
        $settings = self::settings($company);

        return $settings && ($settings->peppol_enabled ?? false);
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
        if (! self::mollieEnabled($company)) {
            return false;
        }

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
        if (! self::postbodeEnabled($company)) {
            return false;
        }

        $settings = self::settings($company);
        if (! $settings || ! filled(self::postbodeToken($settings))) {
            return false;
        }

        if ($settings->postbode_api_version === 'v1') {
            return filled($settings->postbode_v1_mailbox_id);
        }

        return filled($settings->postbode_mailbox_code) && filled($settings->postbode_envelope_uuid);
    }

    public static function peppolEndpoint(CompanySetting $settings): ?string
    {
        $mode = self::mode($settings);
        $companyEndpoint = $mode === 'live'
            ? ($settings->peppol_live_endpoint ?: null)
            : ($settings->peppol_test_endpoint ?: $settings->peppol_live_endpoint);

        return filled($companyEndpoint) ? $companyEndpoint : IntegrationPolicy::peppolEndpoint();
    }

    public static function peppolToken(CompanySetting $settings): ?string
    {
        $mode = self::mode($settings);
        $companyToken = $mode === 'live'
            ? ($settings->peppol_live_token ?: null)
            : ($settings->peppol_test_token ?: $settings->peppol_live_token);

        return filled($companyToken) ? $companyToken : IntegrationPolicy::peppolToken();
    }

    public static function peppolConfigured(?Company $company): bool
    {
        if (! self::peppolEnabled($company)) {
            return false;
        }

        $settings = self::settings($company);
        if (! $settings) {
            return false;
        }

        return filled(self::peppolEndpoint($settings)) && filled(self::peppolToken($settings));
    }

    public static function whatsappEnabled(?Company $company): bool
    {
        $settings = self::settings($company);

        return $settings && ($settings->whatsapp_enabled ?? true);
    }

    public static function whatsappShareConfigured(?Company $company): bool
    {
        return WhatsAppShare::shareConfigured($company);
    }

    public static function whatsappApiConfigured(?Company $company): bool
    {
        return app(WhatsAppApiService::class)->canSend($company);
    }

    public static function whatsappConfigured(?Company $company, ?User $user = null): bool
    {
        return self::whatsappAvailable($user, $company);
    }

    public static function whatsappAvailable(?User $user, ?Company $company): bool
    {
        if (! self::whatsappEnabled($company)) {
            return false;
        }

        if ($user && PlanEntitlements::blockCapabilityReason($user, $company, 'integrations.whatsapp')) {
            return false;
        }

        return self::whatsappShareConfigured($company) || self::whatsappApiConfigured($company);
    }

    public static function creditsafeEnabled(?Company $company): bool
    {
        $settings = self::settings($company);

        return $settings && ($settings->creditsafe_enabled ?? false);
    }

    public static function creditsafeApiKey(?CompanySetting $settings): ?string
    {
        if (! $settings) {
            return null;
        }

        $mode = self::mode($settings);

        return $mode === 'live'
            ? ($settings->creditsafe_live_api_key ?: null)
            : ($settings->creditsafe_test_api_key ?: $settings->creditsafe_live_api_key);
    }

    public static function creditsafeConfigured(?Company $company): bool
    {
        if (! IntegrationPolicy::creditsafeEnabled()) {
            return false;
        }

        if (! self::creditsafeEnabled($company)) {
            return false;
        }

        $settings = self::settings($company);

        return $settings && filled(self::creditsafeApiKey($settings));
    }

    /**
     * @return array<string, mixed>
     */
    public static function postbodeFormDefaults(?CompanySetting $settings, ?Company $company = null): array
    {
        $company = $company ?? $settings?->company;

        return [
            'integrations_mode' => $settings?->integrations_mode ?? 'test',
            'mollie_enabled' => (bool) ($settings?->mollie_enabled ?? true),
            'postbode_enabled' => (bool) ($settings?->postbode_enabled ?? true),
            'peppol_enabled' => (bool) ($settings?->peppol_enabled ?? false),
            'peppol_test_endpoint' => $settings?->peppol_test_endpoint ?? '',
            'peppol_live_endpoint' => $settings?->peppol_live_endpoint ?? '',
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
            'peppol_test_token_set' => filled($settings?->peppol_test_token),
            'peppol_live_token_set' => filled($settings?->peppol_live_token),
            'peppol_platform_fallback' => filled(IntegrationPolicy::peppolEndpoint()) && filled(IntegrationPolicy::peppolToken()),
            'postbode_configured' => $company ? self::postbodeConfigured($company) : false,
            'mollie_configured' => $company ? self::mollieConfigured($company) : false,
            'peppol_configured' => $company ? self::peppolConfigured($company) : false,
            'whatsapp_enabled' => (bool) ($settings?->whatsapp_enabled ?? true),
            'whatsapp_use_customer_phone' => (bool) ($settings?->whatsapp_use_customer_phone ?? true),
            'whatsapp_business_phone' => $settings?->whatsapp_business_phone ?? '',
            'whatsapp_invoice_template' => $settings?->whatsapp_invoice_template ?? '',
            'whatsapp_quotation_template' => $settings?->whatsapp_quotation_template ?? '',
            'whatsapp_api_enabled' => (bool) ($settings?->whatsapp_api_enabled ?? false),
            'whatsapp_api_phone_number_id' => $settings?->whatsapp_api_phone_number_id ?? '',
            'whatsapp_api_access_token_set' => filled($settings?->whatsapp_api_access_token),
            'whatsapp_api_platform_allowed' => IntegrationPolicy::whatsappApiDeliveryEnabled(),
            'whatsapp_share_configured' => $company ? self::whatsappShareConfigured($company) : false,
            'whatsapp_api_configured' => $company ? self::whatsappApiConfigured($company) : false,
            'whatsapp_configured' => $company ? self::whatsappConfigured($company) : false,
            'creditsafe_enabled' => (bool) ($settings?->creditsafe_enabled ?? false),
            'creditsafe_test_api_key_set' => filled($settings?->creditsafe_test_api_key),
            'creditsafe_live_api_key_set' => filled($settings?->creditsafe_live_api_key),
            'creditsafe_configured' => $company ? self::creditsafeConfigured($company) : false,
            'creditsafe_platform_enabled' => IntegrationPolicy::creditsafeEnabled(),
        ];
    }
}
