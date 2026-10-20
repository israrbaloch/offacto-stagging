<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceBlock extends Model
{
    protected $fillable = [
        'invoice_id',
        'type',
        'sort_order',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
