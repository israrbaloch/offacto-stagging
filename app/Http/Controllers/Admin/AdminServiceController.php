<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\Admin\ServiceApproved;
use App\Mail\Admin\ServiceRejected;
use App\Mail\Admin\ServiceStatusChanged;
use App\Models\Service;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class AdminServiceController extends Controller
{
    /**
     * Display a listing of services.
     */
    public function index(Request $request)
    {
        $query = Service::with(['company.user', 'statusRelation']);

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->whereHas('statusRelation', function ($q) use ($request) {
                $q->where('name', $request->status);
            });
        }

        // Search by service name or company
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('company', function ($cq) use ($search) {
                        $cq->where('company_name', 'like', "%{$search}%");
                    });
            });
        }

        $services = $query->latest()->paginate(15)->withQueryString();
        $statuses = Status::forTable('services');

        return Inertia::render('Admin/Services/Index', [
            'services' => $services,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service)
    {
        $service->load(['company.user', 'statusRelation', 'offerItems.offer']);

        return Inertia::render('Admin/Services/Show', [
            'service' => $service,
        ]);
    }

    /**
     * Show the form for editing the specified service.
     */
    public function edit(Service $service)
    {
        $service->load(['company.user', 'statusRelation']);
        $statuses = Status::forTable('services');

        return Inertia::render('Admin/Services/Edit', [
            'service' => $service,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified service.
     */
    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'exists:status,id'],
        ]);

        $oldStatusId = $service->status;

        $service->update($validated);

        // Send notification when status was changed (e.g. via edit form)
        if ((int) $oldStatusId !== (int) $validated['status']) {
            $service->load('statusRelation');
            $newStatusName = $service->statusRelation?->name ?? 'Unknown';
            try {
                Mail::to($service->company->user->email)->send(new ServiceStatusChanged($service, $newStatusName));
            } catch (\Exception $e) {
                \Log::error('Failed to send service status changed email: ' . $e->getMessage());
            }
        }

        return redirect()
            ->route('admin.services.show', $service)
            ->with('status', 'service-updated');
    }

    /**
     * Approve the specified service.
     */
    public function approve(Service $service)
    {
        $activeStatus = Status::where('name', 'Active')->where('for', 'services')->first();
        
        $service->update(['status' => $activeStatus?->id]);

        // Send notification email to company owner
        try {
            Mail::to($service->company->user->email)->send(new ServiceApproved($service));
        } catch (\Exception $e) {
            \Log::error('Failed to send service approved email: ' . $e->getMessage());
        }

        return back()->with('status', 'service-approved');
    }

    /**
     * Reject the specified service.
     */
    public function reject(Request $request, Service $service)
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $inactiveStatus = Status::where('name', 'Inactive')->where('for', 'services')->first();
        
        $service->update(['status' => $inactiveStatus?->id]);

        // Send notification email to company owner
        try {
            Mail::to($service->company->user->email)->send(new ServiceRejected($service, $validated['reason'] ?? null));
        } catch (\Exception $e) {
            \Log::error('Failed to send service rejected email: ' . $e->getMessage());
        }

        return back()->with('status', 'service-rejected');
    }
}
