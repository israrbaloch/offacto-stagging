<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComplianceCase extends Model
{
    protected $fillable = [
        'reference',
        'case_type',
        'title',
        'status',
        'restricted',
        'assigned_to_user_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'restricted' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function authorityRequests(): HasMany
    {
        return $this->hasMany(ComplianceAuthorityRequest::class);
    }
}
