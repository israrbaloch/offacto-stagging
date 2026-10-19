<?php

namespace App\Support;

/**
 * Maps settings registry classes to admin UI base paths (for links from governance tools).
 */
final class AdminSettingsRoutes
{
    public static function basePathForRegistry(string $registryClass): ?string
    {
        return match ($registryClass) {
            PlatformSettingsRegistry::class => '/admin/settings',
            FinancialDocumentSettingsRegistry::class => '/admin/financial',
            ComplianceSettingsRegistry::class => '/admin/compliance',
            IntegrationSettingsRegistry::class => '/admin/integrations',
            CommunicationSettingsRegistry::class => '/admin/communications',
            SupportSettingsRegistry::class => '/admin/support',
            SecuritySettingsRegistry::class => '/admin/security',
            InfrastructureSettingsRegistry::class => '/admin/infrastructure',
            ProductSettingsRegistry::class => '/admin/product',
            GovernanceSettingsRegistry::class => '/admin/governance',
            default => null,
        };
    }

    public static function sectionHref(string $registryClass, string $sectionId): ?string
    {
        $base = self::basePathForRegistry($registryClass);

        return $base ? "{$base}/{$sectionId}" : null;
    }

    public static function registryLabel(string $registryClass): string
    {
        return match ($registryClass) {
            PlatformSettingsRegistry::class => 'Platform settings',
            FinancialDocumentSettingsRegistry::class => 'Financial documents',
            ComplianceSettingsRegistry::class => 'Compliance',
            IntegrationSettingsRegistry::class => 'Integrations',
            CommunicationSettingsRegistry::class => 'Email & notifications',
            SupportSettingsRegistry::class => 'Support',
            SecuritySettingsRegistry::class => 'Security',
            InfrastructureSettingsRegistry::class => 'Infrastructure',
            ProductSettingsRegistry::class => 'Product & content',
            GovernanceSettingsRegistry::class => 'Governance',
            default => class_basename($registryClass),
        };
    }
}
