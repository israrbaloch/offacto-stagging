<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class IntegrationWebhook extends Model
{
    protected $fillable = [
        'name',
        'url',
        'events',
        'signing_secret',
        'active',
        'max_retries',
    ];

    protected function casts(): array
    {
        return [
            'events' => 'array',
            'active' => 'boolean',
            'signing_secret' => 'encrypted',
        ];
    }

}
