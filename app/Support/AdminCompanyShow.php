<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\CompanyStatusEvent;
use App\Models\SecurityEvent;
use App\Models\SubscriptionPayment;
use Illuminate\Support\Collection;

class AdminCompanyShow
{
    /**
     * @return array<string, mixed>
     */
    public static function usage(Company $company): array
    {
        return [
            'customers' => $company->customers()->count(),
            'services' => $company->services()->count(),
            'offers' => $company->offers()->count(),
            'invoices' => $company->invoices()->count(),
            'offers_last_30_days' => $company->offers()->where('created_at', '>=', now()->subDays(30))->count(),
            'invoices_last_30_days' => $company->invoices()->where('created_at', '>=', now()->subDays(30))->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function integrations(Company $company): array
    {
        $defaults = CompanyIntegrations::postbodeFormDefaults($company->companySetting);

        return [
            'mollie_configured' => (bool) ($defaults['mollie_configured'] ?? false),
            'postbode_configured' => (bool) ($defaults['postbode_configured'] ?? false),
            'integrations_mode' => $defaults['integrations_mode'] ?? 'test',
            'country' => $defaults['postbode_default_country'] ?? 'NL',
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function timeline(Company $company, int $limit = 40): array
    {
        $events = collect();

        CompanyStatusEvent::query()
            ->where('company_id', $company->id)
            ->latest()
            ->limit(20)
            ->get()
            ->each(function (CompanyStatusEvent $row) use ($events) {
                $events->push([
                    'id' => 'status-'.$row->id,
                    'type' => 'status',
                    'label' => $row->action,
                    'detail' => $row->reason,
                    'at' => $row->created_at?->toIso8601String(),
                ]);
            });

        ActivityLog::query()
            ->where('company_id', $company->id)
            ->latest()
            ->limit(15)
            ->get()
            ->each(function (ActivityLog $row) use ($events) {
                $events->push([
                    'id' => 'activity-'.$row->id,
                    'type' => 'activity',
                    'label' => $row->action,
                    'detail' => null,
                    'at' => $row->created_at?->toIso8601String(),
                ]);
            });

        SubscriptionPayment::query()
            ->where('company_id', $company->id)
            ->latest()
            ->limit(10)
            ->get()
            ->each(function (SubscriptionPayment $payment) use ($events) {
                $events->push([
                    'id' => 'payment-'.$payment->id,
                    'type' => 'subscription_payment',
                    'label' => $payment->status,
                    'detail' => number_format($payment->amount_cents / 100, 2).' '.$payment->currency,
                    'at' => ($payment->paid_at ?? $payment->created_at)?->toIso8601String(),
                ]);
            });

        if ($company->user_id) {
            SecurityEvent::query()
                ->where('user_id', $company->user_id)
                ->latest()
                ->limit(8)
                ->get()
                ->each(function (SecurityEvent $row) use ($events) {
                    $events->push([
                        'id' => 'security-'.$row->id,
                        'type' => 'login',
                        'label' => $row->event_type,
                        'detail' => $row->ip_address,
                        'at' => $row->created_at?->toIso8601String(),
                    ]);
                });
        }

        return $events
            ->filter(fn ($row) => filled($row['at']))
            ->sortByDesc('at')
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public static function profile(Company $company): array
    {
        $company->loadMissing([
            'user:id,name,email',
            'statusRelation:id,name',
            'languageRelation:id,code,name',
            'companySetting:company_id,postbode_default_country',
            'legalDocuments:id,company_id,type,original_name,created_at',
        ]);

        return [
            'id' => $company->id,
            'company_name' => $company->company_name,
            'legal_name' => $company->legal_name,
            'first_name' => $company->first_name,
            'surname' => $company->surname,
            'email' => $company->email,
            'phone' => $company->phone,
            'vat_number' => $company->vat_number,
            'street' => $company->street,
            'house' => $company->house,
            'postal_code' => $company->postal_code,
            'city' => $company->city,
            'language' => $company->language,
            'language_label' => $company->languageRelation?->name,
            'self_employed_activity' => $company->self_employed_activity,
            'is_active' => (bool) $company->is_active,
            'approval_status' => $company->statusRelation?->name,
            'status_id' => $company->status,
            'country' => $company->companySetting?->postbode_default_country ?? 'NL',
            'subscription_plan' => $company->subscription_plan,
            'trial_ends_at' => $company->trial_ends_at?->toIso8601String(),
            'subscription_ends_at' => $company->subscription_ends_at?->toIso8601String(),
            'subscription_valid' => $company->hasValidSubscription(),
            'created_at' => $company->created_at?->toIso8601String(),
            'approved_at' => $company->approved_at?->toIso8601String(),
            'owner' => $company->user ? [
                'id' => $company->user->id,
                'name' => $company->user->name,
                'email' => $company->user->email,
            ] : null,
            'legal_documents' => $company->legalDocuments->map(fn ($doc) => [
                'id' => $doc->id,
                'type' => $doc->type,
                'name' => $doc->original_name,
                'uploaded_at' => $doc->created_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }
}
