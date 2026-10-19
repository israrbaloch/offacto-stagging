<?php

namespace App\Models;

use App\Support\RequestAudit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'company_id',
        'action',
        'subject_type',
        'subject_id',
        'outcome',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public static function record(
        string $action,
        ?User $actor = null,
        ?Model $subject = null,
        string $outcome = 'success',
        ?array $metadata = null,
        ?Request $request = null,
        ?int $companyId = null,
    ): self {
        $actor ??= auth()->user();

        return self::create([
            'user_id' => $actor?->id,
            'company_id' => $companyId,
            'action' => $action,
            'subject_type' => $subject ? $subject->getMorphClass() : null,
            'subject_id' => $subject?->getKey(),
            'outcome' => $outcome,
            'ip_address' => RequestAudit::ip($request),
            'user_agent' => RequestAudit::userAgent($request),
            'metadata' => $metadata,
        ]);
    }
}
