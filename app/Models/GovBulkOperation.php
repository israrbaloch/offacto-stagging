<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GovBulkOperation extends Model
{
    protected $fillable = [
        'reference',
        'operation',
        'parameters',
        'preview',
        'impact_summary',
        'status',
        'executed_by_user_id',
        'executed_at',
    ];

    protected function casts(): array
    {
        return [
            'parameters' => 'array',
            'preview' => 'array',
            'executed_at' => 'datetime',
        ];
    }

    public function executedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'executed_by_user_id');
    }
}
