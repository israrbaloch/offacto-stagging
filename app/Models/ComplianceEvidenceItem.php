<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceEvidenceItem extends Model
{
    protected $fillable = [
        'authority_request_id',
        'compliance_case_id',
        'record_type',
        'record_reference',
        'content_hash',
        'captured_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'captured_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function authorityRequest(): BelongsTo
    {
        return $this->belongsTo(ComplianceAuthorityRequest::class, 'authority_request_id');
    }
}
