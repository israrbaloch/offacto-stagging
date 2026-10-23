<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\User;
use App\Services\AdminNotificationService;
use Illuminate\Support\Facades\Schema;

final class WorkspaceShellInsights
{
    /**
     * @return list<array{id: string, tone: string, title: string, body: string, href: string|null, at: string|null, icon?: string}>
     */
    public static function notifications(User $user, ?Company $active): array
    {
        $items = $user->hasRole('admin')
            ? AdminShellInsights::notifications($user)
            : app(AdminNotificationService::class)->unreadFeedForUser($user->id);

        if ($active) {
            if ($active->isPendingApproval()) {
                $items[] = [
                    'id' => 'company-pending-approval',
                    'tone' => 'warning',
                    'title' => __('workspace.notifications.pending_approval_title'),
                    'body' => __('workspace.notifications.pending_approval_body'),
                    'href' => '/company/settings',
                    'at' => now()->toIso8601String(),
                    'icon' => 'alert',
                ];
            }

            if ($active->isTrialExpired() && ! $user->hasRole('admin')) {
                $items[] = [
                    'id' => 'trial-expired',
                    'tone' => 'danger',
                    'title' => __('topbar.trial_ended'),
                    'body' => __('layout.trial_expired'),
                    'href' => '/upgrade',
                    'at' => now()->toIso8601String(),
                    'icon' => 'alert',
                ];
            } elseif ($active->trialDaysLeft() !== null && $active->trialDaysLeft() <= 3 && ! $active->subscription_plan) {
                $items[] = [
                    'id' => 'trial-ending',
                    'tone' => 'warning',
                    'title' => __('workspace.notifications.trial_ending_title'),
                    'body' => __('workspace.notifications.trial_ending_body', ['days' => $active->trialDaysLeft()]),
                    'href' => '/upgrade',
                    'at' => now()->toIso8601String(),
                    'icon' => 'clock',
                ];
            }

            if ($active->subscription_cancel_at_period_end) {
                $items[] = [
                    'id' => 'subscription-cancelled',
                    'tone' => 'info',
                    'title' => __('workspace.notifications.subscription_cancel_title'),
                    'body' => __('workspace.notifications.subscription_cancel_body'),
                    'href' => '/upgrade',
                    'at' => now()->toIso8601String(),
                    'icon' => 'alert',
                ];
            }

            if (Schema::hasTable('activity_logs')) {
                $recent = ActivityLog::query()
                    ->where('company_id', $active->id)
                    ->orderByDesc('created_at')
                    ->limit(5)
                    ->get(['id', 'action', 'created_at', 'metadata']);

                foreach ($recent as $log) {
                    $items[] = [
                        'id' => 'activity-'.$log->id,
                        'tone' => 'neutral',
                        'title' => self::activityTitle($log->action),
                        'body' => self::activityBody($log->action, $log->metadata),
                        'href' => self::activityHref($log->action),
                        'at' => $log->created_at?->toIso8601String(),
                        'icon' => self::activityIcon($log->action),
                    ];
                }
            }
        }

        $seen = [];
        $unique = [];
        foreach ($items as $item) {
            if (isset($seen[$item['id']])) {
                continue;
            }
            $seen[$item['id']] = true;
            $unique[] = $item;
        }

        usort($unique, fn ($a, $b) => strcmp($b['at'] ?? '', $a['at'] ?? ''));

        return array_slice($unique, 0, 12);
    }

    private static function activityTitle(string $action): string
    {
        return match (true) {
            str_contains($action, 'invoice') => __('workspace.notifications.activity_invoice'),
            str_contains($action, 'offer') || str_contains($action, 'quote') => __('workspace.notifications.activity_quote'),
            str_contains($action, 'briefing') => __('workspace.notifications.activity_briefing'),
            str_contains($action, 'customer') => __('workspace.notifications.activity_customer'),
            default => __('workspace.notifications.activity_generic'),
        };
    }

    /**
     * @param  array<string, mixed>|null  $metadata
     */
    private static function activityBody(string $action, ?array $metadata): string
    {
        $detail = is_array($metadata) ? ($metadata['reference'] ?? $metadata['number'] ?? null) : null;
        if ($detail) {
            return (string) $detail;
        }

        return str_replace('.', ' · ', $action);
    }

    private static function activityHref(string $action): ?string
    {
        return match (true) {
            str_contains($action, 'invoice') => '/invoices',
            str_contains($action, 'offer') || str_contains($action, 'quote') => '/offers',
            str_contains($action, 'briefing') => '/briefings',
            str_contains($action, 'customer') => '/customers',
            default => null,
        };
    }

    private static function activityIcon(string $action): string
    {
        return match (true) {
            str_contains($action, 'invoice') => 'document',
            str_contains($action, 'offer') || str_contains($action, 'quote') => 'offers',
            str_contains($action, 'briefing') => 'clipboard',
            str_contains($action, 'customer') => 'customers',
            default => 'check',
        };
    }
}
