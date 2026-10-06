<?php

namespace App\Support;

class PlanEntitlementCatalog
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function groups(): array
    {
        return [
            [
                'id' => 'offers',
                'label_key' => 'plan_entitlements.groups.offers',
                'limit_key' => 'offers',
                'capabilities' => [
                    ['key' => 'offers.access', 'label_key' => 'plan_entitlements.cap.offers.access'],
                    ['key' => 'offers.create', 'label_key' => 'plan_entitlements.cap.offers.create'],
                    ['key' => 'offers.update', 'label_key' => 'plan_entitlements.cap.offers.update'],
                    ['key' => 'offers.delete', 'label_key' => 'plan_entitlements.cap.offers.delete'],
                    ['key' => 'offers.send', 'label_key' => 'plan_entitlements.cap.offers.send'],
                    ['key' => 'offers.postbode', 'label_key' => 'plan_entitlements.cap.offers.postbode'],
                    ['key' => 'offers.peppol', 'label_key' => 'plan_entitlements.cap.offers.peppol'],
                    ['key' => 'offers.attachments', 'label_key' => 'plan_entitlements.cap.offers.attachments'],
                    ['key' => 'offers.public_accept', 'label_key' => 'plan_entitlements.cap.offers.public_accept'],
                ],
            ],
            [
                'id' => 'invoices',
                'label_key' => 'plan_entitlements.groups.invoices',
                'limit_key' => 'invoices',
                'capabilities' => [
                    ['key' => 'invoices.access', 'label_key' => 'plan_entitlements.cap.invoices.access'],
                    ['key' => 'invoices.create', 'label_key' => 'plan_entitlements.cap.invoices.create'],
                    ['key' => 'invoices.update', 'label_key' => 'plan_entitlements.cap.invoices.update'],
                    ['key' => 'invoices.delete', 'label_key' => 'plan_entitlements.cap.invoices.delete'],
                    ['key' => 'invoices.send', 'label_key' => 'plan_entitlements.cap.invoices.send'],
                    ['key' => 'invoices.reminder', 'label_key' => 'plan_entitlements.cap.invoices.reminder'],
                    ['key' => 'invoices.recurring', 'label_key' => 'plan_entitlements.cap.invoices.recurring'],
                    ['key' => 'invoices.credit_note', 'label_key' => 'plan_entitlements.cap.invoices.credit_note'],
                    ['key' => 'invoices.mollie', 'label_key' => 'plan_entitlements.cap.invoices.mollie'],
                    ['key' => 'invoices.postbode', 'label_key' => 'plan_entitlements.cap.invoices.postbode'],
                    ['key' => 'invoices.peppol', 'label_key' => 'plan_entitlements.cap.invoices.peppol'],
                    ['key' => 'invoices.attachments', 'label_key' => 'plan_entitlements.cap.invoices.attachments'],
                    ['key' => 'invoices.record_payment', 'label_key' => 'plan_entitlements.cap.invoices.record_payment'],
                ],
            ],
            [
                'id' => 'customers',
                'label_key' => 'plan_entitlements.groups.customers',
                'limit_key' => 'customers',
                'capabilities' => [
                    ['key' => 'customers.access', 'label_key' => 'plan_entitlements.cap.customers.access'],
                    ['key' => 'customers.create', 'label_key' => 'plan_entitlements.cap.customers.create'],
                    ['key' => 'customers.update', 'label_key' => 'plan_entitlements.cap.customers.update'],
                    ['key' => 'customers.delete', 'label_key' => 'plan_entitlements.cap.customers.delete'],
                ],
            ],
            [
                'id' => 'services',
                'label_key' => 'plan_entitlements.groups.services',
                'limit_key' => 'services',
                'capabilities' => [
                    ['key' => 'services.access', 'label_key' => 'plan_entitlements.cap.services.access'],
                    ['key' => 'services.create', 'label_key' => 'plan_entitlements.cap.services.create'],
                    ['key' => 'services.update', 'label_key' => 'plan_entitlements.cap.services.update'],
                    ['key' => 'services.delete', 'label_key' => 'plan_entitlements.cap.services.delete'],
                ],
            ],
            [
                'id' => 'briefings',
                'label_key' => 'plan_entitlements.groups.briefings',
                'limit_key' => 'briefings',
                'capabilities' => [
                    ['key' => 'briefings.access', 'label_key' => 'plan_entitlements.cap.briefings.access'],
                    ['key' => 'briefings.create', 'label_key' => 'plan_entitlements.cap.briefings.create'],
                    ['key' => 'briefings.update', 'label_key' => 'plan_entitlements.cap.briefings.update'],
                    ['key' => 'briefings.delete', 'label_key' => 'plan_entitlements.cap.briefings.delete'],
                    ['key' => 'briefings.public_form', 'label_key' => 'plan_entitlements.cap.briefings.public_form'],
                    ['key' => 'briefings.generate_quote', 'label_key' => 'plan_entitlements.cap.briefings.generate_quote'],
                ],
            ],
            [
                'id' => 'workspace',
                'label_key' => 'plan_entitlements.groups.workspace',
                'limit_key' => 'companies',
                'capabilities' => [
                    ['key' => 'companies.create', 'label_key' => 'plan_entitlements.cap.companies.create'],
                    ['key' => 'team.invite', 'label_key' => 'plan_entitlements.cap.team.invite'],
                    ['key' => 'team.manage_roles', 'label_key' => 'plan_entitlements.cap.team.manage_roles'],
                    ['key' => 'settings.company', 'label_key' => 'plan_entitlements.cap.settings.company'],
                    ['key' => 'reports.dashboard', 'label_key' => 'plan_entitlements.cap.reports.dashboard'],
                ],
            ],
            [
                'id' => 'integrations',
                'label_key' => 'plan_entitlements.groups.integrations',
                'limit_key' => null,
                'capabilities' => [
                    ['key' => 'integrations.mollie', 'label_key' => 'plan_entitlements.cap.integrations.mollie'],
                    ['key' => 'integrations.postbode', 'label_key' => 'plan_entitlements.cap.integrations.postbode'],
                    ['key' => 'integrations.peppol', 'label_key' => 'plan_entitlements.cap.integrations.peppol'],
                    ['key' => 'integrations.whatsapp', 'label_key' => 'plan_entitlements.cap.integrations.whatsapp'],
                ],
            ],
        ];
    }

    /**
     * @return list<string>
     */
    public static function capabilityKeys(): array
    {
        $keys = [];
        foreach (self::groups() as $group) {
            foreach ($group['capabilities'] as $cap) {
                $keys[] = $cap['key'];
            }
        }

        return $keys;
    }

    /**
     * @return list<string>
     */
    public static function limitKeys(): array
    {
        $keys = [];
        foreach (self::groups() as $group) {
            if (filled($group['limit_key'] ?? null)) {
                $keys[] = $group['limit_key'];
            }
        }
        $keys[] = 'team_users';

        return array_values(array_unique($keys));
    }

    /**
     * Default entitlements for a new plan (conservative).
     *
     * @return array{capabilities: array<string, bool>, limits: array<string, array{monthly: ?int, total: ?int}>}
     */
    public static function defaultEntitlements(): array
    {
        $capabilities = [];
        foreach (self::capabilityKeys() as $key) {
            $capabilities[$key] = str_ends_with($key, '.access') || str_ends_with($key, '.create');
        }

        $limits = [];
        foreach (self::limitKeys() as $key) {
            $limits[$key] = ['monthly' => null, 'total' => null];
        }

        return [
            'capabilities' => $capabilities,
            'limits' => $limits,
        ];
    }

    /**
     * Trial workspace: same shape as a paid plan, generous defaults.
     *
     * @return array{capabilities: array<string, bool>, limits: array<string, array{monthly: ?int, total: ?int}>}
     */
    public static function trialEntitlements(): array
    {
        $entitlements = self::defaultEntitlements();
        foreach (self::capabilityKeys() as $key) {
            if (! str_starts_with($key, 'integrations.peppol')) {
                $entitlements['capabilities'][$key] = true;
            }
        }
        $entitlements['limits']['offers']['monthly'] = 50;
        $entitlements['limits']['invoices']['monthly'] = 50;
        $entitlements['limits']['customers']['total'] = 200;
        $entitlements['limits']['companies']['total'] = 1;

        return $entitlements;
    }

    /**
     * @return array{capabilities: array<string, bool>, limits: array<string, array{monthly: ?int, total: ?int}>}
     */
    public static function presetForSlug(string $slug): array
    {
        $allOn = self::defaultEntitlements();
        foreach (self::capabilityKeys() as $key) {
            $allOn['capabilities'][$key] = true;
        }
        foreach (self::limitKeys() as $key) {
            $allOn['limits'][$key] = ['monthly' => null, 'total' => null];
        }

        return match ($slug) {
            'starter' => self::mergePreset($allOn, [
                'capabilities' => [
                    'invoices.recurring' => false,
                    'invoices.mollie' => false,
                    'invoices.peppol' => false,
                    'invoices.postbode' => false,
                    'offers.peppol' => false,
                    'offers.postbode' => false,
                    'integrations.mollie' => false,
                    'integrations.postbode' => false,
                    'integrations.peppol' => false,
                    'companies.create' => false,
                ],
                'limits' => [
                    'companies' => ['monthly' => null, 'total' => 1],
                ],
            ]),
            'growth' => self::mergePreset($allOn, [
                'capabilities' => [
                    'invoices.peppol' => false,
                    'offers.peppol' => false,
                    'integrations.peppol' => false,
                    'companies.create' => false,
                ],
                'limits' => [
                    'companies' => ['monthly' => null, 'total' => 1],
                ],
            ]),
            'scale' => $allOn,
            default => self::defaultEntitlements(),
        };
    }

    /**
     * @param  array{capabilities: array<string, bool>, limits: array<string, array{monthly: ?int, total: ?int}>}  $base
     * @param  array{capabilities?: array<string, bool>, limits?: array<string, array{monthly: ?int, total: ?int}>}  $patch
     * @return array{capabilities: array<string, bool>, limits: array<string, array{monthly: ?int, total: ?int}>}
     */
    private static function mergePreset(array $base, array $patch): array
    {
        if (isset($patch['capabilities'])) {
            $base['capabilities'] = array_merge($base['capabilities'], $patch['capabilities']);
        }
        if (isset($patch['limits'])) {
            foreach ($patch['limits'] as $key => $limit) {
                $base['limits'][$key] = array_merge($base['limits'][$key] ?? ['monthly' => null, 'total' => null], $limit);
            }
        }

        return $base;
    }

    /**
     * @return array<string, mixed>
     */
    public static function toAdminArray(): array
    {
        return [
            'groups' => self::groups(),
            'limit_keys' => self::limitKeys(),
            'defaults' => self::defaultEntitlements(),
        ];
    }
}
