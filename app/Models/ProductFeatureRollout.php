<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductFeatureRollout extends Model
{
    protected $fillable = [
        'feature_key',
        'name',
        'description',
        'status',
        'plan_slugs',
        'company_ids',
        'rollout_percent',
    ];

    protected function casts(): array
    {
        return [
            'plan_slugs' => 'array',
            'company_ids' => 'array',
        ];
    }
}
