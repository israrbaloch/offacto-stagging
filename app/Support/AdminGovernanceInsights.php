<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\GovBulkOperation;
use App\Models\GovExportJob;
use App\Models\GovImportJob;
use App\Models\GovRunbook;
use App\Models\GovScheduledConfigChange;
use App\Models\SupportAccessRequest;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

final class AdminGovernanceInsights
{
    /**
     * @return array<string, mixed>
     */
    public static function dashboard(): array
    {
        $pendingApprovals = count(self::approvalQueue());

        return [
            'environment' => GovernancePolicy::environmentLabel(),
            'pending_approvals' => $pendingApprovals,
            'scheduled_changes' => Schema::hasTable('gov_scheduled_config_changes')
                ? GovScheduledConfigChange::query()->where('status', 'scheduled')->count()
                : 0,
            'open_exports' => Schema::hasTable('gov_export_jobs')
                ? GovExportJob::query()->whereIn('status', ['pending', 'ready'])->count()
                : 0,
            'draft_bulk' => Schema::hasTable('gov_bulk_operations')
                ? GovBulkOperation::query()->where('status', 'draft')->count()
                : 0,
            'reconciliation_flags' => count(AdminInfrastructureInsights::integrityIssues()),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function approvalQueue(): array
    {
        $items = [];

        if (Schema::hasTable('companies')) {
            Company::query()->pending()->limit(30)->get(['id', 'company_name', 'created_at'])->each(function (Company $c) use (&$items) {
                $items[] = [
                    'kind' => 'company_registration',
                    'title' => 'Company pending approval',
                    'detail' => $c->company_name,
                    'href' => '/admin/companies/approvals',
                    'created_at' => $c->created_at?->toIso8601String(),
                ];
            });
        }

        if (Schema::hasTable('support_access_requests')) {
            SupportAccessRequest::query()->where('status', 'pending')->with('company:id,company_name')->limit(20)->get()->each(function (SupportAccessRequest $r) use (&$items) {
                $items[] = [
                    'kind' => 'support_access',
                    'title' => 'Support access approval',
                    'detail' => $r->company?->company_name ?? $r->reference,
                    'href' => '/admin/support/operations/access-approvals',
                    'created_at' => $r->created_at?->toIso8601String(),
                ];
            });
        }

        return collect($items)->sortByDesc('created_at')->values()->all();
    }

    /**
     * @return array{count: int, sample: list<string>, summary: string}
     */
    public static function bulkPreview(string $operation, array $parameters = []): array
    {
        return match ($operation) {
            'deactivate_dormant_companies' => self::previewDormantCompanies($parameters),
            'remind_unverified_users' => self::previewUnverifiedUsers($parameters),
            default => ['count' => 0, 'sample' => [], 'summary' => 'Unknown operation.'],
        };
    }

    /**
     * @return array{count: int, sample: list<string>, summary: string}
     */
    private static function previewDormantCompanies(array $parameters): array
    {
        $days = max(30, (int) ($parameters['inactive_days'] ?? 180));
        $query = Company::query()->inactive()->where('updated_at', '<', now()->subDays($days));
        $count = (clone $query)->count();
        $sample = (clone $query)->limit(5)->pluck('company_name')->all();

        return [
            'count' => $count,
            'sample' => $sample,
            'summary' => "{$count} inactive companies not updated in {$days}+ days.",
        ];
    }

    /**
     * @return array{count: int, sample: list<string>, summary: string}
     */
    private static function previewUnverifiedUsers(array $parameters): array
    {
        $query = User::query()->whereNull('email_verified_at');
        $count = (clone $query)->count();
        $sample = (clone $query)->limit(5)->pluck('email')->all();

        return [
            'count' => $count,
            'sample' => $sample,
            'summary' => "{$count} users without verified email.",
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function auditSearch(?string $q, int $limit = 50): array
    {
        $query = ActivityLog::query()->with('user:id,name,email')->latest();

        if ($q = trim((string) $q)) {
            $query->where(function ($builder) use ($q) {
                $builder->where('action', 'like', "%{$q}%")
                    ->orWhere('metadata', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$q}%")->orWhere('name', 'like', "%{$q}%"));
            });
        }

        return $query->limit($limit)->get()->map(fn (ActivityLog $log) => [
            'id' => $log->id,
            'action' => $log->action,
            'outcome' => $log->outcome,
            'user' => $log->user?->only(['id', 'name', 'email']),
            'metadata' => $log->metadata,
            'created_at' => $log->created_at?->toIso8601String(),
        ])->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function adminAccessReview(): array
    {
        return User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', 'admin'))
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'is_active', 'email_verified_at', 'updated_at'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'is_active' => $u->is_active,
                'email_verified_at' => $u->email_verified_at?->toIso8601String(),
                'last_activity' => $u->updated_at?->toIso8601String(),
                'inactive_privileged' => $u->is_active && $u->updated_at && $u->updated_at->lt(now()->subDays(90)),
            ])
            ->all();
    }

    public static function seedRunbooks(): void
    {
        if (! Schema::hasTable('gov_runbooks') || GovRunbook::query()->exists()) {
            return;
        }

        $defaults = [
            ['slug' => 'payment-outage', 'title' => 'Mollie payment outage', 'category' => 'payment', 'body' => "1. Confirm provider status\n2. Enable maintenance message\n3. Pause subscription processing\n4. Communicate ETA to support"],
            ['slug' => 'integration-failure', 'title' => 'Integration webhook failures', 'category' => 'integration', 'body' => "1. Review integration failure queue\n2. Verify credentials and endpoint\n3. Replay safe jobs after fix"],
            ['slug' => 'security-incident', 'title' => 'Security incident response', 'category' => 'security', 'body' => "1. Open security incident record\n2. Restrict affected accounts\n3. Preserve audit logs\n4. Notify DPO if personal data involved"],
        ];

        foreach ($defaults as $row) {
            GovRunbook::create([...$row, 'version' => '1.0', 'published' => true]);
        }
    }
}
