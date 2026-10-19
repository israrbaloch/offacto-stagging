<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductPublicPage extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'page_type',
        'locale',
        'body',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }
}
