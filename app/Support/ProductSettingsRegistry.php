<?php

namespace App\Support;

final class ProductSettingsRegistry
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function sections(): array
    {
        $config = array_map(
            fn (string $id, array $def) => [
                'id' => $id,
                'group' => $def['group'],
                'title' => $def['title'],
                'description' => $def['description'],
                'kind' => 'config',
                'href' => '/admin/product/'.$id,
            ],
            array_keys(self::definitions()),
            self::definitions(),
        );

        $ops = array_map(
            fn (array $row) => [...$row, 'kind' => 'operation', 'href' => '/admin/product/operations/'.$row['id']],
            self::operationSections(),
        );

        return array_values([...$config, ...$ops]);
    }

    /**
     * @return list<array{id: string, group: string, title: string, description: string}>
     */
    public static function operationSections(): array
    {
        return [
            ['id' => 'public-cms', 'group' => 'Content', 'title' => 'Public website CMS', 'description' => 'Landing pages, product info, FAQ, and public help content.'],
            ['id' => 'announcements', 'group' => 'Engagement', 'title' => 'Announcement manager', 'description' => 'In-app banners for maintenance, releases, and policy updates.'],
            ['id' => 'testimonials', 'group' => 'Content', 'title' => 'Testimonial & review management', 'description' => 'Moderation, consent, and publish controls.'],
            ['id' => 'help-center', 'group' => 'Content', 'title' => 'Help center manager', 'description' => 'Guides, integrations, and troubleshooting articles.'],
            ['id' => 'release-notes', 'group' => 'Engagement', 'title' => 'Release notes manager', 'description' => 'Version history, fixes, and known limitations.'],
            ['id' => 'feature-rollouts', 'group' => 'Rollout', 'title' => 'Feature rollout manager', 'description' => 'Plans, companies, and progressive percentage rollout.'],
            ['id' => 'ab-testing', 'group' => 'Rollout', 'title' => 'A/B testing manager', 'description' => 'Controlled UI experiments with privacy safeguards.'],
            ['id' => 'feedback-roadmap', 'group' => 'Voice of customer', 'title' => 'Product feedback & roadmap', 'description' => 'Requests, deduplication, and public roadmap items.'],
        ];
    }

    public static function definition(string $id): ?array
    {
        return self::definitions()[$id] ?? null;
    }

    public static function isOperationSection(string $id): bool
    {
        return collect(self::operationSections())->contains(fn ($s) => $s['id'] === $id);
    }

    /**
     * @return array<string, array{group: string, title: string, description: string, fields: list<array<string, mixed>>}>
     */
    public static function definitions(): array
    {
        return [
            'onboarding-configuration' => [
                'group' => 'Onboarding',
                'title' => 'Onboarding configuration',
                'description' => 'Welcome copy, checklist steps, and first-company walkthrough hints.',
                'fields' => [
                    ['key' => 'prod_onboard_welcome_title', 'type' => 'text', 'label' => 'Welcome title', 'default' => 'Welcome to Offacto'],
                    ['key' => 'prod_onboard_welcome_body', 'type' => 'textarea', 'label' => 'Welcome message', 'default' => 'Complete the checklist below to send your first offer or invoice.'],
                    ['key' => 'prod_onboard_checklist', 'type' => 'structured', 'widget' => 'onboarding_checklist', 'label' => 'Setup checklist', 'default' => [
                        ['id' => 'company_profile', 'label' => 'Complete company profile', 'enabled' => true],
                        ['id' => 'first_customer', 'label' => 'Add a customer', 'enabled' => true],
                        ['id' => 'first_offer', 'label' => 'Create an offer or invoice', 'enabled' => true],
                    ]],
                    ['key' => 'prod_onboard_show_walkthrough', 'type' => 'boolean', 'label' => 'Show interactive walkthrough for new owners', 'default' => true],
                ],
            ],
            'ab-testing-policy' => [
                'group' => 'Rollout',
                'title' => 'A/B testing policy',
                'description' => 'Privacy and sampling defaults for experiments (no PII in variant payloads).',
                'fields' => [
                    ['key' => 'prod_ab_require_consent', 'type' => 'boolean', 'label' => 'Require documented consent for production experiments', 'default' => true],
                    ['key' => 'prod_ab_min_participants', 'type' => 'integer', 'label' => 'Minimum participants before reading results', 'default' => 100, 'min' => 10],
                    ['key' => 'prod_ab_pii_forbidden', 'type' => 'boolean', 'label' => 'Forbid personal data in experiment labels or metrics', 'default' => true],
                ],
            ],
            'system-wide-defaults' => [
                'group' => 'Defaults',
                'title' => 'System-wide defaults',
                'description' => 'Applied when creating new workspaces only — never bulk-overwrites existing company records.',
                'fields' => [
                    ['key' => 'prod_defaults_new_only_ack', 'type' => 'boolean', 'label' => 'Enforce new-workspace-only application', 'default' => true],
                    ['key' => 'prod_default_locale', 'type' => 'select', 'label' => 'Default language', 'default' => 'nl', 'options' => ['en', 'fr', 'nl']],
                    ['key' => 'prod_default_currency', 'type' => 'select', 'label' => 'Default currency', 'default' => 'EUR', 'options' => ['EUR', 'USD', 'GBP']],
                    ['key' => 'prod_default_payment_terms_days', 'type' => 'integer', 'label' => 'Default payment terms (days)', 'default' => 14, 'min' => 0],
                    ['key' => 'prod_default_workspace_defaults', 'type' => 'structured', 'widget' => 'workspace_defaults', 'label' => 'Extra defaults for new workspaces', 'default' => [
                        'invoice_numbering_prefix' => 'INV',
                        'offer_validity_days' => 30,
                    ]],
                ],
            ],
        ];
    }
}
