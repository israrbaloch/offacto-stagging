<?php

namespace App\Services;

use App\Mail\Admin\CompanyApproved;
use App\Mail\Admin\CompanyRejected;
use App\Mail\Admin\CompanyStatusChanged;
use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\CompanyStatusEvent;
use App\Models\Status;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class CompanyAdminWorkflow
{
    public function approve(Company $company, User $actor, ?string $reason = null): void
    {
        $previous = $company->status;
        $company->approve($actor->id);
        $company->refresh();

        $this->record($company, $actor, 'approved', $reason, $previous, $company->status);
        ActivityLog::record('admin.company.approved', subject: $company, companyId: $company->id, metadata: [
            'reason' => $reason,
        ]);

        if ($company->email) {
            Mail::to($company->email)->send(new CompanyApproved($company));
        }
    }

    public function reject(Company $company, User $actor, ?string $reason = null): void
    {
        $previous = $company->status;
        $company->reject();
        $company->refresh();

        $this->record($company, $actor, 'rejected', $reason, $previous, $company->status);
        ActivityLog::record('admin.company.rejected', subject: $company, companyId: $company->id, metadata: [
            'reason' => $reason,
        ]);

        if ($company->email) {
            Mail::to($company->email)->send(new CompanyRejected($company, $reason));
        }
    }

    public function requestInfo(Company $company, User $actor, string $message): void
    {
        $this->record($company, $actor, 'info_requested', $message, $company->status, $company->status, [
            'message' => $message,
        ]);
        ActivityLog::record('admin.company.info_requested', subject: $company, companyId: $company->id, metadata: [
            'message' => $message,
        ]);
    }

    public function applyStatus(Company $company, User $actor, string $action, ?string $reason = null): void
    {
        $previous = $company->status;

        match ($action) {
            'activate' => $this->activateCompany($company),
            'suspend' => $company->suspend(),
            'restrict' => $this->restrictCompany($company),
            'deactivate' => $company->deactivate(),
            default => throw new \InvalidArgumentException("Unknown status action: {$action}"),
        };

        $company->refresh();
        $this->record($company, $actor, $action, $reason, $previous, $company->status);
        ActivityLog::record('admin.company.status_'.$action, subject: $company, companyId: $company->id, metadata: [
            'reason' => $reason,
        ]);

        if (in_array($action, ['activate', 'deactivate'], true) && $company->email) {
            Mail::to($company->email)->send(new CompanyStatusChanged($company, $company->is_active));
        }
    }

    protected function activateCompany(Company $company): void
    {
        $approved = Status::where('name', 'Approved')->where('for', 'companies')->first();
        $company->update([
            'is_active' => true,
            'status' => $approved?->id ?? $company->status,
        ]);
    }

    protected function restrictCompany(Company $company): void
    {
        $restricted = Status::where('name', 'Restricted')->where('for', 'companies')->first();
        $company->update([
            'is_active' => true,
            'status' => $restricted?->id ?? $company->status,
        ]);
    }

    protected function record(
        Company $company,
        User $actor,
        string $action,
        ?string $reason,
        ?int $previousStatusId,
        ?int $newStatusId,
        ?array $metadata = null,
    ): void {
        CompanyStatusEvent::create([
            'company_id' => $company->id,
            'user_id' => $actor->id,
            'action' => $action,
            'reason' => $reason,
            'previous_status_id' => $previousStatusId,
            'new_status_id' => $newStatusId,
            'metadata' => $metadata,
        ]);
    }
}
