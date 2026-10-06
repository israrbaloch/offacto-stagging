<?php

namespace App\Support;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\Service;
use App\Models\User;

class PlatformAdminOverview
{
    /**
     * @return array<string, mixed>
     */
    public static function data(): array
    {
        $nonAdminUsers = User::whereDoesntHave('roles', function ($q) {
            $q->where('name', 'admin');
        });

        $userStats = [
            'total' => (clone $nonAdminUsers)->count(),
            'active' => (clone $nonAdminUsers)->active()->count(),
            'inactive' => (clone $nonAdminUsers)->inactive()->count(),
        ];

        $companyStats = [
            'total' => Company::count(),
            'active' => Company::active()->count(),
            'pending' => Company::pending()->count(),
        ];

        $serviceStats = [
            'total' => Service::count(),
            'active' => Service::whereHas('statusRelation', fn ($q) => $q->where('name', 'Active'))->count(),
            'pending' => Service::whereHas('statusRelation', fn ($q) => $q->where('name', 'Pending'))->count(),
        ];

        $invoiceStats = [
            'total' => Invoice::count(),
            'total_revenue' => Invoice::whereHas('statusRelation', fn ($q) => $q->where('name', 'Paid'))->get()->sum('total'),
            'pending_payment' => Invoice::where('payment_status', 'unpaid')->count(),
        ];

        $recentUsers = User::with('roles')
            ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'admin'))
            ->latest()
            ->take(5)
            ->get();

        $pendingCompanies = Company::pending()->with('user')->latest()->take(5)->get();

        $pendingServices = Service::whereHas('statusRelation', fn ($q) => $q->where('name', 'Pending'))
            ->with('company.user')
            ->latest()
            ->take(5)
            ->get();

        return compact(
            'userStats',
            'companyStats',
            'serviceStats',
            'invoiceStats',
            'recentUsers',
            'pendingCompanies',
            'pendingServices',
        );
    }
}
