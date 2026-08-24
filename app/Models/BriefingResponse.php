<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BriefingResponse extends Model
{
    protected $fillable = [
        'briefing_id',
        'customer_id',
        'respondent_name',
        'respondent_email',
        'submitted_at',
        'offer_id',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    public function briefing()
    {
        return $this->belongsTo(Briefing::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    public function answers()
    {
        return $this->hasMany(BriefingAnswer::class, 'response_id');
    }
}
