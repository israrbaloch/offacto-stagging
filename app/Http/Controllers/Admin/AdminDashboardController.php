<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // User statistics (excluding admin users)
        $nonAdminUsers = User::whereDoesntHave('roles', function ($q) {
            $q->where('name', 'admin');
        });
        
        $userStats = [
            'total' => (clone $nonAdminUsers)->count(),
            'active' => (clone $nonAdminUsers)->active()->count(),
            'inactive' => (clone $nonAdminUsers)->inactive()->count(),
        ];

        // Company statistics
        $companyStats = [
            'total' => Company::count(),
            'active' => Company::active()->count(),
            'pending' => Company::pending()->count(),
        ];

        // Service statistics
        $serviceStats = [
            'total' => Service::count(),
            'active' => Service::whereHas('statusRelation', function ($q) {
                $q->where('name', 'Active');
            })->count(),
            'pending' => Service::whereHas('statusRelation', function ($q) {
                $q->where('name', 'Pending');
            })->count(),
        ];

        // Invoice statistics
        $invoiceStats = [
            'total' => Invoice::count(),
            'total_revenue' => Invoice::whereHas('statusRelation', function ($q) {
                $q->where('name', 'Paid');
            })->get()->sum('total'),
            'pending_payment' => Invoice::where('payment_status', 'unpaid')->count(),
        ];

        // Recent users (excluding admin users)
        $recentUsers = User::with('roles')
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'admin');
            })
            ->latest()
            ->take(5)
            ->get();

        // Pending approvals
        $pendingCompanies = Company::pending()
            ->with('user')
            ->latest()
            ->take(5)
            ->get();

        $pendingServices = Service::whereHas('statusRelation', function ($q) {
            $q->where('name', 'Pending');
        })->with('company.user')
            ->latest()
            ->take(5)
            ->get();

        return view('admin.dashboard', [
            'userStats' => $userStats,
            'companyStats' => $companyStats,
            'serviceStats' => $serviceStats,
            'invoiceStats' => $invoiceStats,
            'recentUsers' => $recentUsers,
            'pendingCompanies' => $pendingCompanies,
            'pendingServices' => $pendingServices,
        ]);
    }
}
