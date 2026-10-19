<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductAbExperiment extends Model
{
    protected $fillable = [
        'reference',
        'name',
        'surface',
        'variant_a_label',
        'variant_b_label',
        'success_metric',
        'status',
        'privacy_min_sample',
        'started_at',
        'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }
}
