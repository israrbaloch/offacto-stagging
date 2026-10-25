<?php

namespace App\Http\Controllers;

use App\Models\Briefing;
use App\Models\BriefingResponse;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Offer;
use App\Services\PurchaseFinanceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany) {
            $payload = [
                'user' => $user,
                'stats' => $this->getEmptyStats(),
                'chartData' => $this->getEmptyChartData(),
                'openOffers' => collect(),
                'topCustomers' => collect(),
                'awaitingBriefings' => collect(),
                'recentResponses' => collect(),
                'recentActivity' => [],
                'hasCompany' => false,
            ];

            return Inertia::render('Dashboard', $payload);
        }

        // Get statistics
        $stats = $this->getStats($activeCompany->id);

        // Get open offers (pending, sent, draft status)
        $openOffers = Offer::where('company_id', $activeCompany->id)
            ->with(['customer', 'statusRelation', 'items'])
            ->whereHas('statusRelation', function ($query) {
                $query->whereIn('name', ['Draft', 'Sent', 'Pending', 'Open']);
            })
            ->latest()
            ->take(5)
            ->get();

        // Top customers by invoice payments received
        $topCustomers = Customer::where('company_id', $activeCompany->id)
            ->with(['invoices' => fn ($query) => $query->with(['payments', 'items'])])
            ->get()
            ->map(function ($customer) {
                $customer->total_invoiced = round($customer->invoices->sum(
                    fn (Invoice $invoice) => (float) $invoice->amount_paid
                ), 2);

                return $customer;
            })
            ->filter(fn ($customer) => $customer->total_invoiced > 0)
            ->sortByDesc('total_invoiced')
            ->take(5)
            ->values();

        $awaitingBriefings = Briefing::where('company_id', $activeCompany->id)
            ->where('status', Briefing::STATUS_ACTIVE)
            ->with('customer')
            ->latest()
            ->take(5)
            ->get();

        $recentResponses = BriefingResponse::whereHas('briefing', function ($query) use ($activeCompany) {
            $query->where('company_id', $activeCompany->id);
        })
            ->with(['briefing', 'offer'])
            ->latest('submitted_at')
            ->take(5)
            ->get();

        $activity = $this->buildRecentActivity($awaitingBriefings, $recentResponses, $openOffers);

        return Inertia::render('Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'chartData' => $this->getChartData($activeCompany->id),
            'openOffers' => $openOffers,
            'topCustomers' => $topCustomers,
            'awaitingBriefings' => $awaitingBriefings,
            'recentResponses' => $recentResponses,
            'recentActivity' => $activity,
            'hasCompany' => true,
        ]);
    }

    /**
     * Get statistics for the company.
     */
    /**
     * @param  \Illuminate\Support\Collection<int, Briefing>  $awaitingBriefings
     * @param  \Illuminate\Support\Collection<int, BriefingResponse>  $recentResponses
     * @param  \Illuminate\Support\Collection<int, Offer>  $openOffers
     * @return list<array{icon: string, title: string, meta: string, href: string|null}>
     */
    private function buildRecentActivity($awaitingBriefings, $recentResponses, $openOffers): array
    {
        $items = [];

        foreach ($recentResponses->take(3) as $response) {
            $title = $response->briefing?->title ?? 'Briefing response';
            $items[] = [
                'icon' => 'clipboard',
                'title' => $title,
                'meta' => $response->offer_id ? 'Draft quote ready' : 'Response received',
                'href' => $response->offer_id ? '/offers/'.$response->offer_id.'/edit' : '/briefings',
            ];
        }

        foreach ($openOffers->take(2) as $offer) {
            $customer = $offer->customer;
            $label = $customer?->org_name
                ?: trim(($customer?->first_name ?? '').' '.($customer?->surname ?? ''))
                ?: 'Customer';
            $items[] = [
                'icon' => 'offers',
                'title' => "Open quote · {$label}",
                'meta' => $offer->offer_number ?? 'Draft',
                'href' => '/offers/'.$offer->id.'/edit',
            ];
        }

        foreach ($awaitingBriefings->take(2) as $briefing) {
            $items[] = [
                'icon' => 'brief',
                'title' => $briefing->title,
                'meta' => 'Awaiting client response',
                'href' => '/briefings/'.$briefing->id,
            ];
        }

        return array_slice($items, 0, 6);
    }

    private function getStats(int $companyId): array
    {
        $currentYear = now()->year;
        $startOfYear = now()->startOfYear();

        // YTD collected on invoices (matches cashflow chart: paid amounts by invoice date)
        $invoicesYtd = Invoice::where('company_id', $companyId)
            ->whereYear('invoice_date', $currentYear)
            ->with(['payments', 'items'])
            ->get();

        $revenue = round($invoicesYtd->sum(
            fn (Invoice $invoice) => (float) $invoice->amount_paid
        ), 2);

        // Open offers total
        $openOffers = Offer::where('company_id', $companyId)
            ->whereHas('statusRelation', function ($query) {
                $query->whereIn('name', ['Draft', 'Sent', 'Pending', 'Open']);
            })
            ->with('items')
            ->get();

        $openOffersTotal = round($openOffers->sum(function ($offer) {
            return $offer->total;
        }), 2);

        $openOffersCount = $openOffers->count();

        $invoices = Invoice::where('company_id', $companyId)
            ->with(['payments', 'items'])
            ->get();

        $awaitingPaymentCount = $invoices->filter(fn (Invoice $invoice) => ! $invoice->isPaid())->count();
        $overdueInvoices = $invoices->filter(fn (Invoice $invoice) => $invoice->isOverdue());
        $overdueTotal = round($overdueInvoices->sum(fn (Invoice $invoice) => (float) $invoice->amount_due), 2);

        $finance = app(PurchaseFinanceService::class);
        $expenses = $finance->expensesExclBetween($companyId, $startOfYear->copy(), now());
        $inputVat = $finance->inputVatBetween($companyId, $startOfYear->copy(), now());
        $outputVat = round($invoicesYtd->sum(fn (Invoice $invoice) => (float) $invoice->tax_amount), 2);
        $netResult = round($revenue - $expenses, 2);

        return [
            'revenue' => $revenue,
            'expenses' => $expenses,
            'expensesTracked' => true,
            'inputVat' => $inputVat,
            'outputVat' => $outputVat,
            'vatPayable' => round($outputVat - $inputVat, 2),
            'netResult' => $netResult,
            'openOffersTotal' => $openOffersTotal,
            'openOffersCount' => $openOffersCount,
            'awaitingPaymentCount' => $awaitingPaymentCount,
            'overdueInvoiceCount' => $overdueInvoices->count(),
            'overdueTotal' => $overdueTotal,
            'periodStart' => $startOfYear->format('F j, Y'),
            'periodEnd' => 'today',
        ];
    }

    /**
     * Get empty stats for users without a company.
     */
    private function getEmptyStats(): array
    {
        return [
            'revenue' => 0,
            'expenses' => 0,
            'expensesTracked' => true,
            'inputVat' => 0,
            'outputVat' => 0,
            'vatPayable' => 0,
            'netResult' => 0,
            'openOffersTotal' => 0,
            'openOffersCount' => 0,
            'awaitingPaymentCount' => 0,
            'overdueInvoiceCount' => 0,
            'overdueTotal' => 0,
            'periodStart' => now()->startOfYear()->format('F j, Y'),
            'periodEnd' => 'today',
        ];
    }

    private function getChartData(int $companyId): array
    {
        $invoices = Invoice::where('company_id', $companyId)
            ->with(['items', 'payments'])
            ->get();

        $labels = [];
        $paidSeries = [];
        $outstandingSeries = [];
        $expensesSeries = [];
        $paidPurchases = app(PurchaseFinanceService::class)->paidInclByMonth(
            $companyId,
            now()->subMonths(11)->startOfMonth(),
            now()->endOfMonth(),
        );

        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $ym = $month->format('Y-m');
            $labels[] = $month->format('M');

            $monthInvoices = $invoices->filter(
                fn (Invoice $invoice) => $invoice->invoice_date?->format('Y-m') === $ym
            );

            $paidSeries[] = round($monthInvoices->sum(fn (Invoice $invoice) => (float) $invoice->amount_paid), 2);
            $outstandingSeries[] = round($monthInvoices->sum(
                fn (Invoice $invoice) => $invoice->isPaid() ? 0 : (float) $invoice->amount_due
            ), 2);
            $expensesSeries[] = round($paidPurchases[$ym] ?? 0, 2);
        }

        $paymentStatus = [
            'paid' => $invoices->filter(fn (Invoice $i) => $i->payment_status === Invoice::PAYMENT_PAID)->count(),
            'partial' => $invoices->filter(fn (Invoice $i) => $i->payment_status === Invoice::PAYMENT_PARTIAL)->count(),
            'unpaid' => $invoices->filter(
                fn (Invoice $i) => $i->payment_status === Invoice::PAYMENT_UNPAID && ! $i->isOverdue()
            )->count(),
            'overdue' => $invoices->filter(fn (Invoice $i) => $i->isOverdue())->count(),
        ];

        $totalOutstanding = round($invoices->sum(
            fn (Invoice $invoice) => $invoice->isPaid() ? 0 : (float) $invoice->amount_due
        ), 2);

        $dso = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();

            $paidInMonth = $invoices->filter(function (Invoice $invoice) use ($monthStart, $monthEnd) {
                if (! $invoice->isPaid() || ! $invoice->invoice_date) {
                    return false;
                }
                $lastPayment = $invoice->payments->max('payment_date');

                if ($lastPayment instanceof Carbon) {
                    return $lastPayment->between($monthStart, $monthEnd);
                }

                return $invoice->invoice_date->between($monthStart, $monthEnd);
            });

            $days = $paidInMonth->map(function (Invoice $invoice) {
                $lastPayment = $invoice->payments->max('payment_date') ?? $invoice->due_date ?? now();

                return $invoice->invoice_date->diffInDays($lastPayment);
            });

            $dso[] = [
                'label' => $monthStart->format('M Y'),
                'days' => $days->isEmpty() ? 0 : (int) round($days->avg()),
            ];
        }

        return [
            'cashflow' => [
                'labels' => $labels,
                'paid' => $paidSeries,
                'outstanding' => $outstandingSeries,
                'expenses' => $expensesSeries,
            ],
            'paymentStatus' => $paymentStatus,
            'totalOutstanding' => $totalOutstanding,
            'dso' => $dso,
        ];
    }

    private function getEmptyChartData(): array
    {
        $labels = [];
        $zeros = [];
        for ($i = 11; $i >= 0; $i--) {
            $labels[] = now()->subMonths($i)->format('M');
            $zeros[] = 0;
        }

        $dso = [];
        for ($i = 5; $i >= 0; $i--) {
            $dso[] = [
                'label' => now()->subMonths($i)->format('M Y'),
                'days' => 0,
            ];
        }

        return [
            'cashflow' => [
                'labels' => $labels,
                'paid' => $zeros,
                'outstanding' => $zeros,
                'expenses' => $zeros,
            ],
            'paymentStatus' => [
                'paid' => 0,
                'partial' => 0,
                'unpaid' => 0,
                'overdue' => 0,
            ],
            'totalOutstanding' => 0,
            'dso' => $dso,
        ];
    }
}
