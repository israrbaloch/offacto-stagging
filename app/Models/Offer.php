<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\SiteSetting;

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
        'offer_number',
        'offer_date',
        'valid_until',
        'intro',
        'desc',
        'attachment',
        'notes',
        'status',
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
        ];
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
}
