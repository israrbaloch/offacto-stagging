<?php

namespace App\Support;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class CompanyAccess
{
    public static function writeBlockReason(
        ?User $user,
        ?Company $company,
        bool $sending = false,
        ?string $capabilityKey = null,
        ?string $limitKey = null,
    ): ?string {
        if ($user?->hasRole('admin')) {
            return null;
        }

        if (! $company) {
            return 'Select or create a company first.';
        }

        $company->loadMissing('statusRelation');

        if ($company->isSubscriptionExpired()) {
            return 'Your subscription period has ended. You can still view existing records. Renew or choose a plan on the Upgrade page to continue creating and sending.';
        }

        if ($company->isTrialExpired()) {
            return 'Your 14-day trial has ended. You can still view existing records. Choose a plan on the Upgrade page to continue creating and sending.';
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

        if ($capabilityKey) {
            $capReason = PlanEntitlements::blockCapabilityReason($user, $company, $capabilityKey);
            if ($capReason) {
                return $capReason;
            }
        }

        if ($limitKey) {
            $limitReason = PlanEntitlements::limitExceededReason($company, $limitKey);
            if ($limitReason) {
                return $limitReason;
            }
        }

        return null;
    }

    public static function denyWrite(
        ?User $user,
        ?Company $company,
        bool $sending = false,
        ?string $capabilityKey = null,
        ?string $limitKey = null,
    ): ?RedirectResponse {
        $reason = self::writeBlockReason($user, $company, $sending, $capabilityKey, $limitKey);

        return $reason ? redirect()->back()->with('error', $reason) : null;
    }

    public static function denySend(
        ?User $user,
        ?Company $company,
        ?string $capabilityKey = null,
    ): ?RedirectResponse {
        return self::denyWrite($user, $company, true, $capabilityKey);
    }

    public static function denyCreate(
        ?User $user,
        ?Company $company,
        string $limitKey,
        string $createCapabilityKey,
    ): ?RedirectResponse {
        if ($user?->hasRole('admin')) {
            return null;
        }

        $reason = PlanEntitlements::blockCreateReason($user, $company, $limitKey, $createCapabilityKey);

        return $reason ? redirect()->back()->with('error', $reason) : null;
    }
}
