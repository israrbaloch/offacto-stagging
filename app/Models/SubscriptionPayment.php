<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionPayment extends Model
{
    protected $fillable = [
        'company_id',
        'subscription_plan_id',
        'mollie_payment_id',
        'status',
        'amount_cents',
        'currency',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function markPaid(): void
    {
        if ($this->status === 'paid') {
            return;
        }

        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $plan = $this->plan;
        if (! $plan) {
            return;
        }

        $this->company?->applySubscriptionPayment($plan);
    }
}
