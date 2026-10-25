<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseInvoice extends Model
{
    public const STATUS_REVIEW = 'review';

    public const STATUS_BOOKED = 'booked';

    public const STATUS_PAID = 'paid';

    public const STATUS_FLAGGED = 'flagged';

    /** @var list<string> */
    public const REPORT_STATUSES = [
        self::STATUS_BOOKED,
        self::STATUS_PAID,
    ];

    protected $fillable = [
        'company_id',
        'supplier_id',
        'invoice_number',
        'invoice_date',
        'due_date',
        'category',
        'status',
        'amount_excl',
        'vat_rate',
        'vat_amount',
        'amount_incl',
        'iban',
        'payment_note',
        'flags',
        'file_path',
        'file_name',
        'booked_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'invoice_date' => 'date',
            'due_date' => 'date',
            'amount_excl' => 'decimal:2',
            'vat_rate' => 'decimal:2',
            'vat_amount' => 'decimal:2',
            'amount_incl' => 'decimal:2',
            'flags' => 'array',
            'booked_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(PurchaseInvoiceLine::class)->orderBy('position');
    }

    public function countsInReports(): bool
    {
        return in_array($this->status, self::REPORT_STATUSES, true);
    }
}
