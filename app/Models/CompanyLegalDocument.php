<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyLegalDocument extends Model
{
    protected $fillable = [
        'company_id',
        'type',
        'file_path',
        'original_name',
        'attach_to_quotes_default',
    ];

    protected function casts(): array
    {
        return [
            'attach_to_quotes_default' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
