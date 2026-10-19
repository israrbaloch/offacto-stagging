<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductHelpArticle extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'category',
        'locale',
        'body',
        'published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
        ];
    }
}
