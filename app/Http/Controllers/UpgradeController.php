<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use App\Models\SubscriptionPlan;
use App\Services\PlatformMollieService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class UpgradeController extends Controller
{
    public function index(Request $request): Response
    {
        $company = $request->user()?->activeCompany();
        $currentPlan = $company?->hasActiveSubscription()
            ? SubscriptionPlan::findBySlug($company->subscription_plan)
            : null;

        $plans = SubscriptionPlan::active()->ordered()->get()->map(
            fn (SubscriptionPlan $plan) => $plan->toUpgradeArray(currentPlan: $currentPlan)
        );

        return Inertia::render('Upgrade', [
            'currentPlan' => $company?->subscription_plan,
            'trialExpired' => $company?->isTrialExpired() ?? false,
            'plans' => $plans,
            'paymentConfigured' => app(PlatformMollieService::class)->isConfigured()
                && SiteSetting::get('payment_gateway', 'mollie') !== 'none',
        ]);
    }

    public function store(Request $request, PlatformMollieService $mollie): RedirectResponse|HttpResponse
    {
        $company = $request->user()?->activeCompany();
        if (! $company) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $data = $request->validate([
            'plan' => ['required', 'string', 'exists:subscription_plans,slug'],
        ]);

        $plan = SubscriptionPlan::where('slug', $data['plan'])->active()->firstOrFail();

        if ($company->subscription_plan === $plan->slug) {
            return redirect()->route('upgrade')->with('status', 'plan-already-active');
        }

        $currentPlan = $company->hasActiveSubscription()
            ? SubscriptionPlan::findBySlug($company->subscription_plan)
            : null;

        if ($currentPlan && ! $plan->isUpgradeFrom($currentPlan)) {
            return redirect()->route('upgrade')->with('error', __('upgrade.downgrade_not_allowed'));
        }

        $gateway = SiteSetting::get('payment_gateway', 'mollie');
        if ($gateway === 'none' || ! $mollie->isConfigured()) {
            return redirect()->route('upgrade')->with('error', 'Payments are not configured yet. Please contact support.');
        }

        try {
            $checkoutUrl = $mollie->createSubscriptionCheckout($company, $plan);
        } catch (\Throwable $e) {
            report($e);

            return redirect()->route('upgrade')->with('error', 'Could not start payment. Try again or contact support.');
        }

        return Inertia::location($checkoutUrl);
    }

    public function callback(Request $request, PlatformMollieService $mollie): RedirectResponse
    {
        $company = $request->user()?->activeCompany();
        if ($company) {
            $mollie->syncLatestPendingForCompany($company);
            $company->refresh();
        }

        if ($company?->subscription_plan) {
            return redirect()->route('dashboard')->with('status', 'plan-activated');
        }

        return redirect()->route('upgrade')->with('status', 'payment-processing');
    }
}
