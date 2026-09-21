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
        'use_suffix',
        'suffix',
        'restart_count',
        'last_period',
    ];

    protected $casts = [
        'use_suffix' => 'boolean',
    ];

    public function previewNumber(): string
    {
        return app(\App\Services\NumberingSeriesService::class)->preview($this);
    }

    /**
     * Get the company that owns the numbering series.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
