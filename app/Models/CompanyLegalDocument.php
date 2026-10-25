<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyLegalDocument extends Model
{
    protected $fillable = [
        'company_id',
        'type',
        'title',
        'file_path',
        'original_name',
        'attach_to_quotes_default',
        'attach_to_invoices_default',
        'attach_new_customers_only',
    ];

    protected function casts(): array
    {
        return [
            'attach_to_quotes_default' => 'boolean',
            'attach_to_invoices_default' => 'boolean',
            'attach_new_customers_only' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
