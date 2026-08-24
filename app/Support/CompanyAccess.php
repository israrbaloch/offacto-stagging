<?php

namespace App\Support;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class CompanyAccess
{
    public static function writeBlockReason(?User $user, ?Company $company, bool $sending = false): ?string
    {
        if ($user?->hasRole('admin')) {
            return null;
        }

        if (! $company) {
            return 'Select or create a company first.';
        }

        $company->loadMissing('statusRelation');

        if ($company->isTrialExpired()) {
            return 'Your 14-day trial has ended. You can still view existing records.';
        }

        if ($sending && $company->isPendingApproval()) {
            return 'This company is pending approval. You cannot send quotations until it is approved.';
        }

        if (! $company->is_active && ! $company->isPendingApproval()) {
            return 'This company is inactive. You cannot create or send new records.';
        }

        if ($sending && ! $company->is_active) {
            return 'This company is inactive. You cannot send quotations.';
        }

        return null;
    }

    public static function denyWrite(?User $user, ?Company $company, bool $sending = false): ?RedirectResponse
    {
        $reason = self::writeBlockReason($user, $company, $sending);

        return $reason ? redirect()->back()->with('error', $reason) : null;
    }

    public static function denySend(?User $user, ?Company $company): ?RedirectResponse
    {
        return self::denyWrite($user, $company, true);
    }
}
