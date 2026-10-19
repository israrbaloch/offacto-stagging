<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceDataSubjectRequest extends Model
{
    public const TYPE_ACCESS = 'access';

    public const TYPE_CORRECTION = 'correction';

    public const TYPE_EXPORT = 'export';

    public const TYPE_RESTRICTION = 'restriction';

    public const TYPE_DELETION = 'deletion';

    protected $fillable = [
        'reference',
        'request_type',
        'status',
        'subject_email',
        'subject_user_id',
        'company_id',
        'identity_verified_at',
        'due_at',
        'closed_at',
        'notes',
        'assigned_to_user_id',
    ];

    protected function casts(): array
    {
        return [
            'identity_verified_at' => 'datetime',
            'due_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function subjectUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'subject_user_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }
}
