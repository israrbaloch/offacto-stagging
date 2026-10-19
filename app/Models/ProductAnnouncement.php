<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductAnnouncement extends Model
{
    protected $fillable = [
        'reference',
        'title',
        'body',
        'severity',
        'audience',
        'starts_at',
        'ends_at',
        'published',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
