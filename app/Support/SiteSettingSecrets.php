<?php

namespace App\Support;

use App\Support\CommunicationSettingsRegistry;
use App\Support\ComplianceSettingsRegistry;
use App\Support\FinancialDocumentSettingsRegistry;
use App\Support\GovernanceSettingsRegistry;
use App\Support\InfrastructureSettingsRegistry;
use App\Support\IntegrationSettingsRegistry;
use App\Support\PlatformSettingsRegistry;
use App\Support\ProductSettingsRegistry;
use App\Support\SecuritySettingsRegistry;
use App\Support\SupportSettingsRegistry;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

final class SiteSettingSecrets
{
    public const PREFIX = 'enc::v1:';

    /**
     * Keys stored encrypted at rest. Password-type registry fields plus known API tokens.
     *
     * @return list<string>
     */
    public static function keys(): array
    {
        $keys = [];
        foreach ([
            PlatformSettingsRegistry::class,
            IntegrationSettingsRegistry::class,
            CommunicationSettingsRegistry::class,
            SecuritySettingsRegistry::class,
            GovernanceSettingsRegistry::class,
            InfrastructureSettingsRegistry::class,
            ProductSettingsRegistry::class,
            SupportSettingsRegistry::class,
            ComplianceSettingsRegistry::class,
            FinancialDocumentSettingsRegistry::class,
        ] as $registry) {
            if (! class_exists($registry) || ! method_exists($registry, 'definitions')) {
                continue;
            }
            foreach ($registry::definitions() as $def) {
                foreach ($def['fields'] ?? [] as $field) {
                    if (($field['type'] ?? '') === 'password' && isset($field['key'])) {
                        $keys[] = $field['key'];
                    }
                }
            }
        }

        return array_values(array_unique($keys));
    }

    public static function isSensitive(string $key): bool
    {
        return in_array($key, self::keys(), true);
    }

    public static function encrypt(string $plain): string
    {
        if ($plain === '' || self::isEncrypted($plain)) {
            return $plain;
        }

        return self::PREFIX.Crypt::encryptString($plain);
    }

    public static function decrypt(?string $stored): ?string
    {
        if ($stored === null || $stored === '') {
            return $stored;
        }

        if (! self::isEncrypted($stored)) {
            return $stored;
        }

        try {
            return Crypt::decryptString(substr($stored, strlen(self::PREFIX)));
        } catch (\Throwable $e) {
            Log::warning('site_setting.decrypt_failed', ['exception' => $e::class]);

            return null;
        }
    }

    public static function isEncrypted(?string $stored): bool
    {
        return is_string($stored) && str_starts_with($stored, self::PREFIX);
    }
}
