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

    protected $hidden = [
        'signing_secret',
    ];

    protected function casts(): array
    {
        return [
            'events' => 'array',
            'active' => 'boolean',
            'signing_secret' => 'encrypted',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'url' => $this->url,
            'events' => $this->events,
            'active' => (bool) $this->active,
            'max_retries' => $this->max_retries,
            'signing_secret_set' => filled($this->signing_secret),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
