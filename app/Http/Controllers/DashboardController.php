<?php

namespace App\Http\Controllers;

use App\Models\Briefing;
use App\Models\BriefingResponse;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Offer;
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

        if (!$activeCompany) {
            return Inertia::render('Dashboard', [
                'user' => $user,
                'stats' => $this->getEmptyStats(),
                'chartData' => $this->getEmptyChartData(),
                'openOffers' => collect(),
                'topCustomers' => collect(),
                'awaitingBriefings' => collect(),
                'recentResponses' => collect(),
                'hasCompany' => false,
            ]);
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

        // Get top paying customers based on accepted/invoiced offers
        $topCustomers = Customer::where('company_id', $activeCompany->id)
            ->with(['offers' => function ($query) {
                $query->whereHas('statusRelation', function ($q) {
                    $q->whereIn('name', ['Accepted', 'Invoiced', 'Paid']);
                })->with('items');
            }])
            ->get()
            ->map(function ($customer) {
                $customer->total_invoiced = $customer->offers->sum(function ($offer) {
                    return $offer->total;
                });
                return $customer;
            })
            ->filter(function ($customer) {
                return $customer->total_invoiced > 0;
            })
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

        return Inertia::render('Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'chartData' => $this->getChartData($activeCompany->id),
            'openOffers' => $openOffers,
            'topCustomers' => $topCustomers,
            'awaitingBriefings' => $awaitingBriefings,
            'recentResponses' => $recentResponses,
            'hasCompany' => true,
        ]);
    }

    /**
     * Get statistics for the company.
     */
    private function getStats(int $companyId): array
    {
        $currentYear = now()->year;
        $startOfYear = now()->startOfYear();

        // Calculate revenue from accepted/invoiced/paid offers this year
        $revenueOffers = Offer::where('company_id', $companyId)
            ->whereHas('statusRelation', function ($query) {
                $query->whereIn('name', ['Accepted', 'Invoiced', 'Paid']);
            })
            ->whereYear('created_at', $currentYear)
            ->with('items')
            ->get();

        $revenue = $revenueOffers->sum(function ($offer) {
            return $offer->total;
        });

        // Open offers total
        $openOffers = Offer::where('company_id', $companyId)
            ->whereHas('statusRelation', function ($query) {
                $query->whereIn('name', ['Draft', 'Sent', 'Pending', 'Open']);
            })
            ->with('items')
            ->get();

        $openOffersTotal = $openOffers->sum(function ($offer) {
            return $offer->total;
        });

        // For now, expenses would need an Expense model which doesn't exist
        // Setting to 0 for now
        $expenses = 0;

        $netResult = $revenue - $expenses;

        return [
            'revenue' => $revenue,
            'expenses' => $expenses,
            'netResult' => $netResult,
            'openOffersTotal' => $openOffersTotal,
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
            'netResult' => 0,
            'openOffersTotal' => 0,
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
            $expensesSeries[] = 0;
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
