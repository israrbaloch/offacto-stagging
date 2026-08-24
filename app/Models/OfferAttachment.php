<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfferAttachment extends Model
{
    protected $fillable = [
        'offer_id',
        'file_path',
        'original_name',
    ];

    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }
}
