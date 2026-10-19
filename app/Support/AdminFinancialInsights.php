<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\Invoice;
use App\Models\InvoicePayment;
use App\Models\Offer;
use Illuminate\Support\Facades\DB;

final class AdminFinancialInsights
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function deliveryHistory(int $limit = 50): array
    {
        $rows = [];

        Invoice::query()
            ->with('company:id,company_name')
            ->where(function ($q) {
                $q->whereNotNull('peppol_sent_at')->orWhereNotNull('postbode_sent_at');
            })
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->each(function (Invoice $inv) use (&$rows) {
                if ($inv->peppol_sent_at) {
                    $rows[] = [
                        'at' => $inv->peppol_sent_at->toIso8601String(),
                        'document' => 'Invoice '.$inv->invoice_number,
                        'company' => $inv->company?->company_name,
                        'channel' => 'Peppol',
                        'status' => 'sent',
                        'reference' => $inv->mollie_payment_id,
                    ];
                }
                if ($inv->postbode_sent_at) {
                    $rows[] = [
                        'at' => $inv->postbode_sent_at->toIso8601String(),
                        'document' => 'Invoice '.$inv->invoice_number,
                        'company' => $inv->company?->company_name,
                        'channel' => 'Postbode',
                        'status' => $inv->postbode_status ?? 'sent',
                        'reference' => $inv->postbode_postal_uuid,
                    ];
                }
            });

        Offer::query()
            ->with('company:id,company_name')
            ->whereNotNull('postbode_sent_at')
            ->orderByDesc('postbode_sent_at')
            ->limit(20)
            ->get()
            ->each(function (Offer $offer) use (&$rows) {
                $rows[] = [
                    'at' => $offer->postbode_sent_at?->toIso8601String(),
                    'document' => 'Quotation '.($offer->offer_number ?? $offer->id),
                    'company' => $offer->company?->company_name,
                    'channel' => 'Postbode',
                    'status' => $offer->postbode_status ?? 'sent',
                    'reference' => $offer->postbode_postal_uuid ?? null,
                ];
            });

        usort($rows, fn ($a, $b) => strcmp($b['at'] ?? '', $a['at'] ?? ''));

        return array_slice($rows, 0, $limit);
    }

    /**
     * @return array<string, mixed>
     */
    public static function reconciliationSummary(): array
    {
        $invoiced = (float) Invoice::query()->whereNull('deleted_at')->get()->sum(fn (Invoice $i) => $i->total);
        $recorded = (float) InvoicePayment::query()->sum('amount');
        $unpaidCount = Invoice::query()->where('payment_status', Invoice::PAYMENT_UNPAID)->count();
        $partialCount = Invoice::query()->where('payment_status', Invoice::PAYMENT_PARTIAL)->count();

        return [
            'invoiced_total' => round($invoiced, 2),
            'payments_recorded' => round($recorded, 2),
            'open_gap' => round(max(0, $invoiced - $recorded), 2),
            'unpaid_invoices' => $unpaidCount,
            'partial_invoices' => $partialCount,
            'note' => 'Compare with Mollie and bank statements. Tenant invoice totals are company-scoped; this is platform-wide.',
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function exceptions(int $limit = 40): array
    {
        $items = [];

        $dupes = Invoice::query()
            ->select('invoice_number', DB::raw('count(*) as c'))
            ->groupBy('invoice_number')
            ->having('c', '>', 1)
            ->limit(10)
            ->get();
        foreach ($dupes as $row) {
            $items[] = [
                'type' => 'duplicate_number',
                'severity' => 'high',
                'detail' => 'Invoice number '.$row->invoice_number.' appears '.$row->c.' times',
            ];
        }

        Invoice::query()->with('company:id,company_name')->orderByDesc('id')->limit(200)->get()->each(function (Invoice $inv) use (&$items) {
            if ($inv->total < 0) {
                $items[] = [
                    'type' => 'negative_total',
                    'severity' => 'medium',
                    'detail' => ($inv->company?->company_name ?? 'Company').' — '.$inv->invoice_number.' total '.$inv->total,
                ];
            }
            if ($inv->payment_status === Invoice::PAYMENT_PAID && $inv->amount_due > 0.01) {
                $items[] = [
                    'type' => 'payment_state',
                    'severity' => 'medium',
                    'detail' => $inv->invoice_number.' marked paid but amount due '.$inv->amount_due,
                ];
            }
        });

        return array_slice($items, 0, $limit);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function documentRevisions(int $limit = 50): array
    {
        return ActivityLog::query()
            ->where(function ($q) {
                $q->where('action', 'like', '%invoice%')
                    ->orWhere('action', 'like', '%offer%')
                    ->orWhere('action', 'like', '%quotation%')
                    ->orWhere('action', 'like', '%credit%');
            })
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'at' => $log->created_at?->toIso8601String(),
                'action' => $log->action,
                'user_id' => $log->user_id,
                'outcome' => $log->outcome,
                'detail' => is_array($log->metadata) ? json_encode($log->metadata) : '',
            ])
            ->all();
    }
}
