<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\CompanyDeletionRequest;
use App\Models\ComplianceLegalHold;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompanyDeletionGuard
{
    public function hasActiveHold(Company $company): bool
    {
        return $this->activeHoldQuery($company)->exists();
    }

    /**
     * Abort if an applicable legal hold exists. Call inside a transaction that
     * already locked the company row when completing deletion.
     */
    public function assertCanComplete(Company $company, ?CompanyDeletionRequest $deletionRequest = null): void
    {
        if ($deletionRequest?->legal_hold) {
            $this->deny($company, 'deletion_request_flag');
        }

        if ($this->activeHoldQuery($company)->lockForUpdate()->exists()) {
            $this->deny($company, 'compliance_legal_hold');
        }
    }

    public function assertJobCanProceed(?int $companyId): void
    {
        if ($companyId === null) {
            if (ComplianceLegalHold::query()->where('status', 'active')->whereNull('released_at')->exists()) {
                throw ValidationException::withMessages([
                    'status' => 'An active legal hold prevents this deletion job from proceeding.',
                ]);
            }

            return;
        }

        $company = Company::query()->find($companyId);
        if ($company && $this->hasActiveHold($company)) {
            $this->deny($company, 'compliance_deletion_job');
        }
    }

    /**
     * Shared lock + hold check for any future purge worker. Does not perform deletion.
     */
    public function withDeletionLock(Company $company, callable $callback): mixed
    {
        return DB::transaction(function () use ($company, $callback) {
            $locked = Company::query()->whereKey($company->id)->lockForUpdate()->firstOrFail();
            $this->assertCanComplete($locked);

            return $callback($locked);
        });
    }

    private function activeHoldQuery(Company $company)
    {
        return ComplianceLegalHold::query()
            ->where('status', 'active')
            ->whereNull('released_at')
            ->where(function ($query) use ($company) {
                $query->whereNull('company_id')->orWhere('company_id', $company->id);
            });
    }

    private function deny(Company $company, string $reason): never
    {
        ActivityLog::record(
            'admin.company.deletion_blocked_legal_hold',
            subject: $company,
            outcome: 'denied',
            companyId: $company->id,
            metadata: ['reason' => $reason],
        );

        throw ValidationException::withMessages([
            'status' => 'An active legal hold prevents deletion or anonymization of this company.',
        ]);
    }
}
