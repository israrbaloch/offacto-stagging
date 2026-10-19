<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityFraudReview extends Model
{
    protected $fillable = [
        'reference',
        'review_type',
        'status',
        'subject_type',
        'subject_id',
        'summary',
        'metadata',
        'assigned_to_user_id',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }
}
