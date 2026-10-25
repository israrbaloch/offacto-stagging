<?php

namespace App\Services;

use App\Models\PurchaseInvoice;
use App\Support\PurchaseCategories;
use Illuminate\Support\Carbon;

class PurchaseFinanceService
{
    /**
     * Booked and paid purchase invoices, excluding VAT, by invoice date.
     * This is the profit-and-loss cost. Review and flagged bills are excluded.
     */
    public function expensesExclBetween(int $companyId, Carbon $start, Carbon $end): float
    {
        return round((float) $this->reportQuery($companyId)
            ->whereBetween('invoice_date', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->sum('amount_excl'), 2);
    }

    /**
     * Deductible input VAT on booked and paid bills, by invoice date.
     */
    public function inputVatBetween(int $companyId, Carbon $start, Carbon $end): float
    {
        $rows = $this->reportQuery($companyId)
            ->whereBetween('invoice_date', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->get(['category', 'vat_amount']);

        return round($rows->sum(function (PurchaseInvoice $row) {
            return PurchaseCategories::deductible($row->category) ? (float) $row->vat_amount : 0;
        }), 2);
    }

    /**
     * Cash leaving the company: paid bills, amount including VAT, by payment date.
     *
     * @return array<string, float> keyed by Y-m
     */
    public function paidInclByMonth(int $companyId, Carbon $start, Carbon $end): array
    {
        $rows = PurchaseInvoice::query()
            ->where('company_id', $companyId)
            ->where('status', PurchaseInvoice::STATUS_PAID)
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$start, $end])
            ->get(['paid_at', 'amount_incl']);

        $totals = [];
        foreach ($rows as $row) {
            $key = $row->paid_at->format('Y-m');
            $totals[$key] = round(($totals[$key] ?? 0) + (float) $row->amount_incl, 2);
        }

        return $totals;
    }

    private function reportQuery(int $companyId)
    {
        return PurchaseInvoice::query()
            ->where('company_id', $companyId)
            ->whereIn('status', PurchaseInvoice::REPORT_STATUSES);
    }
}
