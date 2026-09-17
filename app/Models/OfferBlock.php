<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfferBlock extends Model
{
    protected $fillable = [
        'offer_id',
        'type',
        'sort_order',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }
}
