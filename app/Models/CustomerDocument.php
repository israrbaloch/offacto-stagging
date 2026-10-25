<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerDocument extends Model
{
    protected $fillable = [
        'company_id',
        'customer_id',
        'original_name',
        'file_path',
        'attach_on_invoice',
    ];

    protected function casts(): array
    {
        return [
            'attach_on_invoice' => 'boolean',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
