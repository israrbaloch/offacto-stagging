<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductRoadmapItem extends Model
{
    protected $fillable = [
        'title',
        'description',
        'quarter_label',
        'status',
        'public',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'public' => 'boolean',
        ];
    }
}
