<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReleaseNote extends Model
{
    protected $fillable = [
        'version',
        'title',
        'body',
        'note_type',
        'published',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }
}
