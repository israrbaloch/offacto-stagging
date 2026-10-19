<?php

namespace App\Support;

use App\Models\SiteSetting;

class AdminBillingSettings
{
    /**
     * @return array<string, mixed>
     */
    public static function all(): array
    {
        return [
            'trial_duration_days' => SiteSetting::getInteger('trial_duration_days', 14),
            'subscription_reminder_days' => SiteSetting::getInteger('subscription_reminder_days', 7),
            'dunning_grace_days' => SiteSetting::getInteger('dunning_grace_days', 7),
            'dunning_max_retries' => SiteSetting::getInteger('dunning_max_retries', 3),
            'platform_default_currency' => strtoupper(SiteSetting::get('platform_default_currency', 'EUR')),
            'supported_currencies' => self::currencies(),
            'notifications' => [
                'trial_expiry' => SiteSetting::getBoolean('billing_notify_trial_expiry', true),
                'renewal' => SiteSetting::getBoolean('billing_notify_renewal', true),
                'failed_payment' => SiteSetting::getBoolean('billing_notify_failed_payment', true),
                'cancellation' => SiteSetting::getBoolean('billing_notify_cancellation', true),
                'subscription_confirmation' => SiteSetting::getBoolean('billing_notify_subscription_confirmation', true),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function persist(array $data): void
    {
        SiteSetting::set('trial_duration_days', (string) $data['trial_duration_days'], 'integer');
        SiteSetting::set('subscription_reminder_days', (string) $data['subscription_reminder_days'], 'integer');
        SiteSetting::set('dunning_grace_days', (string) $data['dunning_grace_days'], 'integer');
        SiteSetting::set('dunning_max_retries', (string) $data['dunning_max_retries'], 'integer');
        SiteSetting::set('platform_default_currency', strtoupper($data['platform_default_currency']));

        foreach ($data['notifications'] as $key => $enabled) {
            SiteSetting::set('billing_notify_'.$key, $enabled ? '1' : '0', 'boolean');
        }

        SiteSetting::clearCache();
    }

    /**
     * @return list<string>
     */
    public static function currencies(): array
    {
        $raw = SiteSetting::get('billing_supported_currencies', 'EUR,USD,GBP');
        $parts = array_filter(array_map('trim', explode(',', strtoupper($raw))));

        return $parts !== [] ? array_values($parts) : ['EUR', 'USD', 'GBP'];
    }
}
