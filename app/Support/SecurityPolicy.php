<?php

namespace App\Support;

use App\Models\SecurityPolicyException;
use App\Models\SiteSetting;

final class SecurityPolicy
{
    public static function passwordMinLength(): int
    {
        return max(8, SiteSetting::getInteger('sec_password_min_length', 12));
    }

    public static function rateLimitFor(string $endpoint): int
    {
        $raw = SiteSetting::get('sec_rate_limits', null);
        $map = is_string($raw) ? json_decode($raw, true) : $raw;
        if (! is_array($map)) {
            $map = (array) (SecuritySettingsRegistry::definition('rate-limiting')['fields'][0]['default'] ?? []);
        }

        return max(1, (int) ($map[$endpoint] ?? 60));
    }

    public static function actionRequiresConfirm(string $action): bool
    {
        $raw = SiteSetting::get('sec_privileged_confirm_actions', null);
        $map = is_string($raw) ? json_decode($raw, true) : $raw;
        if (! is_array($map)) {
            return true;
        }

        return (bool) ($map[$action] ?? false);
    }

    public static function hasActiveException(string $policyKey): bool
    {
        return SecurityPolicyException::query()
            ->where('policy_key', $policyKey)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->exists();
    }
}
