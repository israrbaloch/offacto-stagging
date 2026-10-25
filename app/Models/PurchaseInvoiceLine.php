<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseInvoiceLine extends Model
{
    protected $fillable = [
        'purchase_invoice_id',
        'description',
        'amount_excl',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'amount_excl' => 'decimal:2',
        ];
    }

    public function purchaseInvoice(): BelongsTo
    {
        return $this->belongsTo(PurchaseInvoice::class);
    }
}
