<?php

namespace App\Http\Controllers\Auth;

use App\Models\ActivityLog;
use App\Models\SecurityEvent;
use App\Models\SiteSetting;
use App\Support\SubscriptionReminder;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Auth\LoginRequest;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'allowRegistration' => SiteSetting::getBoolean('allow_user_registration', true),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();

        if (! $user->hasVerifiedEmail()) {
            $remember = $request->boolean('remember');
            Auth::logout();

            return RegisterEmailVerificationController::beginVerification($request, $user, $remember);
        }

        if (!$user->isActive()) {
            SecurityEvent::record('login_blocked_inactive', 'failure', user: $user, request: $request);
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact support.'],
            ]);
        }

        if (!$user->hasRole('admin') && !$user->hasActiveCompany()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => ['You do not have an active company. Your company must be both Approved and Active in the admin panel. If it is pending approval, check your email or contact support.'],
            ]);
        }

        $request->session()->regenerate();
        $request->session()->forget(['admin_mfa_verified', 'admin_mfa_pending_secret', 'admin_mfa_must_reenroll']);
        SubscriptionReminder::markLoginPending($request);

        SecurityEvent::record('login_success', 'success', user: $user, request: $request);
        ActivityLog::record('auth.login', actor: $user, request: $request);

        if (\App\Support\AdminAccess::canAccessAdminArea($user) && ! $user->hasRole('staff')) {
            $request->session()->forget('active_company_id');
        }

        if ($user && ! session('active_company_id') && ! $user->hasRole('admin')) {
            $activeCompany = $user->activeCompany();
            if ($activeCompany) {
                $user->setActiveCompanyId($activeCompany->id);
            }
        }

        $mfa = app(\App\Services\AdminMfaService::class);
        if ($mfa->appliesMfa($user)) {
            $adminShell = \App\Support\AdminAccess::canAccessAdminArea($user) && ! $user->hasRole('staff');
            if (! $mfa->confirmedCredential($user)) {
                return redirect($adminShell ? route('admin.mfa.enroll') : route('two-factor.enroll'));
            }

            return redirect($adminShell ? route('admin.mfa') : route('two-factor.challenge'));
        }

        $home = \App\Support\AdminAccess::canAccessAdminArea($user) && ! $user->hasRole('staff')
            ? route('admin.dashboard', absolute: false)
            : route('dashboard', absolute: false);

        return redirect()->intended($home);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
