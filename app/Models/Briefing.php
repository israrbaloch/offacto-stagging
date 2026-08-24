<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Briefing extends Model
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_CLOSED = 'closed';

    protected $fillable = [
        'company_id',
        'customer_id',
        'title',
        'intro',
        'status',
        'auto_generate_offer',
        'valid_until_days',
        'share_token',
    ];

    protected function casts(): array
    {
        return [
            'auto_generate_offer' => 'boolean',
            'valid_until_days' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Briefing $briefing) {
            if (! $briefing->share_token) {
                $briefing->share_token = Str::random(40);
            }
        });
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function questions()
    {
        return $this->hasMany(BriefingQuestion::class)->orderBy('sort_order');
    }

    public function responses()
    {
        return $this->hasMany(BriefingResponse::class);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function publicUrl(): string
    {
        return url('/b/'.$this->share_token);
    }
}
