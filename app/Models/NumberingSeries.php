<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NumberingSeries extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_id',
        'name',
        'type',
        'prefix',
        'year_month',
        'separator',
        'digits',
        'next_number',
    ];

    /**
     * Get the company that owns the numbering series.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
