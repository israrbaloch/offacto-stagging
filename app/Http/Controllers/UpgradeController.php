<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UpgradeController extends Controller
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public static function plans(): array
    {
        return [
            [
                'id' => 'starter',
                'price' => '€29',
                'period' => 'month',
                'features' => [
                    'upgrade.plans.starter.f1',
                    'upgrade.plans.starter.f2',
                    'upgrade.plans.starter.f3',
                ],
            ],
            [
                'id' => 'growth',
                'price' => '€59',
                'period' => 'month',
                'highlight' => true,
                'features' => [
                    'upgrade.plans.growth.f1',
                    'upgrade.plans.growth.f2',
                    'upgrade.plans.growth.f3',
                    'upgrade.plans.growth.f4',
                ],
            ],
            [
                'id' => 'scale',
                'price' => '€99',
                'period' => 'month',
                'features' => [
                    'upgrade.plans.scale.f1',
                    'upgrade.plans.scale.f2',
                    'upgrade.plans.scale.f3',
                    'upgrade.plans.scale.f4',
                ],
            ],
        ];
    }

    public function index(Request $request): Response
    {
        $company = $request->user()?->activeCompany();

        return Inertia::render('Upgrade', [
            'currentPlan' => $company?->subscription_plan,
            'trialExpired' => $company?->isTrialExpired() ?? false,
            'plans' => self::plans(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $company = $request->user()?->activeCompany();
        if (! $company) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $data = $request->validate([
            'plan' => ['required', 'in:starter,growth,scale'],
        ]);

        $company->update([
            'subscription_plan' => $data['plan'],
            'subscription_started_at' => now(),
        ]);

        return redirect()->route('dashboard')->with('status', 'plan-activated');
    }
}
