<?php

namespace App\Models;

use App\Support\RequestAudit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class SecurityEvent extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'event_type',
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

    public static function record(
        string $eventType,
        string $outcome = 'failure',
        ?User $user = null,
        ?string $email = null,
        ?array $metadata = null,
        ?Request $request = null,
    ): self {
        return self::create([
            'user_id' => $user?->id,
            'email' => $email ?? $user?->email,
            'event_type' => $eventType,
            'outcome' => $outcome,
            'ip_address' => RequestAudit::ip($request),
            'user_agent' => RequestAudit::userAgent($request),
            'metadata' => $metadata,
        ]);
    }
}
