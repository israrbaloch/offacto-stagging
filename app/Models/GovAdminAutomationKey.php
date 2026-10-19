<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class GovAdminAutomationKey extends Model
{
    protected $fillable = [
        'name',
        'key_prefix',
        'key_hash',
        'scopes',
        'last_used_at',
        'revoked_at',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'scopes' => 'array',
            'last_used_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * @return array{model: self, plain: string}
     */
    public static function issue(string $name, array $scopes, ?int $userId): array
    {
        $plain = 'ofa_'.Str::random(40);
        $key = self::create([
            'name' => $name,
            'key_prefix' => substr($plain, 0, 12),
            'key_hash' => hash('sha256', $plain),
            'scopes' => $scopes,
            'created_by_user_id' => $userId,
        ]);

        return ['model' => $key, 'plain' => $plain];
    }
}
