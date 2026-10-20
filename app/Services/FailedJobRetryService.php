<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Support\GovernancePolicy;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class FailedJobRetryService
{
    /**
     * @var list<string>
     */
    private const UNSAFE_NEEDLES = [
        'Illuminate\\Mail\\',
        'Illuminate\\Notifications\\',
        'App\\Mail\\',
        'SendQueuedMailable',
        'Mollie',
        'ProcessSubscription',
        'SubscriptionBilling',
        'Peppol',
        'Payment',
        'InvoiceSent',
        'OfferSent',
        'WelcomeEmail',
        'SupportTicketStaffNotification',
    ];

    public function retry(string $uuid, string $source): void
    {
        if (! Schema::hasTable('failed_jobs')) {
            throw ValidationException::withMessages([
                'uuid' => 'Failed job storage is not available.',
            ]);
        }

        $row = DB::table('failed_jobs')->where('uuid', $uuid)->first();
        if (! $row) {
            throw ValidationException::withMessages([
                'uuid' => 'That failed job was not found.',
            ]);
        }

        $fingerprint = $this->fingerprint($row);
        if ($this->isUnsafe($fingerprint)) {
            ActivityLog::record('admin.job.retry_rejected', outcome: 'denied', metadata: [
                'uuid' => $uuid,
                'source' => $source,
                'reason' => 'non_idempotent',
            ]);
            throw ValidationException::withMessages([
                'uuid' => 'This job sends mail, takes payment, or is otherwise unsafe to replay automatically.',
            ]);
        }

        GovernancePolicy::assertOperationalMutationAllowed();

        Artisan::call('queue:retry', ['id' => $uuid]);
        ActivityLog::record('admin.job.retried', metadata: [
            'uuid' => $uuid,
            'source' => $source,
        ]);
    }

    private function fingerprint(object $row): string
    {
        $payload = [];
        if (isset($row->payload) && is_string($row->payload)) {
            $decoded = json_decode($row->payload, true);
            $payload = is_array($decoded) ? $decoded : [];
        }

        return implode(' ', array_filter([
            $row->payload ?? '',
            $payload['displayName'] ?? '',
            $payload['data']['commandName'] ?? '',
        ]));
    }

    private function isUnsafe(string $fingerprint): bool
    {
        foreach (self::UNSAFE_NEEDLES as $needle) {
            if (stripos($fingerprint, $needle) !== false) {
                return true;
            }
        }

        return false;
    }
}
