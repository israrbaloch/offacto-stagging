<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeEmail;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\EmailOtpService;
use App\Support\OtpFlow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisterEmailVerificationController extends Controller
{
    public function __construct(private EmailOtpService $otp) {}

    public function show(Request $request): Response|RedirectResponse
    {
        if (OtpFlow::current($request) !== OtpFlow::REGISTRATION) {
            return redirect()->route('login');
        }

        $email = $request->session()->get('email_verification_email');
        if (! $email) {
            return redirect()->route('login');
        }

        $otp = $this->otp->find($email, EmailOtpService::PURPOSE_EMAIL_VERIFICATION);

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $email,
            'expiresAt' => ($otp?->expires_at ?? now()->addMinutes(10))->toIso8601String(),
            'resendAt' => $otp?->resendAvailableAt()?->toIso8601String() ?? now()->addSeconds(60)->toIso8601String(),
            'otpContext' => OtpFlow::REGISTRATION,
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ]);

        $email = $request->session()->get('email_verification_email');
        if (! $email) {
            return redirect()->route('login');
        }

        $this->otp->verifyCode($email, $request->code, EmailOtpService::PURPOSE_EMAIL_VERIFICATION);

        $user = User::where('email', $email)->first();
        if (! $user) {
            return redirect()->route('login');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $this->otp->find($email, EmailOtpService::PURPOSE_EMAIL_VERIFICATION)?->delete();

        $remember = (bool) $request->session()->pull('email_verification_remember', false);
        OtpFlow::clear($request);

        if (! $user->isActive()) {
            throw ValidationException::withMessages([
                'code' => ['Your account has been deactivated. Please contact support.'],
            ]);
        }

        if (! $user->hasRole('admin') && ! $user->hasActiveCompany()) {
            return redirect()->route('login')
                ->with('status', 'Email verified. Your company is pending approval — you can sign in once it is approved.');
        }

        Auth::login($user, $remember);
        $request->session()->regenerate();

        $activeCompany = $user->activeCompany();
        if ($activeCompany) {
            $user->setActiveCompanyId($activeCompany->id);
        }

        if (SiteSetting::getBoolean('send_welcome_email', true)) {
            Mail::to($user->email)->send(new WelcomeEmail($user));
        }

        return redirect()->intended(route('dashboard', absolute: false))
            ->with('status', 'Your email is verified. Welcome!');
    }

    public function resend(Request $request): RedirectResponse
    {
        $email = $request->session()->get('email_verification_email');
        if (! $email) {
            return redirect()->route('login');
        }

        $otp = $this->otp->find($email, EmailOtpService::PURPOSE_EMAIL_VERIFICATION);
        $availableAt = $otp?->resendAvailableAt();

        if ($availableAt && $availableAt->isFuture()) {
            return redirect()
                ->route('register.verify')
                ->withErrors(['code' => 'Please wait before requesting another code.']);
        }

        $user = User::where('email', $email)->first();
        if ($user && ! $user->hasVerifiedEmail()) {
            $this->otp->issue($user, EmailOtpService::PURPOSE_EMAIL_VERIFICATION);
        }

        return redirect()
            ->route('register.verify')
            ->with('status', 'A new code has been sent to your email.');
    }

    public function cancel(Request $request): RedirectResponse
    {
        OtpFlow::clear($request);

        return redirect()
            ->route('login')
            ->with('status', 'Email verification cancelled. Sign in or register to try again.');
    }

    public static function beginVerification(Request $request, User $user, bool $remember = false): RedirectResponse
    {
        app(EmailOtpService::class)->issue($user, EmailOtpService::PURPOSE_EMAIL_VERIFICATION);

        OtpFlow::startRegistration($request, $user->email, $remember);

        return redirect()->route('register.verify')
            ->with('status', 'We sent a 6-digit verification code to your email.');
    }
}
