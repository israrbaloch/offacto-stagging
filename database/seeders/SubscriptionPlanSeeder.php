<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use App\Support\PlanEntitlementCatalog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        App::setLocale('en');

        $plans = [
            [
                'slug' => 'starter',
                'price_cents' => 2900,
                'currency' => 'EUR',
                'is_highlighted' => false,
                'sort_order' => 1,
                'name_labels' => [
                    'en' => 'Starter',
                    'fr' => 'Starter',
                    'nl' => 'Starter',
                ],
                'description_labels' => [
                    'en' => 'For freelancers sending their first quotes and invoices.',
                    'fr' => 'For freelancers sending their first quotes and invoices.',
                    'nl' => 'For freelancers sending their first quotes and invoices.',
                ],
                'feature_items' => $this->features([
                    'Unlimited quotes & invoices',
                    'Customer & briefing tools',
                    'Email sending',
                ]),
                'entitlements' => PlanEntitlementCatalog::presetForSlug('starter'),
            ],
            [
                'slug' => 'growth',
                'price_cents' => 5900,
                'currency' => 'EUR',
                'is_highlighted' => true,
                'sort_order' => 2,
                'name_labels' => [
                    'en' => 'Growth',
                    'fr' => 'Growth',
                    'nl' => 'Growth',
                ],
                'description_labels' => [
                    'en' => 'For growing businesses that need more automation.',
                    'fr' => 'For growing businesses that need more automation.',
                    'nl' => 'For growing businesses that need more automation.',
                ],
                'feature_items' => $this->features([
                    'Everything in Starter',
                    'Recurring invoices',
                    'Payment links (Mollie)',
                    'Priority support',
                ]),
                'entitlements' => PlanEntitlementCatalog::presetForSlug('growth'),
            ],
            [
                'slug' => 'scale',
                'price_cents' => 9900,
                'currency' => 'EUR',
                'is_highlighted' => false,
                'sort_order' => 3,
                'name_labels' => [
                    'en' => 'Scale',
                    'fr' => 'Scale',
                    'nl' => 'Scale',
                ],
                'description_labels' => [
                    'en' => 'For teams with higher volume and integrations.',
                    'fr' => 'For teams with higher volume and integrations.',
                    'nl' => 'For teams with higher volume and integrations.',
                ],
                'feature_items' => $this->features([
                    'Everything in Growth',
                    'Peppol e-invoicing',
                    'Multiple companies',
                    'Dedicated onboarding',
                ]),
                'entitlements' => PlanEntitlementCatalog::presetForSlug('scale'),
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }

    /**
     * @param  list<string>  $lines
     * @return list<array<string, mixed>>
     */
    private function features(array $lines): array
    {
        return array_map(fn (string $line) => [
            'included' => true,
            'label' => ['en' => $line, 'fr' => $line, 'nl' => $line],
        ], $lines);
    }
}
