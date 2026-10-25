<?php

namespace App\Support;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\PurchaseInvoice;
use Illuminate\Support\Facades\Schema;

final class WorkspaceSidebarNav
{
    /**
     * Sidebar nav counters (demo offacto-app-demo.html NAV cnt spans).
     *
     * @return array<string, int>
     */
    public static function counts(?Company $company): array
    {
        if (! $company) {
            return [];
        }

        $counts = [
            'invoices' => self::openInvoiceCount($company),
        ];

        if (Schema::hasTable('purchase_invoices')) {
            $counts['purchases'] = PurchaseInvoice::query()
                ->where('company_id', $company->id)
                ->whereIn('status', [PurchaseInvoice::STATUS_REVIEW, PurchaseInvoice::STATUS_FLAGGED])
                ->count();
        }

        return $counts;
    }

    private static function openInvoiceCount(Company $company): int
    {
        if (! Schema::hasTable('invoices')) {
            return 0;
        }

        return Invoice::query()
            ->where('company_id', $company->id)
            ->where('payment_status', '!=', Invoice::PAYMENT_PAID)
            ->whereHas('statusRelation', function ($status) {
                $status->whereRaw('LOWER(name) != ?', ['draft']);
            })
            ->count();
    }
}
