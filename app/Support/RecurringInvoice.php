<?php

namespace App\Support;

use Illuminate\Support\Carbon;

class RecurringInvoice
{
    /** Next scheduled run after a date (weekly / monthly / yearly only). */
    public static function nextRunAfter(Carbon $from, ?string $interval): Carbon
    {
        return match ($interval) {
            'weekly' => $from->copy()->addWeek(),
            'yearly' => $from->copy()->addYear(),
            default => $from->copy()->addMonth(),
        };
    }

    public static function initialNextRun(?string $interval): Carbon
    {
        return self::nextRunAfter(now()->startOfDay(), $interval);
    }
}
