<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyFeatureOverride extends Model
{
    protected $fillable = [
        'company_id',
        'capability_key',
        'granted',
        'reason',
        'expires_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'granted' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where(function (Builder $inner) {
            $inner->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }
}
