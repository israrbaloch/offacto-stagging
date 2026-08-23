<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\Admin\CompanyApproved;
use App\Mail\Admin\CompanyRejected;
use App\Mail\Admin\CompanyStatusChanged;
use App\Models\Company;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminCompanyController extends Controller
{
    /**
     * Display a listing of companies.
     */
    public function index(Request $request)
    {
        $query = Company::with(['user', 'statusRelation']);

        // Filter by active status
        if ($request->has('status') && $request->status !== '') {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->inactive();
            } elseif ($request->status === 'pending') {
                $query->pending();
            }
        }

        // Search by company name or owner
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $companies = $query->latest()->paginate(15)->withQueryString();
        $statuses = Status::forTable('companies');

        return view('admin.companies.index', [
            'companies' => $companies,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Display the specified company.
     */
    public function show(Company $company)
    {
        $company->load([
            'user',
            'statusRelation',
            'approver',
            'services.statusRelation',
            'customers.statusRelation',
            'offers.statusRelation',
            'invoices.statusRelation',
        ]);

        return view('admin.companies.show', [
            'company' => $company,
        ]);
    }

    /**
     * Show the form for editing the specified company.
     */
    public function edit(Company $company)
    {
        $company->load(['user', 'statusRelation']);
        $statuses = Status::forTable('companies');

        return view('admin.companies.edit', [
            'company' => $company,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified company.
     */
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'vat_number' => ['nullable', 'string', 'max:50'],
            'street' => ['nullable', 'string', 'max:255'],
            'house' => ['nullable', 'string', 'max:50'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:100'],
        ]);

        $company->update($validated);

        return redirect()
            ->route('admin.companies.show', $company)
            ->with('status', 'company-updated');
    }

    /**
     * Approve the specified company.
     */
    public function approve(Company $company)
    {
        $company->approve(auth()->id());

        // Send notification email to company owner
        try {
            Mail::to($company->user->email)->send(new CompanyApproved($company));
        } catch (\Exception $e) {
            \Log::error('Failed to send company approved email: ' . $e->getMessage());
        }

        return back()->with('status', 'company-approved');
    }

    /**
     * Reject the specified company.
     */
    public function reject(Request $request, Company $company)
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $company->reject();

        // Send notification email to company owner
        try {
            Mail::to($company->user->email)->send(new CompanyRejected($company, $validated['reason'] ?? null));
        } catch (\Exception $e) {
            \Log::error('Failed to send company rejected email: ' . $e->getMessage());
        }

        return back()->with('status', 'company-rejected');
    }

    /**
     * Toggle the active status of the specified company.
     * Only approved companies can be activated; deactivation is always allowed.
     */
    public function toggleActive(Company $company)
    {
        $wasActive = $company->isActive();

        if ($wasActive) {
            $company->deactivate();
        } else {
            if (!$company->isApproved()) {
                return back()->with('error', 'Only approved companies can be activated. Please approve the company first.');
            }
            $company->activate();
        }

        // Send notification email to company owner
        try {
            Mail::to($company->user->email)->send(new CompanyStatusChanged($company, !$wasActive));
        } catch (\Exception $e) {
            \Log::error('Failed to send company status change email: ' . $e->getMessage());
        }

        $status = $wasActive ? 'company-deactivated' : 'company-activated';

        return back()->with('status', $status);
    }
}
