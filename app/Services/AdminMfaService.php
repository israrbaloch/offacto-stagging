<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\UserMfaCredential;
use App\Support\SecurityPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminMfaService
{
    public const SESSION_VERIFIED = 'admin_mfa_verified';

    public const SESSION_PENDING_SECRET = 'admin_mfa_pending_secret';

    public const MAX_ATTEMPTS = 5;

    public function __construct(private TotpService $totp) {}

    public function isRequiredFor(?User $user): bool
    {
        if (! $user || ! \App\Support\AdminAccess::canAccessAdminArea($user)) {
            return false;
        }

        return SecurityPolicy::adminMfaRequired();
    }

    public function isVerified(Request $request): bool
    {
        return (bool) $request->session()->get(self::SESSION_VERIFIED);
    }

    public function markVerified(Request $request): void
    {
        $request->session()->put(self::SESSION_VERIFIED, true);
        $request->session()->forget(self::SESSION_PENDING_SECRET);
    }

    public function clearVerified(Request $request): void
    {
        $request->session()->forget(self::SESSION_VERIFIED);
        $request->session()->forget(self::SESSION_PENDING_SECRET);
    }

    public function confirmedCredential(User $user): ?UserMfaCredential
    {
        $credential = $user->mfaCredential;

        return $credential?->isConfirmed() ? $credential : null;
    }

    /**
     * @return array{secret: string, uri: string}
     */
    public function beginEnrollment(User $user, Request $request): array
    {
        $secret = $this->totp->generateSecret();
        $request->session()->put(self::SESSION_PENDING_SECRET, $secret);

        return [
            'secret' => $secret,
            'uri' => $this->totp->provisioningUri($secret, $user->email),
        ];
    }

    /**
     * @return list<string> Plain recovery codes shown once.
     */
    public function confirmEnrollment(User $user, Request $request, string $code): array
    {
        $secret = $request->session()->get(self::SESSION_PENDING_SECRET);
        if (! is_string($secret) || $secret === '') {
            throw ValidationException::withMessages([
                'code' => 'Start enrollment again. The setup secret expired.',
            ]);
        }

        if (! $this->totp->verify($secret, $code)) {
            throw ValidationException::withMessages([
                'code' => 'That verification code is not valid.',
            ]);
        }

        $plainCodes = $this->generateRecoveryCodes();
        $hashes = array_map(fn (string $c) => Hash::make($c), $plainCodes);

        UserMfaCredential::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'secret' => $secret,
                'recovery_codes' => $hashes,
                'confirmed_at' => now(),
                'last_used_at' => now(),
                'failed_attempts' => 0,
                'locked_until' => null,
            ],
        );

        $this->markVerified($request);

        ActivityLog::record('admin.mfa.enrolled', actor: $user, request: $request);

        return $plainCodes;
    }

    public function verifyChallenge(User $user, Request $request, string $code): void
    {
        $credential = $this->confirmedCredential($user);
        if (! $credential) {
            throw ValidationException::withMessages([
                'code' => 'Authenticator setup is required first.',
            ]);
        }

        $this->assertNotLocked($credential);

        if (! $this->totp->verify($credential->secret, $code)) {
            $this->recordFailure($credential);
            ActivityLog::record('admin.mfa.verify_failed', actor: $user, outcome: 'failure', request: $request);
            throw ValidationException::withMessages([
                'code' => 'That verification code is not valid.',
            ]);
        }

        $credential->update([
            'failed_attempts' => 0,
            'locked_until' => null,
            'last_used_at' => now(),
        ]);

        $this->markVerified($request);
        ActivityLog::record('admin.mfa.verified', actor: $user, request: $request);
    }

    public function consumeRecoveryCode(User $user, Request $request, string $code): void
    {
        $credential = $this->confirmedCredential($user);
        if (! $credential) {
            throw ValidationException::withMessages([
                'recovery_code' => 'No authenticator is enrolled on this account.',
            ]);
        }

        $this->assertNotLocked($credential);

        $normalized = strtoupper(preg_replace('/\s+/', '', $code) ?? '');
        $hashes = $credential->recovery_codes ?? [];
        $matchedIndex = null;
        foreach ($hashes as $index => $hash) {
            if (is_string($hash) && Hash::check($normalized, $hash)) {
                $matchedIndex = $index;
                break;
            }
        }

        if ($matchedIndex === null) {
            $this->recordFailure($credential);
            ActivityLog::record('admin.mfa.recovery_failed', actor: $user, outcome: 'failure', request: $request);
            throw ValidationException::withMessages([
                'recovery_code' => 'That recovery code is not valid.',
            ]);
        }

        unset($hashes[$matchedIndex]);
        $credential->update([
            'recovery_codes' => array_values($hashes),
            'failed_attempts' => 0,
            'locked_until' => null,
            'last_used_at' => now(),
        ]);

        $this->markVerified($request);
        $request->session()->put('admin_mfa_must_reenroll', true);
        ActivityLog::record('admin.mfa.recovery_used', actor: $user, request: $request, metadata: [
            'remaining_codes' => count($hashes),
        ]);
    }

    public function disable(User $user, Request $request): void
    {
        if ($this->isRequiredFor($user)) {
            throw ValidationException::withMessages([
                'code' => 'MFA is required by platform policy and cannot be turned off.',
            ]);
        }

        $user->mfaCredential()?->delete();
        $this->clearVerified($request);
        ActivityLog::record('admin.mfa.disabled', actor: $user, request: $request);
    }

    /**
     * @return list<string>
     */
    private function generateRecoveryCodes(int $count = 8): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(Str::random(4).'-'.Str::random(4));
        }

        return $codes;
    }

    private function assertNotLocked(UserMfaCredential $credential): void
    {
        if ($credential->isLocked()) {
            throw ValidationException::withMessages([
                'code' => 'Too many attempts. Try again later.',
            ]);
        }
    }

    private function recordFailure(UserMfaCredential $credential): void
    {
        $attempts = $credential->failed_attempts + 1;
        $lockedUntil = $attempts >= self::MAX_ATTEMPTS ? now()->addMinutes(15) : null;
        $credential->update([
            'failed_attempts' => $attempts,
            'locked_until' => $lockedUntil,
        ]);
    }
}
