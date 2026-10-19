<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductTestimonial extends Model
{
    protected $fillable = [
        'reference',
        'author_name',
        'company_name',
        'body',
        'rating',
        'consent_obtained',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'consent_obtained' => 'boolean',
            'published_at' => 'datetime',
        ];
    }
}
