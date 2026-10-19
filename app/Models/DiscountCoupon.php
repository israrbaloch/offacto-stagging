<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscountCoupon extends Model
{
    protected $fillable = [
        'code',
        'name',
        'type',
        'amount',
        'max_redemptions',
        'redemption_count',
        'valid_from',
        'valid_until',
        'is_active',
        'eligibility',
    ];

    protected function casts(): array
    {
        return [
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'is_active' => 'boolean',
            'eligibility' => 'array',
        ];
    }

    public function isValidNow(): bool
    {
        if (! $this->is_active) {
            return false;
        }
        if ($this->valid_from && $this->valid_from->isFuture()) {
            return false;
        }
        if ($this->valid_until && $this->valid_until->isPast()) {
            return false;
        }
        if ($this->max_redemptions !== null && $this->redemption_count >= $this->max_redemptions) {
            return false;
        }

        return true;
    }
}
