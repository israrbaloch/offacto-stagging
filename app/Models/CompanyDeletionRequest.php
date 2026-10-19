<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyDeletionRequest extends Model
{
    protected $fillable = [
        'company_id',
        'requested_by',
        'status',
        'reason',
        'retention_until',
        'legal_hold',
        'anonymized_at',
        'permanently_deleted_at',
    ];

    protected function casts(): array
    {
        return [
            'retention_until' => 'date',
            'legal_hold' => 'boolean',
            'anonymized_at' => 'datetime',
            'permanently_deleted_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
