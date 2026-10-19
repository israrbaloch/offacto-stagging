<?php

namespace App\Support;

use App\Models\CommunicationDeliveryLog;
use App\Models\CommunicationSuppression;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class AdminCommunicationInsights
{
    /**
     * @return array<string, mixed>
     */
    public static function dashboard(): array
    {
        $since = now()->subDays(30);

        return [
            'deliveries_30d' => CommunicationDeliveryLog::query()->where('created_at', '>=', $since)->count(),
            'failed_30d' => CommunicationDeliveryLog::query()->where('created_at', '>=', $since)->whereIn('status', ['failed', 'bounced'])->count(),
            'tests_30d' => CommunicationDeliveryLog::query()->where('created_at', '>=', $since)->where('is_test', true)->count(),
            'suppressions' => CommunicationSuppression::query()->count(),
            'queue_pending' => Schema::hasTable('jobs') ? (int) DB::table('jobs')->count() : 0,
            'queue_failed' => Schema::hasTable('failed_jobs') ? (int) DB::table('failed_jobs')->count() : 0,
            'rules_enabled' => collect(self::notificationRules())->where('enabled', true)->count(),
            'scheduled_enabled' => SiteSetting::getBoolean('comm_scheduled_enabled', true),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function notificationRules(): array
    {
        $raw = SiteSetting::get('comm_notification_rules', null);
        if (is_string($raw)) {
            $decoded = json_decode($raw, true);

            return is_array($decoded) ? $decoded : [];
        }

        return is_array($raw) ? $raw : (array) (CommunicationSettingsRegistry::definition('notification-rules')['fields'][0]['default'] ?? []);
    }

    /**
     * @return array<string, mixed>
     */
    public static function deliveryAnalytics(): array
    {
        $since = now()->subDays(30);
        $rows = CommunicationDeliveryLog::query()
            ->where('created_at', '>=', $since)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'period_days' => 30,
            'by_status' => $rows,
            'note' => 'Provider webhooks expand delivered/bounced stats when integrated. Until then, statuses reflect application logging.',
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function communicationHistory(int $limit = 60): array
    {
        return CommunicationDeliveryLog::query()
            ->with('company:id,company_name')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (CommunicationDeliveryLog $log) => [
                'id' => $log->id,
                'at' => $log->created_at->toIso8601String(),
                'template_key' => $log->template_key,
                'event_type' => $log->event_type,
                'recipient_masked' => $log->recipient_masked,
                'company' => $log->company?->company_name,
                'status' => $log->status,
                'subject' => $log->subject_snapshot,
                'is_test' => $log->is_test,
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function queueFailed(int $limit = 30): array
    {
        if (! Schema::hasTable('failed_jobs')) {
            return [];
        }

        return DB::table('failed_jobs')
            ->orderByDesc('failed_at')
            ->limit($limit)
            ->get(['uuid', 'queue', 'failed_at', 'exception'])
            ->map(fn ($row) => [
                'uuid' => $row->uuid,
                'queue' => $row->queue,
                'failed_at' => $row->failed_at,
                'exception' => str($row->exception)->before("\n")->limit(120)->value(),
            ])
            ->all();
    }
}
