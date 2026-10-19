<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\DiscountCoupon;
use App\Models\SubscriptionPayment;
use App\Support\AdminBillingSettings;
use App\Support\MoneyAmount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminBillingController extends Controller
{
    public function settings(): Response
    {
        return Inertia::render('Admin/Billing/Settings', [
            'settings' => AdminBillingSettings::all(),
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'trial_duration_days' => ['required', 'integer', 'min:1', 'max:90'],
            'subscription_reminder_days' => ['required', 'integer', 'min:1', 'max:30'],
            'dunning_grace_days' => ['required', 'integer', 'min:0', 'max:30'],
            'dunning_max_retries' => ['required', 'integer', 'min:0', 'max:10'],
            'platform_default_currency' => ['required', Rule::in(['EUR', 'USD', 'GBP'])],
            'notifications.trial_expiry' => ['required', 'boolean'],
            'notifications.renewal' => ['required', 'boolean'],
            'notifications.failed_payment' => ['required', 'boolean'],
            'notifications.cancellation' => ['required', 'boolean'],
            'notifications.subscription_confirmation' => ['required', 'boolean'],
        ]);

        AdminBillingSettings::persist($data);
        ActivityLog::record('admin.billing.settings_updated');

        return back()->with('status', 'billing-settings-saved');
    }

    public function coupons(): Response
    {
        $coupons = DiscountCoupon::query()->orderByDesc('created_at')->get()->map(fn (DiscountCoupon $c) => [
            'id' => $c->id,
            'code' => $c->code,
            'name' => $c->name,
            'type' => $c->type,
            'amount' => $c->type === 'percent' ? (int) $c->amount : MoneyAmount::fromCents((int) $c->amount),
            'max_redemptions' => $c->max_redemptions,
            'redemption_count' => $c->redemption_count,
            'valid_from' => $c->valid_from?->toIso8601String(),
            'valid_until' => $c->valid_until?->toIso8601String(),
            'is_active' => $c->is_active,
            'valid_now' => $c->isValidNow(),
        ]);

        return Inertia::render('Admin/Billing/Coupons', ['coupons' => $coupons]);
    }

    public function storeCoupon(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:64', 'unique:discount_coupons,code'],
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', Rule::in(['percent', 'fixed'])],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'max_redemptions' => ['nullable', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $storedAmount = $data['type'] === 'fixed'
            ? MoneyAmount::toCents($data['amount'])
            : (int) round($data['amount']);

        DiscountCoupon::create([
            ...$data,
            'amount' => $storedAmount,
            'code' => strtoupper($data['code']),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        ActivityLog::record('admin.billing.coupon_created', metadata: ['code' => $data['code']]);

        return back()->with('status', 'coupon-created');
    }

    public function updateCoupon(Request $request, DiscountCoupon $coupon): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'is_active' => ['required', 'boolean'],
            'max_redemptions' => ['nullable', 'integer', 'min:1'],
            'valid_until' => ['nullable', 'date'],
        ]);

        $coupon->update($data);

        return back()->with('status', 'coupon-updated');
    }

    public function payments(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'string', 'max:32'],
            'q' => ['nullable', 'string', 'max:120'],
        ]);

        $query = SubscriptionPayment::query()->with(['company:id,company_name', 'plan:id,slug,name_labels']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if ($search = trim($filters['q'] ?? '')) {
            $query->where(function ($q) use ($search) {
                $q->where('mollie_payment_id', 'like', "%{$search}%")
                    ->orWhereHas('company', fn ($c) => $c->where('company_name', 'like', "%{$search}%"));
            });
        }

        $payments = $query->latest()->paginate(30)->withQueryString()->through(fn (SubscriptionPayment $p) => [
            'id' => $p->id,
            'company' => $p->company?->company_name,
            'company_id' => $p->company_id,
            'plan' => $p->plan?->slug,
            'status' => $p->status,
            'amount' => round($p->amount_cents / 100, 2),
            'currency' => $p->currency,
            'paid_at' => $p->paid_at?->toIso8601String(),
            'created_at' => $p->created_at?->toIso8601String(),
            'mollie_payment_id' => $p->mollie_payment_id,
        ]);

        return Inertia::render('Admin/Billing/Payments', [
            'payments' => $payments,
            'filters' => array_merge(['status' => '', 'q' => ''], $filters),
        ]);
    }

    public function reports(): Response
    {
        $paid = SubscriptionPayment::query()->where('status', 'paid');
        $failed = SubscriptionPayment::query()->whereIn('status', ['failed', 'canceled', 'expired']);

        $monthStart = now()->startOfMonth();

        return Inertia::render('Admin/Billing/Reports', [
            'reports' => [
                'collected_cash' => round($paid->sum('amount_cents') / 100, 2),
                'collected_this_month' => round((clone $paid)->where('paid_at', '>=', $monthStart)->sum('amount_cents') / 100, 2),
                'refunds' => 0,
                'failed_amount' => round($failed->sum('amount_cents') / 100, 2),
                'failed_count' => $failed->count(),
                'paid_count' => $paid->count(),
                'note' => 'Subscription cash collected via plan payments. Tenant invoice revenue is excluded.',
            ],
        ]);
    }
}
