<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMfaCredential extends Model
{
    protected $fillable = [
        'user_id',
        'secret',
        'recovery_codes',
        'confirmed_at',
        'last_used_at',
        'failed_attempts',
        'locked_until',
    ];

    protected $hidden = [
        'secret',
        'recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'secret' => 'encrypted',
            'recovery_codes' => 'array',
            'confirmed_at' => 'datetime',
            'last_used_at' => 'datetime',
            'locked_until' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isConfirmed(): bool
    {
        return $this->confirmed_at !== null && filled($this->secret);
    }

    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }
}
