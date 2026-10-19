<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceLegalHold extends Model
{
    protected $fillable = [
        'reference',
        'title',
        'scope_description',
        'status',
        'authorized_by_user_id',
        'placed_at',
        'released_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'placed_at' => 'datetime',
            'released_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function authorizedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authorized_by_user_id');
    }
}
