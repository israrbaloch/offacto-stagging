<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InfraMaintenanceWindow extends Model
{
    protected $fillable = [
        'title',
        'starts_at',
        'ends_at',
        'pause_queues',
        'maintenance_mode',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'pause_queues' => 'boolean',
            'maintenance_mode' => 'boolean',
        ];
    }
}
