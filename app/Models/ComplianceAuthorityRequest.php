<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComplianceAuthorityRequest extends Model
{
    public const STATUS_RECEIVED = 'received';

    public const STATUS_VERIFICATION = 'verification';

    public const STATUS_LEGAL_REVIEW = 'legal_review';

    public const STATUS_AWAITING_DISCLOSURE = 'awaiting_disclosure';

    public const STATUS_CLOSED = 'closed';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'reference',
        'requesting_authority',
        'jurisdiction',
        'legal_basis',
        'scope_summary',
        'status',
        'is_emergency',
        'assigned_reviewer_id',
        'compliance_case_id',
        'received_at',
        'verified_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'is_emergency' => 'boolean',
            'received_at' => 'datetime',
            'verified_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_reviewer_id');
    }

    public function complianceCase(): BelongsTo
    {
        return $this->belongsTo(ComplianceCase::class);
    }

    public function disclosures(): HasMany
    {
        return $this->hasMany(ComplianceDisclosure::class, 'authority_request_id');
    }

    public function evidenceItems(): HasMany
    {
        return $this->hasMany(ComplianceEvidenceItem::class, 'authority_request_id');
    }
}
