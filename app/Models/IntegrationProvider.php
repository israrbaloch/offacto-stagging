<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationProvider extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'purpose',
        'data_access',
        'operational_status',
        'compliance_doc_url',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }
}
