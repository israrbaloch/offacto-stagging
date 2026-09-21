<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\SiteSetting;
use Illuminate\Support\Str;

class Offer extends Model
{
    use HasFactory, SoftDeletes;

    protected $appends = ['total', 'subtotal', 'tax_amount'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_id',
        'customer_id',
        'briefing_response_id',
        'offer_number',
        'offer_date',
        'valid_until',
        'intro',
        'desc',
        'attachment',
        'notes',
        'email_message',
        'status',
        'share_token',
        'accepted_at',
        'declined_at',
        'signature_data',
        'voice_note_path',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'offer_date' => 'date',
            'valid_until' => 'date',
            'accepted_at' => 'datetime',
            'declined_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Offer $offer) {
            if (! $offer->share_token) {
                $offer->share_token = Str::random(40);
            }
        });
    }

    /**
     * Get the company that owns the offer.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the customer for the offer.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function briefingResponse()
    {
        return $this->belongsTo(BriefingResponse::class);
    }

    /**
     * Get the status for the offer.
     */
    public function statusRelation()
    {
        return $this->belongsTo(Status::class, 'status');
    }

    /**
     * Get the items for the offer.
     */
    public function items()
    {
        return $this->hasMany(OfferItem::class);
    }

    public function attachments()
    {
        return $this->hasMany(OfferAttachment::class);
    }

    public function blocks()
    {
        return $this->hasMany(OfferBlock::class)->orderBy('sort_order');
    }

    public function publicUrl(): string
    {
        if (! $this->share_token) {
            $this->update(['share_token' => Str::random(40)]);
            $this->refresh();
        }

        return url('/q/'.$this->share_token);
    }

    /**
     * Calculate the subtotal of all items.
     */
    public function getSubtotalAttribute(): float
    {
        return $this->items->sum('total');
    }

    /**
     * Calculate the tax amount based on site settings.
     */
    public function getTaxAmountAttribute(): float
    {
        $taxRate = SiteSetting::getInteger('default_vat_rate', 21) / 100;
        return $this->subtotal * $taxRate;
    }

    /**
     * Calculate the total including tax.
     */
    public function getTotalAttribute(): float
    {
        return $this->subtotal + $this->tax_amount;
    }

    public static function nextNumber(int $companyId): string
    {
        return app(\App\Services\NumberingSeriesService::class)->nextForCompany($companyId, 'offers');
    }
}
