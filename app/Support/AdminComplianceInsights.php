<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\ComplianceAuthorityRequest;
use App\Models\ComplianceBreachIncident;
use App\Models\ComplianceConsentRecord;
use App\Models\ComplianceDataSubjectRequest;
use App\Models\ComplianceDeletionJob;
use App\Models\ComplianceLegalHold;
use App\Models\ComplianceCase;
use App\Models\Invoice;
use App\Models\PlatformLegalNotice;
use App\Models\SecurityEvent;
use App\Models\SiteSetting;
use App\Models\User;

final class AdminComplianceInsights
{
    /**
     * @return array<string, mixed>
     */
    public static function dashboard(): array
    {
        $openDsar = ComplianceDataSubjectRequest::query()
            ->whereNull('closed_at')
            ->whereNotIn('status', ['completed', 'rejected'])
            ->count();
        $overdueDsar = ComplianceDataSubjectRequest::query()
            ->whereNull('closed_at')
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->count();
        $pendingAuthority = ComplianceAuthorityRequest::query()
            ->whereNotIn('status', [ComplianceAuthorityRequest::STATUS_CLOSED, ComplianceAuthorityRequest::STATUS_REJECTED])
            ->count();
        $emergencyOpen = ComplianceAuthorityRequest::query()
            ->where('is_emergency', true)
            ->whereNotIn('status', [ComplianceAuthorityRequest::STATUS_CLOSED, ComplianceAuthorityRequest::STATUS_REJECTED])
            ->count();

        return [
            'open_dsar' => $openDsar,
            'overdue_dsar' => $overdueDsar,
            'active_holds' => ComplianceLegalHold::query()->where('status', 'active')->count(),
            'pending_deletion' => ComplianceDeletionJob::query()->whereIn('status', ['pending', 'approved'])->count(),
            'open_breaches' => ComplianceBreachIncident::query()->where('status', '!=', 'closed')->count(),
            'pending_authority' => $pendingAuthority,
            'emergency_authority' => $emergencyOpen,
            'open_cases' => ComplianceCase::query()->where('status', 'open')->count(),
            'retention_review_due' => self::retentionReviewDueCount(),
        ];
    }

    public static function retentionReviewDueCount(): int
    {
        $years = max(1, SiteSetting::getInteger('comp_retention_invoices_years', 7));

        return Invoice::query()
            ->whereNull('deleted_at')
            ->where('created_at', '<', now()->subYears($years))
            ->count();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function legalNotices(int $limit = 50): array
    {
        return PlatformLegalNotice::query()
            ->with('createdBy:id,name')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get()
            ->map(fn (PlatformLegalNotice $n) => [
                'id' => $n->id,
                'type' => $n->type,
                'locale' => $n->locale,
                'version_label' => $n->version_label,
                'title' => $n->title,
                'published_at' => $n->published_at?->toIso8601String(),
                'superseded_at' => $n->superseded_at?->toIso8601String(),
                'author' => $n->createdBy?->name,
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function consentRecords(int $limit = 50): array
    {
        return ComplianceConsentRecord::query()
            ->with('user:id,name,email')
            ->orderByDesc('accepted_at')
            ->limit($limit)
            ->get()
            ->map(fn (ComplianceConsentRecord $r) => [
                'id' => $r->id,
                'consent_type' => $r->consent_type,
                'email' => $r->email ?? $r->user?->email,
                'notice_version' => $r->notice_version,
                'accepted_at' => $r->accepted_at->toIso8601String(),
                'withdrawn_at' => $r->withdrawn_at?->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function dataSubjectRequests(int $limit = 50): array
    {
        return ComplianceDataSubjectRequest::query()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (ComplianceDataSubjectRequest $r) => [
                'id' => $r->id,
                'reference' => $r->reference,
                'request_type' => $r->request_type,
                'status' => $r->status,
                'subject_email' => $r->subject_email,
                'due_at' => $r->due_at?->toIso8601String(),
                'identity_verified_at' => $r->identity_verified_at?->toIso8601String(),
                'closed_at' => $r->closed_at?->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function authorityRequests(?string $statusFilter = null, int $limit = 50): array
    {
        $q = ComplianceAuthorityRequest::query()->with('reviewer:id,name')->orderByDesc('received_at');
        if ($statusFilter === 'review') {
            $q->whereIn('status', [
                ComplianceAuthorityRequest::STATUS_RECEIVED,
                ComplianceAuthorityRequest::STATUS_VERIFICATION,
                ComplianceAuthorityRequest::STATUS_LEGAL_REVIEW,
            ]);
        }
        if ($statusFilter === 'emergency') {
            $q->where('is_emergency', true);
        }

        return $q->limit($limit)->get()->map(fn (ComplianceAuthorityRequest $r) => [
            'id' => $r->id,
            'reference' => $r->reference,
            'requesting_authority' => $r->requesting_authority,
            'jurisdiction' => $r->jurisdiction,
            'status' => $r->status,
            'is_emergency' => $r->is_emergency,
            'received_at' => $r->received_at->toIso8601String(),
            'verified_at' => $r->verified_at?->toIso8601String(),
            'reviewer' => $r->reviewer?->name,
        ])->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function privacyAccessSignals(int $limit = 40): array
    {
        $adminIds = User::query()->whereHas('roles', fn ($q) => $q->where('name', 'admin'))->pluck('id');

        $rows = ActivityLog::query()
            ->whereIn('user_id', $adminIds)
            ->where('created_at', '>=', now()->subDays(30))
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'at' => $log->created_at->toIso8601String(),
                'actor_id' => $log->user_id,
                'action' => $log->action,
                'outcome' => $log->outcome,
                'subject' => $log->subject_type ? class_basename($log->subject_type).' #'.$log->subject_id : null,
            ])
            ->all();

        $failedPrivileged = SecurityEvent::query()
            ->where('created_at', '>=', now()->subDays(30))
            ->where('outcome', 'failure')
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(fn (SecurityEvent $e) => [
                'at' => $e->created_at->toIso8601String(),
                'type' => $e->event_type,
                'email' => $e->email,
                'outcome' => $e->outcome,
            ])
            ->all();

        return [
            'admin_activity' => $rows,
            'failed_access' => $failedPrivileged,
            'note' => 'Review patterns only — this is not a surveillance dashboard. Investigate anomalies through documented compliance cases.',
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function peppolMonitoring(int $limit = 30): array
    {
        return Invoice::query()
            ->whereNotNull('peppol_sent_at')
            ->orderByDesc('peppol_sent_at')
            ->limit($limit)
            ->get(['id', 'invoice_number', 'peppol_sent_at', 'updated_at'])
            ->map(fn (Invoice $i) => [
                'document' => $i->invoice_number,
                'sent_at' => $i->peppol_sent_at?->toIso8601String(),
                'status' => 'sent',
            ])
            ->all();
    }
}
