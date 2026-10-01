<?php

namespace App\Services;

use App\Mail\PasswordOtpMail;
use App\Models\PasswordOtp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class EmailOtpService
{
    public const PURPOSE_PASSWORD_RESET = 'password_reset';

    public const PURPOSE_EMAIL_VERIFICATION = 'email_verification';

    public function issue(User $user, string $purpose): void
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        PasswordOtp::updateOrCreate(
            [
                'email' => $user->email,
                'purpose' => $purpose,
            ],
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

    public function find(string $email, string $purpose): ?PasswordOtp
    {
        return PasswordOtp::query()
            ->where('email', $email)
            ->where('purpose', $purpose)
            ->first();
    }

    /**
     * @throws ValidationException
     */
    public function verifyCode(string $email, string $code, string $purpose): PasswordOtp
    {
        $otp = $this->find($email, $purpose);

        if (! $otp || $otp->isExpired()) {
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

        if (! Hash::check($code, $otp->code_hash)) {
            throw ValidationException::withMessages([
                'code' => ['The code you entered is incorrect.'],
            ]);
        }

        return $otp;
    }
}
