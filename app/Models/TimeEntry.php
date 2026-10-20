<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TimeEntry extends Model
{
    public const STATUS_RUNNING = 'running';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_INVOICED = 'invoiced';

    protected $fillable = [
        'company_id',
        'user_id',
        'customer_id',
        'service_id',
        'description',
        'started_at',
        'ended_at',
        'duration_seconds',
        'billable',
        'status',
        'invoice_id',
        'invoice_item_id',
        'invoiced_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'invoiced_at' => 'datetime',
            'billable' => 'boolean',
            'duration_seconds' => 'integer',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function invoiceItem(): BelongsTo
    {
        return $this->belongsTo(InvoiceItem::class);
    }

    public function invoiceItems(): BelongsToMany
    {
        return $this->belongsToMany(InvoiceItem::class, 'invoice_item_time_entry');
    }

    public function hours(): float
    {
        $seconds = $this->duration_seconds;
        if ($this->status === self::STATUS_RUNNING && $this->started_at) {
            $seconds = max(0, now()->diffInSeconds($this->started_at));
        }

        return round($seconds / 3600, 2);
    }

    public function refreshDurationFromTimestamps(): void
    {
        if (! $this->started_at || ! $this->ended_at) {
            return;
        }
        $start = \Illuminate\Support\Carbon::parse($this->started_at);
        $end = \Illuminate\Support\Carbon::parse($this->ended_at);
        $this->duration_seconds = max(0, $start->diffInSeconds($end));
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeUninvoicedBillable($query)
    {
        return $query->where('billable', true)
            ->where('status', self::STATUS_COMPLETED)
            ->whereNotNull('customer_id')
            ->whereNotNull('service_id');
    }
}
