<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_id',
        'first_name',
        'surname',
        'type',
        'country_id',
        'vat_number',
        'org_name',
        'office_address',
        'email',
        'phone',
        'email_usage',
        'additional_recivers',
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
            'email_usage' => 'array',
            'additional_recivers' => 'array',
        ];
    }

    /**
     * Get the company that owns the customer.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the status for the customer.
     */
    public function statusRelation()
    {
        return $this->belongsTo(Status::class, 'status');
    }

    /**
     * Get the country for the customer.
     */
    public function country()
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    /**
     * Get the offers for the customer.
     */
    public function offers()
    {
        return $this->hasMany(Offer::class);
    }
}
