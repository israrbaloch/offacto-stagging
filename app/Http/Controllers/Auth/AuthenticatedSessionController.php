<?php

namespace App\Http\Controllers\Auth;

use Illuminate\View\View;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Auth\LoginRequest;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        $title = 'Login';
        $allowRegistration = SiteSetting::getBoolean('allow_user_registration', true);
        return view('auth.login', compact('title', 'allowRegistration'));
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();

        if (!$user->isActive()) {
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

        if ($user && !session('active_company_id') && $user->hasActiveCompany()) {
            $approvedStatus = \App\Models\Status::where('name', 'Approved')->where('for', 'companies')->first();
            $query = $user->companies()->where('is_active', true);
            if ($approvedStatus) {
                $query->where(function ($q) use ($approvedStatus) {
                    $q->where('status', $approvedStatus->id)->orWhereNull('status');
                });
            }
            $activeCompany = $query->first();
            if ($activeCompany) {
                $user->setActiveCompanyId($activeCompany->id);
            }
        }

        return redirect()->intended(route('dashboard', absolute: false));
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
