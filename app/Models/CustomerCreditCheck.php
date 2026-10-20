<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerCreditCheck extends Model
{
    protected $fillable = [
        'company_id',
        'customer_id',
        'requested_by_user_id',
        'provider',
        'identifier_used',
        'rating',
        'status_label',
        'response_payload',
        'checked_at',
    ];

    protected function casts(): array
    {
        return [
            'response_payload' => 'array',
            'checked_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }
}
