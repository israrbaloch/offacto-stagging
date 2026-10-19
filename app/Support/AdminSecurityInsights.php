<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\IntegrationApiKey;
use App\Models\SecurityAccountRestriction;
use App\Models\SecurityEvent;
use App\Models\SecurityFraudReview;
use App\Models\SecurityIncident;
use App\Models\SecurityPolicyException;
use App\Models\SecurityRotationTask;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Illuminate\Support\Facades\Process;

final class AdminSecurityInsights
{
    public static function seedRotationTasks(): void
    {
        if (SecurityRotationTask::query()->exists()) {
            return;
        }

        foreach (['platform_mollie', 'peppol_token', 'webhook_signing', 'integration_api_keys'] as $type) {
            SecurityRotationTask::create([
                'credential_type' => $type,
                'status' => 'planned',
                'due_at' => now()->addMonths(3),
                'notes' => 'Initial rotation schedule',
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public static function dashboard(): array
    {
        return [
            'failed_logins_24h' => SecurityEvent::query()
                ->where('created_at', '>=', now()->subDay())
                ->where('event_type', 'like', '%login%')
                ->where('outcome', 'failure')
                ->count(),
            'open_fraud_reviews' => SecurityFraudReview::query()->where('status', 'open')->count(),
            'active_restrictions' => SecurityAccountRestriction::query()->where('status', 'active')->count(),
            'open_incidents' => SecurityIncident::query()->where('status', '!=', 'closed')->count(),
            'active_exceptions' => SecurityPolicyException::query()->where('status', 'active')->where('expires_at', '>', now())->count(),
            'rotation_overdue' => SecurityRotationTask::query()->where('status', '!=', 'completed')->where('due_at', '<', now())->count(),
            'pending_company_approvals' => Company::query()->pending()->count(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function suspiciousSignals(int $limit = 40): array
    {
        $rows = [];

        SecurityEvent::query()
            ->where('created_at', '>=', now()->subDays(7))
            ->where(function ($q) {
                $q->where('outcome', 'failure')
                    ->orWhere('event_type', 'like', '%lockout%');
            })
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->each(function (SecurityEvent $e) use (&$rows) {
                $rows[] = [
                    'at' => $e->created_at->toIso8601String(),
                    'signal' => $e->event_type,
                    'detail' => $e->email.' · '.$e->ip_address,
                    'severity' => 'medium',
                ];
            });

        ActivityLog::query()
            ->where('created_at', '>=', now()->subDays(7))
            ->where(function ($q) {
                $q->where('action', 'like', '%export%')
                    ->orWhere('action', 'like', '%.updated')
                    ->orWhere('action', 'like', 'admin.user.%');
            })
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->each(function (ActivityLog $log) use (&$rows) {
                $rows[] = [
                    'at' => $log->created_at->toIso8601String(),
                    'signal' => 'privileged_activity',
                    'detail' => $log->action,
                    'severity' => str_contains($log->action, 'export') ? 'high' : 'low',
                ];
            });

        SubscriptionPayment::query()
            ->whereIn('status', ['failed', 'canceled', 'expired'])
            ->where('created_at', '>=', now()->subDays(7))
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->each(function (SubscriptionPayment $p) use (&$rows) {
                $rows[] = [
                    'at' => $p->created_at->toIso8601String(),
                    'signal' => 'payment_anomaly',
                    'detail' => 'Subscription payment '.$p->status,
                    'severity' => 'medium',
                ];
            });

        usort($rows, fn ($a, $b) => strcmp($b['at'], $a['at']));

        return array_slice($rows, 0, $limit);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function fraudSuggestions(): array
    {
        $items = [];

        Company::query()
            ->pending()
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'company_name', 'email', 'created_at'])
            ->each(function (Company $c) use (&$items) {
                $items[] = [
                    'type' => 'registration_review',
                    'subject' => $c->company_name,
                    'detail' => $c->email,
                    'at' => $c->created_at?->toIso8601String(),
                    'subject_type' => Company::class,
                    'subject_id' => $c->id,
                ];
            });

        User::query()
            ->where('created_at', '>=', now()->subDays(3))
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'email', 'created_at'])
            ->each(function (User $u) use (&$items) {
                $items[] = [
                    'type' => 'new_account',
                    'subject' => $u->email,
                    'detail' => 'Recent registration',
                    'at' => $u->created_at?->toIso8601String(),
                    'subject_type' => User::class,
                    'subject_id' => $u->id,
                ];
            });

        return $items;
    }

    /**
     * @return array<string, mixed>
     */
    public static function vulnerabilitySummary(): array
    {
        $result = Process::timeout(120)->run(['composer', 'audit', '--format=json'], base_path());

        if (! $result->successful()) {
            return [
                'ok' => false,
                'message' => 'Composer audit could not run. Track advisories manually until CI scan is wired.',
                'advisories' => [],
            ];
        }

        $json = json_decode($result->output(), true);
        $advisories = $json['advisories'] ?? [];

        return [
            'ok' => true,
            'message' => count($advisories).' advisory groups reported.',
            'advisories' => collect($advisories)->take(20)->map(fn ($row, $pkg) => [
                'package' => is_string($pkg) ? $pkg : ($row[0]['packageName'] ?? 'unknown'),
                'count' => is_array($row) ? count($row) : 1,
            ])->values()->all(),
        ];
    }

    public static function apiKeysDueRotation(): int
    {
        return IntegrationApiKey::query()
            ->whereNull('revoked_at')
            ->where('created_at', '<', now()->subMonths(6))
            ->count();
    }
}
