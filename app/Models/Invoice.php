<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\SiteSetting;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * IP Transfer Types
     */
    public const IP_FULL_TRANSFER = 'full_transfer';
    public const IP_LICENSE_TO_USE = 'license_to_use';

    /**
     * Payment Status Constants
     */
    public const PAYMENT_PAID = 'paid';
    public const PAYMENT_UNPAID = 'unpaid';
    public const PAYMENT_PARTIAL = 'partial';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_id',
        'customer_id',
        'offer_id',
        'invoice_number',
        'invoice_date',
        'due_date',
        'intro',
        'desc',
        'attachment',
        'notes',
        'status',
        'payment_status',
        'ip_transfer_type',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'invoice_date' => 'date',
            'due_date' => 'date',
        ];
    }

    /**
     * Get the company that owns the invoice.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the customer for the invoice.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the offer this invoice was created from (if any).
     */
    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    /**
     * Get the status for the invoice.
     */
    public function statusRelation()
    {
        return $this->belongsTo(Status::class, 'status');
    }

    /**
     * Get the items for the invoice.
     */
    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Get the payments for the invoice.
     */
    public function payments()
    {
        return $this->hasMany(InvoicePayment::class);
    }

    /**
     * Calculate the subtotal of all items.
     */
    public function getSubtotalAttribute(): float
    {
        return $this->items->sum('total');
    }

    /**
     * Calculate the tax amount based on site settings.
     */
    public function getTaxAmountAttribute(): float
    {
        $taxRate = SiteSetting::getInteger('default_vat_rate', 21) / 100;
        return $this->subtotal * $taxRate;
    }

    /**
     * Calculate the total including tax.
     */
    public function getTotalAttribute(): float
    {
        return $this->subtotal + $this->tax_amount;
    }

    /**
     * Get the total amount paid.
     */
    public function getAmountPaidAttribute(): float
    {
        return $this->payments->sum('amount');
    }

    /**
     * Get the remaining amount due.
     */
    public function getAmountDueAttribute(): float
    {
        return max(0, $this->total - $this->amount_paid);
    }

    /**
     * Get the IP transfer type display text.
     */
    public function getIpTransferTextAttribute(): ?string
    {
        if (!$this->ip_transfer_type) {
            return null;
        }

        $companyName = $this->company->company_name ?? $this->company->first_name . ' ' . $this->company->surname;

        if ($this->ip_transfer_type === self::IP_FULL_TRANSFER) {
            return "All intellectual property rights, including but not limited to copyrights, patents, and trademarks, for the deliverables described in this invoice are hereby irrevocably transferred to the customer upon receipt of full payment. The customer shall have exclusive ownership and may use, modify, reproduce, and distribute the deliverables without restriction.";
        }

        if ($this->ip_transfer_type === self::IP_LICENSE_TO_USE) {
            return "The customer is granted a non-exclusive, non-transferable license to use the deliverables described in this invoice for their intended purpose. All intellectual property rights, including copyrights, remain the exclusive property of {$companyName}. The customer may not sublicense, sell, or transfer these rights without prior written consent.";
        }

        return null;
    }

    /**
     * Get the IP transfer type label for display.
     */
    public function getIpTransferLabelAttribute(): ?string
    {
        return match($this->ip_transfer_type) {
            self::IP_FULL_TRANSFER => 'Full Ownership Transfer',
            self::IP_LICENSE_TO_USE => 'License to Use',
            default => null,
        };
    }

    /**
     * Check if the invoice has IP transfer terms.
     */
    public function hasIpTransfer(): bool
    {
        return !empty($this->ip_transfer_type);
    }

    /**
     * Check if the invoice is fully paid.
     */
    public function isPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_PAID || $this->amount_due <= 0;
    }

    /**
     * Check if the invoice is a draft.
     */
    public function isDraft(): bool
    {
        return $this->statusRelation && strtolower($this->statusRelation->name) === 'draft';
    }

    /**
     * Check if the invoice is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->due_date && $this->due_date->isPast() && !$this->isPaid();
    }

    /**
     * Mark the invoice as paid.
     */
    public function markAsPaid(): void
    {
        $this->update(['payment_status' => self::PAYMENT_PAID]);
    }

    /**
     * Update the payment status based on payments.
     */
    public function updatePaymentStatus(): void
    {
        $amountDue = $this->amount_due;

        if ($amountDue <= 0) {
            $this->payment_status = self::PAYMENT_PAID;
        } elseif ($this->amount_paid > 0) {
            $this->payment_status = self::PAYMENT_PARTIAL;
        } else {
            $this->payment_status = self::PAYMENT_UNPAID;
        }

        $this->save();
    }

    /**
     * Get available IP transfer types.
     */
    public static function getIpTransferTypes(): array
    {
        return [
            self::IP_FULL_TRANSFER => 'Full Ownership Transfer',
            self::IP_LICENSE_TO_USE => 'License to Use',
        ];
    }

    /**
     * Get available payment methods.
     */
    public static function getPaymentMethods(): array
    {
        return [
            'bank_transfer' => 'Bank Transfer',
            'cash' => 'Cash',
            'credit_card' => 'Credit Card',
            'paypal' => 'PayPal',
            'other' => 'Other',
        ];
    }
}
