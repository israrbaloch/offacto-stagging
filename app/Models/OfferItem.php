<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfferItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'offer_id',
        'service_id',
        'description',
        'quantity',
        'price',
        'total',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    /**
     * Get the offer that owns the item.
     */
    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    /**
     * Get the service for the item.
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Calculate and set the total for this item.
     */
    public function calculateTotal(): void
    {
        $this->total = $this->quantity * $this->price;
    }
}
