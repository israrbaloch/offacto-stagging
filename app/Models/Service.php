<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_id',
        'name',
        'description',
        'price',
        'unit',
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
            'price' => 'decimal:2',
        ];
    }

    /**
     * Get the company that owns the service.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the status for the service.
     */
    public function statusRelation()
    {
        return $this->belongsTo(Status::class, 'status');
    }

    /**
     * Get the offer items that use this service.
     */
    public function offerItems()
    {
        return $this->hasMany(OfferItem::class);
    }
}
