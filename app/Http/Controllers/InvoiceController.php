<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecordPaymentRequest;
use App\Http\Requests\SendInvoiceRequest;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Mail\InvoiceSent;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoicePayment;
use App\Models\Offer;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\Status;
use App\Services\UblInvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the invoices.
     */
    public function index(Request $request): InertiaResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        // Build query with filters
        $query = Invoice::where('company_id', $activeCompany->id)
            ->with(['customer', 'statusRelation', 'items.service', 'payments']);

        // Search filter (customer name or invoice number)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($customerQuery) use ($search) {
                      $customerQuery->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('surname', 'like', "%{$search}%")
                                    ->orWhere('org_name', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Payment status filter
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Date filter
        if ($request->filled('date_filter')) {
            $dateFilter = $request->date_filter;
            $now = now();
            
            switch ($dateFilter) {
                case 'current_year':
                    $query->whereYear('invoice_date', $now->year);
                    break;
                case 'current_month':
                    $query->whereYear('invoice_date', $now->year)
                          ->whereMonth('invoice_date', $now->month);
                    break;
                case 'current_quarter':
                    $query->whereYear('invoice_date', $now->year)
                          ->whereRaw('QUARTER(invoice_date) = ?', [$now->quarter]);
                    break;
                case 'last_quarter':
                    $lastQuarter = $now->subQuarter();
                    $query->whereYear('invoice_date', $lastQuarter->year)
                          ->whereRaw('QUARTER(invoice_date) = ?', [$lastQuarter->quarter]);
                    break;
                case 'last_year':
                    $query->whereYear('invoice_date', $now->year - 1);
                    break;
                default:
                    // Check if it's a specific year
                    if (is_numeric($dateFilter)) {
                        $query->whereYear('invoice_date', (int)$dateFilter);
                    }
                    break;
            }
        }

        // Get all invoices for stats calculation (without filters)
        $allInvoices = Invoice::where('company_id', $activeCompany->id)
            ->with(['statusRelation', 'items', 'payments'])
            ->get();

        // Calculate statistics from all invoices
        $stats = [
            'draft' => $allInvoices->filter(function($invoice) {
                return $invoice->statusRelation && strtolower($invoice->statusRelation->name) === 'draft';
            })->sum(function($invoice) {
                return $invoice->total;
            }),
            'sent' => $allInvoices->filter(function($invoice) {
                return $invoice->statusRelation && strtolower($invoice->statusRelation->name) === 'sent';
            })->sum(function($invoice) {
                return $invoice->total;
            }),
            'paid' => $allInvoices->filter(function($invoice) {
                return $invoice->payment_status === Invoice::PAYMENT_PAID;
            })->sum(function($invoice) {
                return $invoice->total;
            }),
            'overdue' => $allInvoices->filter(function($invoice) {
                return $invoice->isOverdue();
            })->sum(function($invoice) {
                return $invoice->amount_due;
            }),
            'outstanding' => $allInvoices->sum(function ($invoice) {
                return $invoice->isPaid() ? 0 : $invoice->amount_due;
            }),
            'paid_ytd' => $allInvoices->filter(function ($invoice) {
                return $invoice->payment_status === Invoice::PAYMENT_PAID
                    && $invoice->invoice_date
                    && $invoice->invoice_date->year === now()->year;
            })->sum(function ($invoice) {
                return $invoice->total;
            }),
            'peppol_sent' => $allInvoices->filter(function ($invoice) {
                $name = strtolower((string) $invoice->statusRelation?->name);
                return in_array($name, ['sent', 'paid'], true);
            })->count(),
        ];

        $statuses = Status::forTable('invoices')->pluck('name', 'id');

        // Paginate results
        $invoices = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'statuses' => $statuses,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create(Request $request): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $defaultStatus = Status::where('for', 'invoices')->where('name', 'Draft')->first()
            ?? Status::forTable('invoices')->first();

        $invoice = Invoice::create([
            'company_id' => $activeCompany->id,
            'customer_id' => null,
            'invoice_number' => $this->generateInvoiceNumber($activeCompany->id),
            'invoice_date' => now(),
            'due_date' => now()->addDays(30),
            'status' => $defaultStatus?->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);

        return redirect()->route('invoices.edit', $invoice);
    }

    /**
     * Create invoice from an existing offer.
     */
    public function createFromOffer(Request $request, $offer): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $offer = Offer::where('id', $offer)
            ->where('company_id', $activeCompany->id)
            ->with(['items.service'])
            ->firstOrFail();

        $defaultStatus = Status::where('for', 'invoices')->where('name', 'Draft')->first()
            ?? Status::forTable('invoices')->first();

        $invoice = Invoice::create([
            'company_id' => $activeCompany->id,
            'customer_id' => $offer->customer_id,
            'offer_id' => $offer->id,
            'invoice_number' => $this->generateInvoiceNumber($activeCompany->id),
            'invoice_date' => now(),
            'due_date' => now()->addDays(30),
            'intro' => $offer->intro,
            'desc' => $offer->desc,
            'notes' => $offer->notes,
            'status' => $defaultStatus?->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);

        foreach ($offer->items as $item) {
            $invoiceItem = new InvoiceItem([
                'service_id' => $item->service_id,
                'description' => $item->description,
                'quantity' => $item->quantity,
                'price' => $item->price,
            ]);
            $invoiceItem->calculateTotal();
            $invoice->items()->save($invoiceItem);
        }

        return redirect()->route('invoices.edit', $invoice);
    }

    /**
     * Store a newly created invoice in storage.
     */
    public function store(StoreInvoiceRequest $request): JsonResponse|RedirectResponse
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

        DB::beginTransaction();
        try {
            // Generate invoice number
            $invoiceNumber = $this->generateInvoiceNumber($activeCompany->id);

            // Determine status based on action
            $action = $request->validated()['action'] ?? 'draft';
            $statusId = $request->validated()['status'];

            // Create invoice
            $invoice = Invoice::create([
                'company_id' => $activeCompany->id,
                'customer_id' => $request->validated()['customer_id'],
                'offer_id' => $request->validated()['offer_id'] ?? null,
                'invoice_number' => $invoiceNumber,
                'invoice_date' => $request->validated()['invoice_date'] ?? now(),
                'due_date' => $request->validated()['due_date'] ?? now()->addDays(30),
                'intro' => $request->validated()['intro'] ?? null,
                'desc' => $request->validated()['desc'] ?? null,
                'notes' => $request->validated()['notes'] ?? null,
                'status' => $statusId,
                'payment_status' => Invoice::PAYMENT_UNPAID,
                'ip_transfer_type' => $request->validated()['ip_transfer_type'] ?? null,
            ]);

            // Create invoice items
            foreach ($request->validated()['items'] as $itemData) {
                $item = new InvoiceItem([
                    'service_id' => $itemData['service_id'],
                    'description' => $itemData['description'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                ]);
                $item->calculateTotal();
                $invoice->items()->save($item);
            }

            DB::commit();

            $invoice->load(['customer', 'statusRelation', 'items.service']);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Invoice created successfully.',
                    'data' => $invoice,
                    'redirect' => route('invoices.show', $invoice->id),
                ], 201);
            }

            return redirect()->route('invoices.show', $invoice->id)->with('status', 'invoice-created');
        } catch (\Exception $e) {
            DB::rollBack();
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Failed to create invoice.',
                    'errors' => ['general' => [$e->getMessage()]],
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Failed to create invoice: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified invoice.
     */
    public function show(Request $request, $invoice): InertiaResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany->id)
            ->with(['customer', 'statusRelation', 'items.service', 'company.companySetting', 'payments', 'offer'])
            ->firstOrFail();

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
            'paymentMethods' => Invoice::getPaymentMethods(),
        ]);
    }

    /**
     * Show the form for editing the specified invoice.
     */
    public function edit(Request $request, $invoice): InertiaResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany->id)
            ->with(['items.service', 'customer', 'statusRelation', 'company.companySetting'])
            ->firstOrFail();

        $customers = Customer::where('company_id', $activeCompany->id)
            ->orderBy('first_name')
            ->get()
            ->mapWithKeys(function ($customer) {
                return [$customer->id => $customer->first_name . ' ' . $customer->surname . ($customer->org_name ? ' (' . $customer->org_name . ')' : '')];
            });

        $services = Service::where('company_id', $activeCompany->id)
            ->orderBy('name')
            ->get();

        $statuses = Status::forTable('invoices')->pluck('name', 'id');

        // Prepare services data for JavaScript
        $servicesData = $services->map(function($service) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description ?? '',
                'price' => (float)$service->price,
                'unit' => $service->unit ?? '',
            ];
        })->values();

        // Prepare existing items data for JavaScript
        $existingItems = $invoice->items->map(function($item, $index) {
            return [
                'id' => $index,
                'service_id' => $item->service_id,
                'service_name' => $item->service->name ?? 'N/A',
                'description' => $item->description ?? '',
                'kind' => $item->service_id ? 'product' : 'custom',
                'quantity' => $item->quantity,
                'price' => (float)$item->price,
                'total' => (float)$item->total,
            ];
        })->values();

        return Inertia::render('Invoices/Create', [
            'invoice' => $invoice->loadMissing('offer'),
            'customers' => $customers,
            'services' => $services,
            'statuses' => $statuses,
            'defaultStatusId' => $invoice->status,
            'servicesData' => $servicesData,
            'existingItems' => $existingItems,
            'ipTransferTypes' => Invoice::getIpTransferTypes(),
            'vatRate' => SiteSetting::getInteger('default_vat_rate', 21),
            'nextInvoiceNumber' => $invoice->invoice_number,
            'customersData' => Customer::where('company_id', $activeCompany->id)
                ->get(['id', 'first_name', 'surname', 'org_name', 'office_address', 'email']),
        ]);
    }

    /**
     * Update the specified invoice in storage.
     */
    public function update(UpdateInvoiceRequest $request, $invoice): JsonResponse|RedirectResponse
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

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany->id)
            ->first();

        if (!$invoice) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Invoice not found or access denied.',
                    'errors' => ['invoice' => ['You do not have access to this invoice.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Invoice not found or access denied.');
        }

        DB::beginTransaction();
        try {
            // Update invoice
            $invoice->update([
                'customer_id' => $request->validated()['customer_id'] ?? null,
                'invoice_date' => $request->validated()['invoice_date'] ?? $invoice->invoice_date,
                'due_date' => $request->validated()['due_date'] ?? null,
                'intro' => $request->validated()['intro'] ?? null,
                'desc' => $request->validated()['desc'] ?? null,
                'notes' => $request->validated()['notes'] ?? null,
                'status' => $request->validated()['status'],
                'ip_transfer_type' => $request->validated()['ip_transfer_type'] ?? null,
            ]);

            // Delete existing items
            $invoice->items()->delete();

            // Create new items
            foreach ($request->validated()['items'] ?? [] as $itemData) {
                $item = new InvoiceItem([
                    'service_id' => $itemData['service_id'],
                    'description' => $itemData['description'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                ]);
                $item->calculateTotal();
                $invoice->items()->save($item);
            }

            DB::commit();

            $invoice->load(['customer', 'statusRelation', 'items.service']);

            if ($request->boolean('autosave')) {
                return back();
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Invoice updated successfully.',
                    'data' => $invoice,
                ]);
            }

            return redirect()->route('invoices.index')->with('status', 'invoice-updated');
        } catch (\Exception $e) {
            DB::rollBack();
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Failed to update invoice.',
                    'errors' => ['general' => [$e->getMessage()]],
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Failed to update invoice: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified invoice from storage.
     */
    public function destroy(Request $request, $invoice): JsonResponse|RedirectResponse
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

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany->id)
            ->first();

        if (!$invoice) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Invoice not found or access denied.',
                    'errors' => ['invoice' => ['You do not have access to this invoice.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Invoice not found or access denied.');
        }

        $invoice->delete(); // Soft delete

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Invoice deleted successfully.',
            ]);
        }

        return redirect()->route('invoices.index')->with('status', 'invoice-deleted');
    }

    /**
     * Send the invoice via email.
     */
    public function send(SendInvoiceRequest $request, $invoice): JsonResponse|RedirectResponse
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

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany->id)
            ->with(['customer', 'items.service', 'company.companySetting'])
            ->first();

        if (!$invoice) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Invoice not found or access denied.',
                    'errors' => ['invoice' => ['You do not have access to this invoice.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Invoice not found or access denied.');
        }

        try {
            // Generate PDF
            $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $invoice]);
            
            // Generate UBL XML if requested
            $ublXml = null;
            if ($request->validated()['attach_ubl'] ?? false) {
                $ublService = new UblInvoiceService();
                $ublXml = $ublService->generate($invoice);
            }

            // Build mailable
            $mailable = new InvoiceSent(
                $invoice, 
                $request->validated()['message'] ?? '',
                $pdf->output(),
                $ublXml
            );

            // Send to customer
            Mail::to($request->validated()['email'])->send($mailable);

            // Send CC to company if requested
            if ($request->validated()['cc_company'] ?? false) {
                if ($activeCompany->email) {
                    Mail::to($activeCompany->email)->send($mailable);
                }
            }

            // Update invoice status to "Sent" if it was Draft
            if ($invoice->isDraft()) {
                $sentStatus = Status::forTable('invoices')->where('name', 'Sent')->first();
                if ($sentStatus) {
                    $invoice->update(['status' => $sentStatus->id]);
                }
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Invoice sent successfully.',
                ]);
            }

            return redirect()->route('invoices.show', $invoice->id)->with('status', 'invoice-sent');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Failed to send invoice.',
                    'errors' => ['email' => [$e->getMessage()]],
                ], 500);
            }

            return redirect()->back()->with('error', 'Failed to send invoice: ' . $e->getMessage());
        }
    }

    /**
     * Download invoice as PDF.
     */
    public function download(Request $request, $invoice): Response|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany->id)
            ->with(['customer', 'items.service', 'company.companySetting'])
            ->firstOrFail();

        $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $invoice]);

        $filename = 'invoice-' . ($invoice->invoice_number ?? $invoice->id) . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Download invoice as UBL XML.
     */
    public function downloadUbl(Request $request, $invoice): Response|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany->id)
            ->with(['customer', 'items.service', 'company.companySetting'])
            ->firstOrFail();

        $ublService = new UblInvoiceService();
        $xml = $ublService->generate($invoice);

        $filename = 'invoice-' . ($invoice->invoice_number ?? $invoice->id) . '.xml';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Record a payment for the invoice.
     */
    public function recordPayment(RecordPaymentRequest $request, $invoice): JsonResponse|RedirectResponse
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

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany->id)
            ->with(['payments'])
            ->first();

        if (!$invoice) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Invoice not found or access denied.',
                    'errors' => ['invoice' => ['You do not have access to this invoice.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Invoice not found or access denied.');
        }

        try {
            // Create payment record
            InvoicePayment::create([
                'invoice_id' => $invoice->id,
                'amount' => $request->validated()['amount'],
                'payment_date' => $request->validated()['payment_date'],
                'payment_method' => $request->validated()['payment_method'] ?? null,
                'reference' => $request->validated()['reference'] ?? null,
                'notes' => $request->validated()['notes'] ?? null,
            ]);

            // Update invoice payment status
            $invoice->refresh();
            $invoice->updatePaymentStatus();

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Payment recorded successfully.',
                    'data' => [
                        'amount_paid' => $invoice->amount_paid,
                        'amount_due' => $invoice->amount_due,
                        'payment_status' => $invoice->payment_status,
                    ],
                ]);
            }

            return redirect()->route('invoices.show', $invoice->id)->with('status', 'payment-recorded');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Failed to record payment.',
                    'errors' => ['general' => [$e->getMessage()]],
                ], 500);
            }

            return redirect()->back()->with('error', 'Failed to record payment: ' . $e->getMessage());
        }
    }

    /**
     * Generate invoice number automatically.
     */
    private function generateInvoiceNumber(int $companyId): string
    {
        $year = now()->format('Y');
        $prefix = SiteSetting::get('invoice_prefix', 'INV-');
        
        // Ensure prefix ends with a separator for pattern matching
        $prefixPattern = rtrim($prefix, '-');
        
        // Get the last invoice number for this company and year
        $lastInvoice = Invoice::where('company_id', $companyId)
            ->where('invoice_number', 'like', "{$prefixPattern}{$year}-%")
            ->orderBy('id', 'desc')
            ->first();
        
        if ($lastInvoice && preg_match('/' . preg_quote($prefixPattern, '/') . '\d{4}-(\d+)/', $lastInvoice->invoice_number, $matches)) {
            $nextNumber = (int)$matches[1] + 1;
        } else {
            $nextNumber = 1;
        }
        
        return $prefixPattern . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
