<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailOtpService;
use App\Support\OtpFlow;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordOtpController extends Controller
{
    public function __construct(private EmailOtpService $otp) {}

    public function request(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function send(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        OtpFlow::startPasswordReset($request, $request->email);
        $this->issueOtp($request->email);

        return redirect()->route('password.otp')
            ->with('status', 'If an account exists for that email, we sent a 6-digit code.');
    }

    public function showVerify(Request $request): Response|RedirectResponse
    {
        if (OtpFlow::current($request) !== OtpFlow::PASSWORD_RESET) {
            return redirect()->route('password.request');
        }

        $email = $request->session()->get('password_reset_email');
        if (! $email) {
            return redirect()->route('password.request');
        }

        $otp = $this->otp->find($email, EmailOtpService::PURPOSE_PASSWORD_RESET);

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $email,
            'expiresAt' => ($otp?->expires_at ?? now()->addMinutes(10))->toIso8601String(),
            'resendAt' => $otp?->resendAvailableAt()?->toIso8601String() ?? now()->addSeconds(60)->toIso8601String(),
            'otpContext' => OtpFlow::PASSWORD_RESET,
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ]);

        $email = $request->session()->get('password_reset_email');
        if (! $email) {
            return redirect()->route('password.request');
        }

        $otp = $this->otp->verifyCode($email, $request->code, EmailOtpService::PURPOSE_PASSWORD_RESET);

        $resetToken = Str::random(64);
        $otp->update([
            'verified_at' => now(),
            'reset_token_hash' => Hash::make($resetToken),
            'attempts' => 0,
        ]);

        $request->session()->put('password_reset_token', $resetToken);

        return redirect()->route('password.reset');
    }

    public function resend(Request $request): RedirectResponse
    {
        $email = $request->session()->get('password_reset_email');
        if (! $email) {
            return redirect()->route('password.request');
        }

        $otp = $this->otp->find($email, EmailOtpService::PURPOSE_PASSWORD_RESET);
        $availableAt = $otp?->resendAvailableAt();

        if ($availableAt && $availableAt->isFuture()) {
            return redirect()
                ->route('password.otp')
                ->withErrors(['code' => 'Please wait before requesting another code.']);
        }

        $this->issueOtp($email);

        return redirect()
            ->route('password.otp')
            ->with('status', 'A new code has been sent if that email is registered.');
    }

    public function cancel(Request $request): RedirectResponse
    {
        OtpFlow::clear($request);

        return redirect()
            ->route('password.request')
            ->with('status', 'Enter your email to receive a new reset code.');
    }

    public function showReset(Request $request): Response|RedirectResponse
    {
        $email = $request->session()->get('password_reset_email');
        $token = $request->session()->get('password_reset_token');

        if (! $email || ! $token) {
            return redirect()->route('password.request');
        }

        return Inertia::render('Auth/ResetPassword', [
            'email' => $email,
        ]);
    }

    public function reset(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::min(8)->numbers()->symbols()],
        ]);

        $email = $request->session()->get('password_reset_email');
        $token = $request->session()->get('password_reset_token');

        if (! $email || ! $token) {
            return redirect()->route('password.request');
        }

        $otp = $this->otp->find($email, EmailOtpService::PURPOSE_PASSWORD_RESET);

        if (
            ! $otp
            || ! $otp->verified_at
            || ! $otp->reset_token_hash
            || $otp->isExpired()
            || ! Hash::check($token, $otp->reset_token_hash)
        ) {
            throw ValidationException::withMessages([
                'password' => ['This reset session is invalid or has expired. Please start again.'],
            ]);
        }

        $user = User::where('email', $email)->first();
        if (! $user) {
            return redirect()->route('password.request');
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
        ])->save();

        event(new PasswordReset($user));
        $otp->delete();
        $request->session()->forget(['password_reset_email', 'password_reset_token']);

        return redirect()->route('login')->with('status', 'Your password has been updated. You can sign in now.');
    }

    private function issueOtp(string $email): void
    {
        $user = User::where('email', $email)->first();
        if (! $user) {
            return;
        }

        $this->otp->issue($user, EmailOtpService::PURPOSE_PASSWORD_RESET);
    }
}
