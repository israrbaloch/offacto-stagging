<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordOtpMail;
use App\Models\PasswordOtp;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordOtpController extends Controller
{
    public function request(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function send(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $this->issueOtp($request->email);

        $request->session()->put('password_reset_email', $request->email);

        return redirect()->route('password.otp')
            ->with('status', 'If an account exists for that email, we sent a 6-digit code.');
    }

    public function showVerify(Request $request): Response|RedirectResponse
    {
        $email = $request->session()->get('password_reset_email');

        if (!$email) {
            return redirect()->route('password.request');
        }

        $otp = PasswordOtp::where('email', $email)->first();

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $email,
            'expiresAt' => ($otp?->expires_at ?? now()->addMinutes(10))->toIso8601String(),
            'resendAt' => $otp?->resendAvailableAt()?->toIso8601String() ?? now()->addSeconds(60)->toIso8601String(),
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ]);

        $email = $request->session()->get('password_reset_email');
        if (!$email) {
            return redirect()->route('password.request');
        }

        $otp = PasswordOtp::where('email', $email)->first();

        if (!$otp || $otp->isExpired()) {
            throw ValidationException::withMessages([
                'code' => ['This code has expired. Please request a new one.'],
            ]);
        }

        if ($otp->attempts >= 5) {
            throw ValidationException::withMessages([
                'code' => ['Too many attempts. Please request a new code.'],
            ]);
        }

        $otp->increment('attempts');

        if (!Hash::check($request->code, $otp->code_hash)) {
            throw ValidationException::withMessages([
                'code' => ['The code you entered is incorrect.'],
            ]);
        }

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
        if (!$email) {
            return redirect()->route('password.request');
        }

        $otp = PasswordOtp::where('email', $email)->first();
        $availableAt = $otp?->resendAvailableAt();

        if ($availableAt && $availableAt->isFuture()) {
            throw ValidationException::withMessages([
                'code' => ['Please wait before requesting another code.'],
            ]);
        }

        $this->issueOtp($email);

        return back()->with('status', 'A new code has been sent if that email is registered.');
    }

    public function showReset(Request $request): Response|RedirectResponse
    {
        $email = $request->session()->get('password_reset_email');
        $token = $request->session()->get('password_reset_token');

        if (!$email || !$token) {
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

        if (!$email || !$token) {
            return redirect()->route('password.request');
        }

        $otp = PasswordOtp::where('email', $email)->first();

        if (
            !$otp
            || !$otp->verified_at
            || !$otp->reset_token_hash
            || $otp->isExpired()
            || !Hash::check($token, $otp->reset_token_hash)
        ) {
            throw ValidationException::withMessages([
                'password' => ['This reset session is invalid or has expired. Please start again.'],
            ]);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
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
        if (!$user) {
            return;
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        PasswordOtp::updateOrCreate(
            ['email' => $email],
            [
                'code_hash' => Hash::make($code),
                'reset_token_hash' => null,
                'attempts' => 0,
                'expires_at' => now()->addMinutes(10),
                'verified_at' => null,
                'last_sent_at' => now(),
            ]
        );

        Mail::to($user->email)->send(new PasswordOtpMail($user, $code));
    }
}
