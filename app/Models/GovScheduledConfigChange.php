<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GovScheduledConfigChange extends Model
{
    protected $fillable = [
        'reference',
        'title',
        'registry',
        'section_id',
        'payload',
        'effective_at',
        'status',
        'reason',
        'created_by_user_id',
        'approved_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'effective_at' => 'datetime',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
