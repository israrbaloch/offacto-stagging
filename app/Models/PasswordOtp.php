<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class PasswordOtp extends Model
{
    protected $fillable = [
        'email',
        'code_hash',
        'reset_token_hash',
        'attempts',
        'expires_at',
        'verified_at',
        'last_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
            'last_sent_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function resendAvailableAt(): ?Carbon
    {
        if (!$this->last_sent_at) {
            return null;
        }

        return $this->last_sent_at->copy()->addSeconds(60);
    }
}
