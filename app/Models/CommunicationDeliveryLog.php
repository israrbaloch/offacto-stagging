<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunicationDeliveryLog extends Model
{
    protected $fillable = [
        'template_key',
        'event_type',
        'recipient_masked',
        'company_id',
        'status',
        'provider',
        'provider_message_id',
        'subject_snapshot',
        'is_test',
        'metadata',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'is_test' => 'boolean',
            'metadata' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public static function maskEmail(string $email): string
    {
        if (! str_contains($email, '@')) {
            return '***';
        }
        [$local, $domain] = explode('@', $email, 2);
        $localMask = strlen($local) <= 2 ? '*' : substr($local, 0, 1).'***';

        return $localMask.'@'.$domain;
    }
}
