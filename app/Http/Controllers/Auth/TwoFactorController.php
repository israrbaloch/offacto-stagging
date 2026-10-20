<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AdminMfaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorController extends Controller
{
    public function challenge(AdminMfaService $mfa): Response|RedirectResponse
    {
        $user = request()->user();
        abort_unless($user, 403);

        if (! $mfa->confirmedCredential($user)) {
            return redirect()->route('two-factor.enroll');
        }

        return Inertia::render('Auth/TwoFactorVerify', [
            'hint' => 'Enter the 6-digit code from your authenticator app, or a one-time recovery code.',
            'recoveryAvailable' => true,
        ]);
    }

    public function verify(Request $request, AdminMfaService $mfa): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:32'],
        ]);

        $mfa->verifyChallenge($request->user(), $request, $data['code']);

        return redirect()->intended(route('dashboard'));
    }

    public function recover(Request $request, AdminMfaService $mfa): RedirectResponse
    {
        $data = $request->validate([
            'recovery_code' => ['required', 'string', 'max:32'],
        ]);

        $mfa->consumeRecoveryCode($request->user(), $request, $data['recovery_code']);

        return redirect()->route('two-factor.enroll')->with('status', 'mfa-recovery-accepted');
    }

    public function enroll(Request $request, AdminMfaService $mfa): Response
    {
        $user = $request->user();
        abort_unless($user, 403);

        $pending = $request->session()->get(AdminMfaService::SESSION_PENDING_SECRET);
        $showSetup = is_string($pending) && $pending !== '';

        return Inertia::render('Auth/TwoFactorEnroll', [
            'required' => $mfa->isRequiredFor($user) || $user->two_factor_enabled,
            'alreadyEnrolled' => (bool) $mfa->confirmedCredential($user),
            'mustReenroll' => (bool) $request->session()->get('admin_mfa_must_reenroll'),
            'policyRequired' => $mfa->isRequiredFor($user),
            'setup' => $showSetup ? [
                'secret' => $pending,
                'uri' => app(\App\Services\TotpService::class)->provisioningUri($pending, $user->email),
            ] : null,
            'recoveryCodes' => $request->session()->pull('admin_mfa_recovery_codes'),
        ]);
    }

    public function startEnroll(Request $request, AdminMfaService $mfa): RedirectResponse
    {
        $this->assertPassword($request);
        $mfa->beginEnrollment($request->user(), $request);

        return back();
    }

    public function confirmEnroll(Request $request, AdminMfaService $mfa): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:16'],
        ]);

        $codes = $mfa->confirmEnrollment($request->user(), $request, $data['code']);
        $request->session()->forget('admin_mfa_must_reenroll');
        $request->session()->flash('admin_mfa_recovery_codes', $codes);

        return redirect()->route('two-factor.enroll')->with('status', 'mfa-enrolled');
    }

    public function disable(Request $request, AdminMfaService $mfa): RedirectResponse
    {
        $this->assertPassword($request);
        $data = $request->validate([
            'code' => ['required', 'string', 'max:32'],
        ]);

        $user = $request->user();
        try {
            $mfa->verifyChallenge($user, $request, $data['code']);
        } catch (ValidationException) {
            $mfa->consumeRecoveryCode($user, $request, $data['code']);
        }

        $mfa->disable($user, $request);

        return redirect()->route('profile.edit')->with('status', '2fa-disabled');
    }

    private function assertPassword(Request $request): void
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->input('password'), $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => 'The password is incorrect.',
            ]);
        }
    }
}
