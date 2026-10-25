<?php

namespace App\Http\Middleware;

use App\Http\Middleware\SetLocale;
use App\Models\Customer;
use App\Models\Service;
use App\Models\TimeEntry;
use App\Support\AdminShellInsights;
use App\Support\WorkspaceShellInsights;
use App\Support\PublicStorage;
use App\Support\ServiceBilling;
use App\Support\SubscriptionReminder;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->loadMissing('roles.permissions');
        }

        $active = $user?->activeCompany();
        if ($active) {
            $active->loadMissing(['companySetting', 'statusRelation']);
        }

        $settings = $active?->companySetting;
        $theme = is_array($settings?->theme) ? $settings->theme : [];
        $daysLeft = $active?->trialDaysLeft();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->values(),
                    'permissions' => $user->getPermissions()->values(),
                    'is_admin' => $user->hasRole('admin'),
                    'is_staff' => $user->hasRole('staff'),
                ] : null,
            ],
            'companies' => $user
                ? $user->accessibleCompanies()
                    ->with('companySetting:company_id,invoice_logo')
                    ->orderBy('company_name')
                    ->get(['id', 'company_name', 'is_active'])
                    ->map(fn ($company) => [
                        'id' => $company->id,
                        'company_name' => $company->company_name,
                        'is_active' => (bool) $company->is_active,
                        'logo_url' => PublicStorage::url($company->companySetting?->invoice_logo),
                    ])
                    ->values()
                : [],
            'activeCompany' => $active ? [
                'id' => $active->id,
                'company_name' => $active->company_name,
                'first_name' => $active->first_name,
                'surname' => $active->surname,
                'street' => $active->street,
                'house' => $active->house,
                'postal_code' => $active->postal_code,
                'city' => $active->city,
                'email' => $active->email,
                'vat_number' => $active->vat_number,
                'self_employed_activity' => $active->self_employed_activity,
                'theme' => [
                    'primary' => $theme['primary'] ?? '#4054b2',
                    'secondary' => $theme['secondary'] ?? '#0f172a',
                ],
                'invoice_logo_url' => PublicStorage::url($settings?->invoice_logo),
                'invoice_template' => $settings?->invoice_template ?? 'classic',
                'document_font' => $settings?->document_font ?? 'inter',
                'logo_in_emails' => $settings?->logo_in_emails ?? true,
                'is_active' => (bool) $active->is_active,
                'pending_approval' => $active->isPendingApproval(),
                'trial_starts_at' => $active->trial_starts_at?->toIso8601String(),
                'trial_ends_at' => $active->trial_ends_at?->toIso8601String(),
                'trial_days_left' => $daysLeft,
                'trial_expired' => $active->isTrialExpired(),
                'subscription_plan' => $active->subscription_plan,
                'subscription_ends_at' => $active->subscription_ends_at?->toIso8601String(),
                'subscription_days_left' => $active->subscriptionDaysLeft(),
                'subscription_cancel_at_period_end' => (bool) $active->subscription_cancel_at_period_end,
                'subscription_valid' => $active->hasValidSubscription(),
            ] : null,
            'subscriptionReminder' => SubscriptionReminder::forSession($active, $user, $request),
            'billingRemindersEnabled' => $user ? (bool) $user->billing_reminders_enabled : true,
            'appearance' => $request->session()->get('appearance', 'light'),
            'locale' => app()->getLocale(),
            'locales' => SetLocale::LOCALES,
            'translations' => $this->translations(app()->getLocale()),
            'flash' => [
                'status' => $request->session()->get('status'),
                'error' => $request->session()->get('error'),
            ],
            'adminWorkspace' => $this->adminWorkspace($request, $active),
            'adminShell' => $user && $user->hasRole('admin')
                ? [
                    'notifications' => AdminShellInsights::notifications($user),
                    'environmentBanner' => AdminShellInsights::environmentBanner(),
                ]
                : null,
            'workspaceShell' => $user
                ? [
                    'notifications' => WorkspaceShellInsights::notifications($user, $active),
                ]
                : null,
            'timeTracking' => $this->timeTrackingShare($user, $active),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function timeTrackingShare(?\App\Models\User $user, ?\App\Models\Company $active): ?array
    {
        if (! $user || ! $active) {
            return null;
        }

        $running = TimeEntry::query()
            ->where('user_id', $user->id)
            ->where('company_id', $active->id)
            ->where('status', TimeEntry::STATUS_RUNNING)
            ->with(['service:id,name', 'customer:id,first_name,surname,org_name'])
            ->first();

        $hourlyServices = Service::query()
            ->where('company_id', $active->id)
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'billing_mode', 'unit'])
            ->filter(fn (Service $s) => ServiceBilling::isHourly($s))
            ->map(fn (Service $s) => ['id' => $s->id, 'name' => $s->name, 'price' => $s->price])
            ->values();

        $customers = Customer::query()
            ->where('company_id', $active->id)
            ->orderBy('first_name')
            ->limit(300)
            ->get(['id', 'first_name', 'surname', 'org_name'])
            ->map(fn (Customer $c) => [
                'id' => $c->id,
                'label' => trim($c->org_name ?: ($c->first_name.' '.$c->surname)),
            ])
            ->values();

        return [
            'running' => $running ? [
                'id' => $running->id,
                'started_at' => $running->started_at?->toIso8601String(),
                'description' => $running->description,
                'service' => $running->service ? ['id' => $running->service->id, 'name' => $running->service->name] : null,
                'customer' => $running->customer ? [
                    'id' => $running->customer->id,
                    'label' => trim($running->customer->org_name ?: ($running->customer->first_name.' '.$running->customer->surname)),
                ] : null,
            ] : null,
            'hourlyServices' => $hourlyServices,
            'customers' => $customers,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function adminWorkspace(Request $request, ?\App\Models\Company $active): ?array
    {
        $companyId = $request->session()->get('admin_workspace_company_id');
        if (! $companyId || ! $request->user()?->hasRole('admin')) {
            return null;
        }

        return [
            'company_id' => (int) $companyId,
            'company_name' => $active?->company_name,
            'exit_url' => route('admin.workspace.exit'),
        ];
    }

    private function translations(string $locale): array
    {
        $path = lang_path($locale.'.json');
        if (! is_file($path)) {
            $path = lang_path('en.json');
        }

        $decoded = json_decode((string) file_get_contents($path), true);

        return is_array($decoded) ? $decoded : [];
    }
}
