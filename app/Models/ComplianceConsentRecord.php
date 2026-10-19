<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceConsentRecord extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'consent_type',
        'notice_version',
        'accepted_at',
        'withdrawn_at',
        'ip_address',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'withdrawn_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
