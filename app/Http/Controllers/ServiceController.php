<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Mail\Admin\ServicePendingApproval;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Display a listing of the services.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            abort(404, 'No active company found.');
        }

        $services = Service::where('company_id', $activeCompany->id)
            ->with('statusRelation')
            ->latest()
            ->get(); // Soft deletes are automatically excluded by default

        return Inertia::render('Services/Index', [
            'services' => $services,
        ]);
    }

    /**
     * Store a newly created service in storage.
     */
    public function store(StoreServiceRequest $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'No active company found.',
                    'errors' => ['company' => ['Please select a company first.']],
                ], 422);
            }
            return redirect()->back()->with('error', 'No active company found.');
        }

        $serviceData = [
            'company_id' => $activeCompany->id,
            ...$request->validated(),
        ];
        
        // Check if service approval is required, otherwise set default status
        if (SiteSetting::getBoolean('require_service_approval', false)) {
            $pendingStatus = Status::forTable('services')->where('name', 'Pending')->first();
            if ($pendingStatus) {
                $serviceData['status'] = $pendingStatus->id;
            }
        }
        
        // If no status set yet, assign default active status or first available status
        if (!isset($serviceData['status'])) {
            $defaultStatus = Status::forTable('services')->where('name', 'Active')->first()
                ?? Status::forTable('services')->first();
            if ($defaultStatus) {
                $serviceData['status'] = $defaultStatus->id;
            }
        }
        
        $service = Service::create($serviceData);
        $service->load('statusRelation');
        
        // Send notification to admin if approval is required
        if (SiteSetting::getBoolean('require_service_approval', false)) {
            $adminEmail = SiteSetting::get('admin_email');
            if ($adminEmail) {
                Mail::to($adminEmail)->send(new ServicePendingApproval($service));
            }
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Service created successfully.',
                'data' => $service,
            ], 201);
        }

        return redirect()->route('services.index')->with('status', 'service-created');
    }

    /**
     * Update the specified service in storage.
     */
    public function update(UpdateServiceRequest $request, $service): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'No active company found.',
                    'errors' => ['company' => ['Please select a company first.']],
                ], 422);
            }
            return redirect()->back()->with('error', 'No active company found.');
        }

        // Find service scoped to active company
        $service = Service::where('id', $service)
            ->where('company_id', $activeCompany->id)
            ->first();

        if (!$service) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Service not found or access denied.',
                    'errors' => ['service' => ['You do not have access to this service.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Service not found or access denied.');
        }

        $service->update($request->validated());
        $service->load('statusRelation');

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Service updated successfully.',
                'data' => $service,
            ]);
        }

        return redirect()->route('services.index')->with('status', 'service-updated');
    }

    /**
     * Remove the specified service from storage.
     */
    public function destroy(Request $request, $service): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'No active company found.',
                    'errors' => ['company' => ['Please select a company first.']],
                ], 422);
            }
            return redirect()->back()->with('error', 'No active company found.');
        }

        // Find service scoped to active company
        $service = Service::where('id', $service)
            ->where('company_id', $activeCompany->id)
            ->first();

        if (!$service) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Service not found or access denied.',
                    'errors' => ['service' => ['You do not have access to this service.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Service not found or access denied.');
        }

        $service->delete(); // Soft delete

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Service deleted successfully.',
            ]);
        }

        return redirect()->route('services.index')->with('status', 'service-deleted');
    }
}
