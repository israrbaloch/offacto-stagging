<?php

namespace App\Http\Middleware;

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
            $user->loadMissing('roles');
        }

        $active = $user?->activeCompany();
        if ($active) {
            $active->loadMissing('companySetting');
        }

        $settings = $active?->companySetting;
        $theme = is_array($settings?->theme) ? $settings->theme : [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->values(),
                    'is_admin' => $user->hasRole('admin'),
                    'is_staff' => $user->hasRole('staff'),
                ] : null,
            ],
            'companies' => $user
                ? $user->accessibleCompanies()->select('id', 'company_name', 'is_active')->get()
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
                'self_employed_activity' => $active->self_employed_activity,
                'theme' => [
                    'primary' => $theme['primary'] ?? '#4f46e5',
                    'secondary' => $theme['secondary'] ?? '#0f172a',
                ],
                'invoice_logo_url' => $settings?->invoice_logo
                    ? asset('storage/'.$settings->invoice_logo)
                    : null,
            ] : null,
            'flash' => [
                'status' => $request->session()->get('status'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
