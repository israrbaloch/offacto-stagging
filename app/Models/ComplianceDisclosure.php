<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceDisclosure extends Model
{
    protected $fillable = [
        'authority_request_id',
        'compliance_case_id',
        'disclosed_to',
        'scope_record',
        'approved_by_user_id',
        'disclosed_at',
        'customer_notification',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'disclosed_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function authorityRequest(): BelongsTo
    {
        return $this->belongsTo(ComplianceAuthorityRequest::class, 'authority_request_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}
