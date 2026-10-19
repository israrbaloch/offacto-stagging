<?php

namespace App\Support;

use App\Models\InfraRestoreTest;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoicePayment;
use App\Models\OfferItem;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

final class AdminInfrastructureInsights
{
    /**
     * @return array<string, mixed>
     */
    public static function dashboard(): array
    {
        $queuePending = Schema::hasTable('jobs') ? (int) DB::table('jobs')->count() : 0;
        $queueFailed = Schema::hasTable('failed_jobs') ? (int) DB::table('failed_jobs')->count() : 0;

        return [
            'db_ok' => self::databasePing(),
            'queue_pending' => $queuePending,
            'queue_failed' => $queueFailed,
            'integrity_issues' => count(self::integrityIssues()),
            'storage_mb' => self::publicStorageMegabytes(),
            'last_restore_test' => InfraRestoreTest::query()->where('status', 'passed')->latest('tested_at')->value('tested_at')?->toIso8601String(),
            'maintenance_on' => SiteSetting::getBoolean('maintenance_enabled', false),
        ];
    }

    public static function databasePing(): bool
    {
        try {
            DB::select('SELECT 1');

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * @return array<string, mixed>
     */
    public static function databaseHealth(): array
    {
        $driver = config('database.default');
        $connection = config("database.connections.{$driver}.database");
        $tables = [];
        if ($driver === 'mysql') {
            $tables = collect(DB::select('SHOW TABLE STATUS'))
                ->take(15)
                ->map(fn ($row) => [
                    'name' => $row->Name,
                    'rows' => (int) $row->Rows,
                    'size_mb' => round(($row->Data_length + $row->Index_length) / 1024 / 1024, 2),
                ])
                ->all();
        }

        $counts = [
            'companies' => Schema::hasTable('companies') ? DB::table('companies')->count() : 0,
            'invoices' => Schema::hasTable('invoices') ? DB::table('invoices')->count() : 0,
            'users' => Schema::hasTable('users') ? DB::table('users')->count() : 0,
        ];

        return [
            'driver' => $driver,
            'database' => $connection,
            'connected' => self::databasePing(),
            'table_samples' => $tables,
            'row_counts' => $counts,
            'note' => 'Slow query logging is configured at the database server; enable performance_schema or slow query log on production.',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function queueStatus(): array
    {
        return [
            'pending' => Schema::hasTable('jobs') ? (int) DB::table('jobs')->count() : 0,
            'failed' => Schema::hasTable('failed_jobs') ? (int) DB::table('failed_jobs')->count() : 0,
            'driver' => config('queue.default'),
            'note' => 'Ensure queue workers run: php artisan queue:work --tries=3',
        ];
    }

    /**
     * @return list<array<string, string>>
     */
    public static function scheduledTasks(): array
    {
        return [
            ['command' => 'invoices:generate-recurring', 'schedule' => 'Daily', 'purpose' => 'Recurring invoice generation'],
            ['command' => 'subscriptions:process', 'schedule' => 'Daily', 'purpose' => 'Subscription billing processing'],
        ];
    }

    public static function publicStorageMegabytes(): float
    {
        $disk = Storage::disk('public');
        $bytes = 0;
        $files = 0;
        try {
            foreach ($disk->allFiles() as $path) {
                $files++;
                $bytes += $disk->size($path);
                if ($files > 5000) {
                    break;
                }
            }
        } catch (\Throwable) {
            return 0;
        }

        return round($bytes / 1024 / 1024, 2);
    }

    /**
     * @return array<string, mixed>
     */
    public static function storageBreakdown(): array
    {
        return [
            'public_disk_mb' => self::publicStorageMegabytes(),
            'local_app_mb' => self::folderSizeMegabytes(storage_path('app')),
            'framework_cache_mb' => self::folderSizeMegabytes(storage_path('framework/cache')),
            'logs_mb' => self::folderSizeMegabytes(storage_path('logs')),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function integrityIssues(): array
    {
        $issues = [];

        if (Schema::hasTable('invoice_items') && Schema::hasTable('invoices')) {
            $orphanItems = InvoiceItem::query()
                ->whereNotIn('invoice_id', Invoice::query()->select('id'))
                ->limit(20)
                ->count();
            if ($orphanItems > 0) {
                $issues[] = ['severity' => 'high', 'type' => 'orphan_invoice_items', 'count' => $orphanItems];
            }
        }

        if (Schema::hasTable('offer_items') && Schema::hasTable('offers')) {
            $orphanOffers = OfferItem::query()
                ->whereNotIn('offer_id', DB::table('offers')->select('id'))
                ->limit(20)
                ->count();
            if ($orphanOffers > 0) {
                $issues[] = ['severity' => 'high', 'type' => 'orphan_offer_items', 'count' => $orphanOffers];
            }
        }

        Invoice::query()
            ->withSum('payments as paid_sum', 'amount')
            ->whereNull('deleted_at')
            ->limit(200)
            ->get()
            ->each(function (Invoice $invoice) use (&$issues) {
                $paid = (float) ($invoice->paid_sum ?? 0);
                $total = (float) $invoice->total;
                if ($paid > $total + 0.01 && $invoice->payment_status !== 'paid') {
                    $issues[] = [
                        'severity' => 'medium',
                        'type' => 'payment_balance_mismatch',
                        'detail' => 'Invoice '.$invoice->invoice_number.' paid '.$paid.' vs total '.$total,
                    ];
                }
            });

        return array_slice($issues, 0, 30);
    }

    /**
     * @return list<string>
     */
    public static function logTail(int $lines = 150): array
    {
        $path = storage_path('logs/laravel.log');
        if (! is_readable($path)) {
            return ['Log file not found or not readable.'];
        }

        $content = file($path, FILE_IGNORE_NEW_LINES);
        if ($content === false) {
            return [];
        }

        $slice = array_slice($content, -$lines);

        return array_map([self::class, 'redactLogLine'], $slice);
    }

    public static function redactLogLine(string $line): string
    {
        $patterns = [
            '/(password|secret|token|api_key|authorization)(["\']?\s*[:=]\s*["\']?)([^\s"\']+)/i' => '$1$2[REDACTED]',
            '/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/' => 'Bearer [REDACTED]',
        ];
        foreach ($patterns as $pattern => $replacement) {
            $line = preg_replace($pattern, $replacement, $line) ?? $line;
        }

        return $line;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function failedJobs(int $limit = 30): array
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

    private static function folderSizeMegabytes(string $path): float
    {
        if (! is_dir($path)) {
            return 0;
        }
        $size = 0;
        $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS));
        $n = 0;
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $size += $file->getSize();
                $n++;
                if ($n > 3000) {
                    break;
                }
            }
        }

        return round($size / 1024 / 1024, 2);
    }
}
