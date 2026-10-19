<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationFailure extends Model
{
    protected $fillable = [
        'provider',
        'operation',
        'reference',
        'status',
        'message',
        'metadata',
        'retry_count',
        'next_retry_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'next_retry_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }
}
