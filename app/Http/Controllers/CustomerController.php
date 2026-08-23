<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Country;
use App\Models\Customer;
use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index(Request $request): View
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            abort(404, 'No active company found.');
        }

        $customers = Customer::where('company_id', $activeCompany->id)
            ->with('statusRelation', 'country')
            ->latest()
            ->get(); // Soft deletes are automatically excluded by default

        $statuses = Status::forTable('customers')->pluck('name', 'id');
        $countries = Country::orderBy('name')->pluck('name', 'id');

        return view('pages.customers', [
            'customers' => $customers,
            'statuses' => $statuses,
            'countries' => $countries,
        ]);
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(StoreCustomerRequest $request): JsonResponse|RedirectResponse
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

        $customer = Customer::create([
            'company_id' => $activeCompany->id,
            ...$request->validated(),
        ]);

        $customer->load('statusRelation');

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Customer created successfully.',
                'data' => $customer,
            ], 201);
        }

        return redirect()->route('customers.index')->with('status', 'customer-created');
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(UpdateCustomerRequest $request, $customer): JsonResponse|RedirectResponse
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

        // Find customer scoped to active company
        $customer = Customer::where('id', $customer)
            ->where('company_id', $activeCompany->id)
            ->first();

        if (!$customer) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Customer not found or access denied.',
                    'errors' => ['customer' => ['You do not have access to this customer.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Customer not found or access denied.');
        }

        $customer->update($request->validated());
        $customer->load('statusRelation');

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Customer updated successfully.',
                'data' => $customer,
            ]);
        }

        return redirect()->route('customers.index')->with('status', 'customer-updated');
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(Request $request, $customer): JsonResponse|RedirectResponse
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

        // Find customer scoped to active company
        $customer = Customer::where('id', $customer)
            ->where('company_id', $activeCompany->id)
            ->first();

        if (!$customer) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Customer not found or access denied.',
                    'errors' => ['customer' => ['You do not have access to this customer.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Customer not found or access denied.');
        }

        $customer->delete(); // Soft delete

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Customer deleted successfully.',
            ]);
        }

        return redirect()->route('customers.index')->with('status', 'customer-deleted');
    }
}
