<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Country;
use App\Models\Customer;
use App\Models\CustomerCreditCheck;
use App\Models\Invoice;
use App\Support\CompanyAccess;
use App\Support\CompanyIntegrations;
use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $peppolConfigured = CompanyIntegrations::peppolConfigured($activeCompany);

        $baseQuery = Customer::where('company_id', $activeCompany->id);

        $statsRows = (clone $baseQuery)
            ->with([
                'country',
                'invoices' => fn ($q) => $q
                    ->where('payment_status', '!=', Invoice::PAYMENT_PAID)
                    ->with(['items', 'payments']),
            ])
            ->get();

        $stats = $this->customerStats($statsRows, $peppolConfigured);

        $query = (clone $baseQuery)
            ->with([
                'statusRelation',
                'country',
                'creditChecks' => fn ($q) => $q->orderByDesc('checked_at')->limit(1),
                'invoices' => fn ($q) => $q
                    ->where('payment_status', '!=', Invoice::PAYMENT_PAID)
                    ->with(['items', 'payments']),
                'documents',
            ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('surname', 'like', "%{$search}%")
                    ->orWhere('org_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('vat_number', 'like', "%{$search}%");
            });
        }

        $typeTab = $request->input('type_tab', 'all');
        $typeFilters = ['individual', 'vzw', 'company', 'gov'];
        if ($typeTab === 'organization') {
            $query->where('type', 'company');
        } elseif (in_array($typeTab, $typeFilters, true)) {
            $query->where('type', $typeTab);
        }

        $customers = $query->latest()->get()->map(
            fn (Customer $customer) => $this->presentCustomer($customer, $peppolConfigured)
        )->values();

        $drawerCustomerId = $request->integer('customer') ?: null;
        $drawerCreditCheck = null;
        if ($drawerCustomerId) {
            $check = CustomerCreditCheck::query()
                ->where('company_id', $activeCompany->id)
                ->where('customer_id', $drawerCustomerId)
                ->orderByDesc('checked_at')
                ->first();
            if ($check) {
                $drawerCreditCheck = [
                    'customer_id' => $check->customer_id,
                    'rating' => $check->rating,
                    'status_label' => $check->status_label,
                    'checked_at' => $check->checked_at?->toIso8601String(),
                    'identifier_used' => $check->identifier_used,
                ];
            }
        }

        return Inertia::render('Customers/Index', [
            ...$this->formProps(),
            'customers' => $customers,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'type_tab' => $typeTab,
                'customer' => $drawerCustomerId,
                'drawer' => $request->input('drawer'),
            ],
            'creditsafeConfigured' => CompanyIntegrations::creditsafeConfigured($activeCompany),
            'peppolConfigured' => $peppolConfigured,
            'legalDocuments' => $activeCompany->legalDocuments()->latest()->get(['id', 'title', 'original_name', 'attach_to_quotes_default']),
            'drawerCreditCheck' => $drawerCreditCheck,
        ]);
    }

    public function create(Request $request): RedirectResponse
    {
        $activeCompany = $request->user()?->activeCompany();
        if (! $activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        return redirect()->route('customers.index', ['drawer' => 'new']);
    }

    public function edit(Request $request, $customer): RedirectResponse
    {
        $activeCompany = $request->user()?->activeCompany();
        if (! $activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        Customer::where('id', $customer)
            ->where('company_id', $activeCompany->id)
            ->firstOrFail();

        return redirect()->route('customers.index', ['customer' => $customer]);
    }

    private function formProps(): array
    {
        return [
            'statuses' => Status::forTable('customers')->pluck('name', 'id'),
            'countries' => Country::orderBy('name')->pluck('name', 'id'),
            'countryCodes' => Country::orderBy('name')->pluck('code', 'id'),
            'defaultStatusId' => Status::forTable('customers')->where('name', 'Active')->value('id')
                ?? Status::forTable('customers')->value('id'),
        ];
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Customer>  $customers
     * @return array{total: int, organizations: int, on_peppol: int, outstanding: float}
     */
    private function customerStats($customers, bool $peppolConfigured): array
    {
        $outstanding = 0;
        $onPeppol = 0;

        foreach ($customers as $customer) {
            $presented = $this->presentCustomer($customer, $peppolConfigured);
            $outstanding += $presented['outstanding'];
            if ($presented['peppol_eligible']) {
                $onPeppol++;
            }
        }

        return [
            'total' => $customers->count(),
            'organizations' => $customers->whereIn('type', ['vzw', 'company', 'gov', 'organization'])->count(),
            'on_peppol' => $onPeppol,
            'outstanding' => round($outstanding, 2),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function presentCustomer(Customer $customer, bool $peppolConfigured): array
    {
        $outstanding = 0;
        foreach ($customer->invoices ?? [] as $invoice) {
            if ($invoice->payment_status !== Invoice::PAYMENT_PAID) {
                $outstanding += $invoice->amount_due;
            }
        }

        $latestCheck = $customer->creditChecks->first();
        $countryCode = $customer->country?->code;
        $vat = filled($customer->vat_number);
        $peppolEligible = $peppolConfigured && $vat && filled($countryCode);

        return [
            ...$customer->only([
                'id',
                'first_name',
                'surname',
                'type',
                'country_id',
                'vat_number',
                'org_name',
                'office_address',
                'email',
                'phone',
                'notes',
                'status',
                'updated_at',
            ]),
            'status_relation' => $customer->statusRelation ? [
                'id' => $customer->statusRelation->id,
                'name' => $customer->statusRelation->name,
            ] : null,
            'country' => $customer->country ? [
                'id' => $customer->country->id,
                'code' => $customer->country->code,
                'name' => $customer->country->name,
            ] : null,
            'outstanding' => round($outstanding, 2),
            'peppol_eligible' => $peppolEligible,
            'vat_valid' => $vat,
            'creditsafe_rating' => $latestCheck?->rating,
            'latest_credit_check' => $latestCheck ? [
                'customer_id' => $latestCheck->customer_id,
                'rating' => $latestCheck->rating,
                'status_label' => $latestCheck->status_label,
                'checked_at' => $latestCheck->checked_at?->toIso8601String(),
                'identifier_used' => $latestCheck->identifier_used,
            ] : null,
            'documents_count' => $customer->documents?->count() ?? 0,
            'documents' => ($customer->documents ?? collect())->map(fn ($doc) => [
                'id' => $doc->id,
                'original_name' => $doc->original_name,
                'attach_on_invoice' => (bool) $doc->attach_on_invoice,
            ])->values()->all(),
        ];
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

        if ($deny = CompanyAccess::denyCreate($user, $activeCompany, 'customers', 'customers.create')) {
            return $deny;
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

        return redirect()
            ->route('customers.index', ['customer' => $customer->id])
            ->with('status', 'customer-created');
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
