<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\SiteSetting;
use App\Models\SupportAccessRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class AdminShellInsights
{
    /**
     * @return list<array{id: string, tone: string, title: string, body: string, href: string|null, at: string|null}>
     */
    public static function notifications(): array
    {
        $items = [];

        if (Schema::hasTable('companies')) {
            $pending = Company::query()->pending()->count();
            if ($pending > 0) {
                $items[] = [
                    'id' => 'company-approvals',
                    'tone' => 'warning',
                    'title' => 'Company approvals',
                    'body' => "{$pending} registration(s) awaiting review.",
                    'href' => '/admin/companies/approvals',
                    'at' => now()->toIso8601String(),
                ];
            }
        }

        if (Schema::hasTable('support_access_requests')) {
            $access = SupportAccessRequest::query()->where('status', 'pending')->count();
            if ($access > 0) {
                $items[] = [
                    'id' => 'support-access',
                    'tone' => 'info',
                    'title' => 'Support access',
                    'body' => "{$access} access request(s) pending.",
                    'href' => '/admin/support/operations/access-approvals',
                    'at' => now()->toIso8601String(),
                ];
            }
        }

        if (Schema::hasTable('failed_jobs')) {
            $failed = (int) DB::table('failed_jobs')->count();
            if ($failed > 0) {
                $items[] = [
                    'id' => 'failed-jobs',
                    'tone' => 'danger',
                    'title' => 'Failed queue jobs',
                    'body' => "{$failed} job(s) need attention.",
                    'href' => '/admin/infrastructure/operations/failed-jobs',
                    'at' => now()->toIso8601String(),
                ];
            }
        }

        $approvals = AdminGovernanceInsights::approvalQueue();
        if (count($approvals) > 3) {
            $items[] = [
                'id' => 'governance-queue',
                'tone' => 'warning',
                'title' => 'Approval queue',
                'body' => count($approvals).' items in the governance queue.',
                'href' => '/admin/governance/operations/approval-queue',
                'at' => now()->toIso8601String(),
            ];
        }

        return array_slice($items, 0, 12);
    }

    /**
     * @return array{label: string, show: bool}|null
     */
    public static function environmentBanner(): ?array
    {
        if (! SiteSetting::getBoolean('gov_show_environment_banner', true)) {
            return null;
        }

        $label = SiteSetting::get('gov_environment_label', config('app.env', 'production'));
        if ($label === 'production') {
            return null;
        }

        return [
            'label' => strtoupper((string) $label),
            'show' => true,
        ];
    }

    /**
     * @return list<array{type: string, label: string, href: string, meta: string|null}>
     */
    public static function globalSearch(string $query, int $limit = 8): array
    {
        $q = trim($query);
        if ($q === '') {
            return [];
        }

        $results = [];

        Company::query()
            ->where(function ($builder) use ($q) {
                $builder->where('company_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->limit($limit)
            ->get(['id', 'company_name', 'email'])
            ->each(function (Company $c) use (&$results) {
                $results[] = [
                    'type' => 'company',
                    'label' => $c->company_name,
                    'href' => "/admin/companies/{$c->id}",
                    'meta' => $c->email,
                ];
            });

        if (Schema::hasTable('users')) {
            User::query()
                ->where(function ($builder) use ($q) {
                    $builder->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                })
                ->limit($limit)
                ->get(['id', 'name', 'email'])
                ->each(function ($u) use (&$results) {
                    $results[] = [
                        'type' => 'user',
                        'label' => $u->name,
                        'href' => "/admin/users/{$u->id}",
                        'meta' => $u->email,
                    ];
                });
        }

        if (Schema::hasTable('invoices')) {
            \App\Models\Invoice::query()
                ->where('invoice_number', 'like', "%{$q}%")
                ->limit(5)
                ->get(['id', 'invoice_number', 'company_id'])
                ->each(function ($inv) use (&$results) {
                    $results[] = [
                        'type' => 'invoice',
                        'label' => $inv->invoice_number,
                        'href' => "/admin/companies/{$inv->company_id}",
                        'meta' => 'Invoice',
                    ];
                });
        }

        ActivityLog::query()
            ->where('action', 'like', "%{$q}%")
            ->limit(3)
            ->latest()
            ->get(['id', 'action'])
            ->each(function (ActivityLog $log) use (&$results) {
                $results[] = [
                    'type' => 'audit',
                    'label' => $log->action,
                    'href' => '/admin/governance/operations/global-audit?q='.urlencode($log->action),
                    'meta' => 'Audit event',
                ];
            });

        return array_slice($results, 0, $limit * 2);
    }
}
