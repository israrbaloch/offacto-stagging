<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplianceBreachIncident extends Model
{
    protected $fillable = [
        'reference',
        'severity',
        'status',
        'discovered_at',
        'summary',
        'affected_categories',
        'containment_actions',
        'notification_deadline_at',
        'notified_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'discovered_at' => 'datetime',
            'notification_deadline_at' => 'datetime',
            'notified_at' => 'datetime',
            'affected_categories' => 'array',
            'metadata' => 'array',
        ];
    }
}
