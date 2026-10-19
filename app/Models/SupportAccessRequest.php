<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportAccessRequest extends Model
{
    protected $fillable = [
        'reference',
        'company_id',
        'requested_by_user_id',
        'approved_by_user_id',
        'reason',
        'scope',
        'status',
        'expires_at',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
