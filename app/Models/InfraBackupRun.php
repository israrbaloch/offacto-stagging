<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InfraBackupRun extends Model
{
    protected $fillable = [
        'reference',
        'destination',
        'status',
        'encrypted',
        'size_bytes',
        'started_at',
        'completed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'encrypted' => 'boolean',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
