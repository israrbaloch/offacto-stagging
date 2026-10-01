<?php

namespace App\Support;

class OtpFlow
{
    public const SESSION_FLOW = 'otp_flow';

    public const REGISTRATION = 'registration';

    public const PASSWORD_RESET = 'password_reset';

    public static function startRegistration(\Illuminate\Http\Request $request, string $email, bool $remember = false): void
    {
        $request->session()->put(self::SESSION_FLOW, self::REGISTRATION);
        $request->session()->put('email_verification_email', $email);
        $request->session()->put('email_verification_remember', $remember);
        $request->session()->forget(['password_reset_email', 'password_reset_token']);
    }

    public static function startPasswordReset(\Illuminate\Http\Request $request, string $email): void
    {
        $request->session()->put(self::SESSION_FLOW, self::PASSWORD_RESET);
        $request->session()->put('password_reset_email', $email);
        $request->session()->forget(['password_reset_token', 'email_verification_email', 'email_verification_remember']);
    }

    public static function clear(\Illuminate\Http\Request $request): void
    {
        $request->session()->forget([
            self::SESSION_FLOW,
            'email_verification_email',
            'email_verification_remember',
            'password_reset_email',
            'password_reset_token',
        ]);
    }

    public static function current(\Illuminate\Http\Request $request): ?string
    {
        $flow = $request->session()->get(self::SESSION_FLOW);

        if (in_array($flow, [self::REGISTRATION, self::PASSWORD_RESET], true)) {
            return $flow;
        }

        if ($request->session()->has('email_verification_email')) {
            return self::REGISTRATION;
        }

        if ($request->session()->has('password_reset_email')) {
            return self::PASSWORD_RESET;
        }

        return null;
    }
}
