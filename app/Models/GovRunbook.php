<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GovRunbook extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'category',
        'body',
        'version',
        'published',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
        ];
    }
}
