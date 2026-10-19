<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunicationSuppression extends Model
{
    protected $fillable = [
        'email_hash',
        'email_domain',
        'reason',
        'channel',
        'suppressed_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'suppressed_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public static function hashEmail(string $email): string
    {
        return hash('sha256', strtolower(trim($email)));
    }
}
