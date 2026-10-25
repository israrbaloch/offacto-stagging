<?php

namespace App\Services;

use App\Models\PurchaseInvoice;
use App\Models\Supplier;
use Illuminate\Support\Carbon;

class PurchaseInvoiceReviewService
{
    /**
     * @param  array{supplier_id: int, invoice_number: string, invoice_date: string, amount_incl: float, iban: ?string, payment_note: ?string}  $data
     * @return list<string>
     */
    public function detect(int $companyId, array $data, ?int $ignoreId = null, ?string $fileContents = null): array
    {
        $flags = [];

        $date = Carbon::parse($data['invoice_date'])->startOfDay();
        $amount = round((float) $data['amount_incl'], 2);

        $sameNumber = PurchaseInvoice::query()
            ->where('company_id', $companyId)
            ->where('supplier_id', $data['supplier_id'])
            ->where('invoice_number', $data['invoice_number'])
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();

        $nearDuplicate = PurchaseInvoice::query()
            ->where('company_id', $companyId)
            ->where('supplier_id', $data['supplier_id'])
            ->whereBetween('invoice_date', [$date->copy()->subDays(3), $date->copy()->addDays(3)])
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->get(['amount_incl'])
            ->contains(fn (PurchaseInvoice $row) => abs((float) $row->amount_incl - $amount) < 0.02);

        if ($sameNumber || $nearDuplicate) {
            $flags[] = 'dup';
        }

        $previousIban = PurchaseInvoice::query()
            ->where('company_id', $companyId)
            ->where('supplier_id', $data['supplier_id'])
            ->whereIn('status', PurchaseInvoice::REPORT_STATUSES)
            ->whereNotNull('iban')
            ->where('iban', '!=', '')
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->orderByDesc('invoice_date')
            ->value('iban');

        $iban = $this->normalizeIban($data['iban'] ?? '');
        if ($previousIban && $iban && $this->normalizeIban($previousIban) !== $iban) {
            $flags[] = 'iban';
        }

        $history = PurchaseInvoice::query()
            ->where('company_id', $companyId)
            ->where('supplier_id', $data['supplier_id'])
            ->whereIn('status', PurchaseInvoice::REPORT_STATUSES)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->pluck('amount_incl');

        if ($history->count() >= 1) {
            $average = (float) $history->avg();
            if ($average > 0 && $amount > $average * 2.4) {
                $flags[] = 'amount';
            }
        }

        $note = strtolower((string) ($data['payment_note'] ?? ''));
        if ($note !== '' && preg_match('/24\s*(uur|hour|h)|urgent|binnen\s*24/i', $note)) {
            $flags[] = 'urgent';
        }

        if ($fileContents && preg_match('/\/(JavaScript|JS|Launch|OpenAction)/', $fileContents)) {
            $flags[] = 'unsafe';
        }

        return array_values(array_unique($flags));
    }

    public function normalizeIban(?string $iban): string
    {
        return strtoupper(preg_replace('/\s+/', '', (string) $iban) ?? '');
    }

    public function syncSupplierIban(Supplier $supplier, ?string $iban): void
    {
        $normalized = $this->normalizeIban($iban);
        if ($normalized === '') {
            return;
        }
        if ($this->normalizeIban($supplier->iban) !== $normalized) {
            $supplier->iban = $normalized;
            $supplier->save();
        }
    }
}
