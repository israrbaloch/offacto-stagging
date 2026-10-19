<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionAdjustmentService;
use App\Support\AdminSubscriptionOverview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('Admin/Subscriptions/Dashboard', AdminSubscriptionOverview::dashboard());
    }

    public function directory(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'plan' => ['nullable', 'string', 'max:32'],
            'state' => ['nullable', Rule::in(['trial', 'active', 'canceling', 'expired', 'trial_expired', 'all'])],
            'payment_status' => ['nullable', 'string', 'max:32'],
        ]);

        $state = $filters['state'] ?? 'all';
        $rows = AdminSubscriptionOverview::directoryQuery(
            $filters['q'] ?? null,
            $filters['plan'] ?? null,
            $state === 'all' ? null : $state,
            $filters['payment_status'] ?? null,
        )
            ->paginate(25)
            ->withQueryString()
            ->through(function (Company $company) {
                return [
                    'id' => $company->id,
                    'company_name' => $company->company_name,
                    'email' => $company->email,
                    'owner' => $company->user?->name,
                    'plan' => $company->subscription_plan,
                    'state' => AdminSubscriptionOverview::subscriptionState($company),
                    'renewal_at' => $company->subscription_ends_at?->toIso8601String(),
                    'trial_ends_at' => $company->trial_ends_at?->toIso8601String(),
                    'cancel_at_period_end' => (bool) $company->subscription_cancel_at_period_end,
                ];
            });

        return Inertia::render('Admin/Subscriptions/Directory', [
            'subscriptions' => $rows,
            'filters' => array_merge([
                'q' => '',
                'plan' => '',
                'state' => 'all',
                'payment_status' => '',
            ], $filters),
            'plans' => SubscriptionPlan::query()->orderBy('sort_order')->pluck('slug'),
        ]);
    }

    public function show(Company $company): Response
    {
        return Inertia::render('Admin/Subscriptions/Show', [
            ...AdminSubscriptionOverview::companySubscription($company),
            'plans' => SubscriptionPlan::query()->whereNull('archived_at')->active()->ordered()->get()->map(fn ($p) => [
                'slug' => $p->slug,
                'label' => $p->label('name'),
            ]),
        ]);
    }

    public function adjust(Request $request, Company $company, SubscriptionAdjustmentService $adjustments): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['extend_period', 'complimentary_period', 'change_plan', 'cancel_at_period_end'])],
            'reason' => ['nullable', 'string', 'max:2000'],
            'days' => ['nullable', 'integer', 'min:1', 'max:730'],
            'plan' => ['nullable', 'string', 'max:32', 'required_if:action,change_plan'],
        ]);

        $admin = $request->user();

        match ($data['action']) {
            'extend_period' => $adjustments->extendPeriod($company, $admin, (int) ($data['days'] ?? 30), $data['reason'] ?? null),
            'complimentary_period' => $adjustments->complimentaryPeriod(
                $company,
                $admin,
                (int) ($data['days'] ?? 30),
                $data['plan'] ?? null,
                $data['reason'] ?? null,
            ),
            'change_plan' => $adjustments->changePlan($company, $admin, (string) $data['plan'], $data['reason'] ?? null),
            'cancel_at_period_end' => $adjustments->cancelAtPeriodEnd($company, $admin, $data['reason'] ?? null),
        };

        return back()->with('status', 'subscription-adjusted');
    }
}
