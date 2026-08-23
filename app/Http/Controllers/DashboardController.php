<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Offer;
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
                'openOffers' => collect(),
                'topCustomers' => collect(),
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

        return Inertia::render('Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'openOffers' => $openOffers,
            'topCustomers' => $topCustomers,
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
}
