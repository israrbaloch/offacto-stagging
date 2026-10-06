<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecordPaymentRequest;
use App\Http\Requests\SendInvoiceRequest;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Mail\InvoiceSent;
use App\Models\CompanyLegalDocument;
use App\Models\Customer;
use App\Mail\InvoiceReminder;
use App\Models\Invoice;
use App\Models\InvoiceAttachment;
use App\Models\InvoiceItem;
use App\Models\InvoicePayment;
use App\Models\Offer;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\Status;
use App\Services\NumberingSeriesService;
use App\Support\CompanyAccess;
use App\Support\InvoiceMessage;
use App\Support\RecurringInvoice;
use App\Services\MolliePaymentService;
use App\Services\Postbode\PostbodeApiException;
use App\Services\Postbode\PostbodeSendService;
use App\Support\CompanyIntegrations;
use App\Services\PdfZipExportService;
use App\Services\PeppolSendService;
use App\Services\UblInvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as FoundationResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
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

        if ($deny = CompanyAccess::denyCreate($user, $activeCompany, 'invoices', 'invoices.create')) {
            return $deny;
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

        if ($deny = CompanyAccess::denyCreate($user, $activeCompany, 'invoices', 'invoices.create')) {
            return $deny;
        }

        $offer = Offer::where('id', $offer)
            ->where('company_id', $activeCompany->id)
            ->with(['items.service', 'attachments'])
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
            'email_message' => $offer->email_message,
            'status' => $defaultStatus?->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);

        foreach ($offer->attachments as $attachment) {
            if (! Storage::disk('public')->exists($attachment->file_path)) {
                continue;
            }
            $basename = basename($attachment->file_path);
            $newPath = 'invoice-attachments/'.$invoice->id.'/'.$basename;
            Storage::disk('public')->copy($attachment->file_path, $newPath);
            $invoice->attachments()->create([
                'file_path' => $newPath,
                'original_name' => $attachment->original_name,
            ]);
        }

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

        if ($deny = CompanyAccess::denyCreate($user, $activeCompany, 'invoices', 'invoices.create')) {
            return $deny;
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
            ->with(['customer', 'statusRelation', 'items.service', 'company.companySetting', 'payments', 'offer', 'attachments', 'company'])
            ->firstOrFail();

        if ($invoice->mollie_payment_id && ! $invoice->isPaid()) {
            app(MolliePaymentService::class)->syncInvoicePayment($invoice->mollie_payment_id);
            $invoice->refresh();
            $invoice->load(['customer', 'statusRelation', 'items.service', 'company.companySetting', 'payments', 'offer', 'attachments', 'company']);
        }

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
            'ipTransferTypes' => Invoice::getIpTransferTypes(),
            'paymentMethods' => Invoice::getPaymentMethods(),
            'peppolConfigured' => filled(config('services.peppol.endpoint')) && filled(config('services.peppol.token')),
            'mollieConfigured' => CompanyIntegrations::mollieConfigured($activeCompany),
            'postbodeConfigured' => CompanyIntegrations::postbodeConfigured($activeCompany),
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
            ->with(['items.service', 'customer', 'statusRelation', 'company.companySetting', 'attachments'])
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
                'billing_mode' => $service->billing_mode ?? 'fixed',
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
                'billing_mode' => $item->service->billing_mode ?? 'fixed',
                'unit' => $item->service->unit ?? '',
            ];
        })->values();

        return Inertia::render('Invoices/Create', [
            'invoice' => $invoice->loadMissing('offer'),
            'legalDocuments' => $activeCompany->legalDocuments()->latest()->get(),
            'postbodeConfigured' => CompanyIntegrations::postbodeConfigured($activeCompany),
            'peppolConfigured' => filled(config('services.peppol.endpoint')) && filled(config('services.peppol.token')),
            'mollieConfigured' => CompanyIntegrations::mollieConfigured($activeCompany),
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
            ->with('statusRelation')
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

        $wasSent = ! $invoice->isDraft();

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
                'email_message' => $request->validated()['email_message'] ?? $invoice->email_message,
                'status' => $request->validated()['status'],
                'ip_transfer_type' => $request->validated()['ip_transfer_type'] ?? null,
                'needs_resend' => $wasSent ? true : $invoice->needs_resend,
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

            $flash = $wasSent ? 'invoice-updated-resend' : 'invoice-updated';

            return redirect()->route('invoices.edit', $invoice->id)->with('status', $flash);
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
            ->with('statusRelation')
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

        if (! $invoice->isDraft()) {
            return redirect()->back()->with('error', 'Sent invoices cannot be deleted.');
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
    public function send(
        SendInvoiceRequest $request,
        $invoice,
        PostbodeSendService $postbode,
        PeppolSendService $peppol,
        MolliePaymentService $mollie,
    ): JsonResponse|RedirectResponse
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

        if ($deny = CompanyAccess::denySend($user, $activeCompany, 'invoices.send')) {
            return $deny;
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
            if (! $invoice->customer_id) {
                return redirect()->back()->with('error', 'Select a customer before sending.');
            }

            $channels = $request->validated()['channels'];
            $invoice->loadMissing(['customer', 'items.service', 'company.companySetting', 'attachments', 'company']);

            $wantsMollie = in_array('mollie', $channels, true);
            $wantsEmail = in_array('email', $channels, true);

            if ($wantsMollie && ! CompanyIntegrations::mollieConfigured($activeCompany)) {
                return redirect()->back()->with('error', 'Mollie is not configured for this workspace.');
            }

            if (($wantsMollie || $wantsEmail) && CompanyIntegrations::mollieConfigured($activeCompany) && ! $invoice->isPaid()) {
                $mollie->ensureCheckoutForSend($invoice, $activeCompany, $wantsMollie);
                $invoice->refresh();
            }

            if ($wantsEmail) {
                $pdf = $this->invoicePdf($invoice);

                $ublXml = null;
                if ($request->validated()['attach_ubl'] ?? false) {
                    $ublService = new UblInvoiceService();
                    $ublXml = $ublService->generate($invoice);
                }

                $rawMessage = $request->validated()['message'] ?? $invoice->email_message ?? '';
                $body = InvoiceMessage::merge($rawMessage, $invoice);

                $legalIds = $request->validated()['legal_document_ids'] ?? null;
                $legalQuery = CompanyLegalDocument::where('company_id', $activeCompany->id);
                $legalDocs = $legalIds === null
                    ? $legalQuery->where('attach_to_quotes_default', true)->get()
                    : $legalQuery->whereIn('id', $legalIds)->get();

                $mailable = new InvoiceSent(
                    $invoice,
                    $body,
                    $pdf->output(),
                    $ublXml,
                    $legalDocs->all(),
                );

                $recipients = array_values(array_unique($request->validated()['emails'] ?? []));
                Mail::to($recipients)->send($mailable);

                if ($request->validated()['cc_company'] ?? false) {
                    if ($activeCompany->email) {
                        Mail::to($activeCompany->email)->send($mailable);
                    }
                }
            }

            if (in_array('postbode', $channels, true)) {
                $settings = CompanyIntegrations::settings($activeCompany);
                if (! $settings || ! CompanyIntegrations::postbodeConfigured($activeCompany)) {
                    return redirect()->back()->with('error', 'Postbode is not configured for this workspace.');
                }

                $result = $postbode->sendInvoice(
                    $invoice,
                    $settings,
                    $request->has('registered') ? $request->boolean('registered') : null,
                );

                $invoice->update([
                    'postbode_sent_at' => now(),
                    'postbode_postal_uuid' => $result['uuid'],
                    'postbode_status' => $result['status'],
                    'postbode_customer_reference' => $result['reference'],
                ]);
            }

            if (in_array('peppol', $channels, true)) {
                if (! filled(config('services.peppol.endpoint')) || ! filled(config('services.peppol.token'))) {
                    return redirect()->back()->with('error', 'Peppol is not configured.');
                }
                $peppol->send($invoice);
            }

            if ($invoice->isDraft()) {
                $sentStatus = Status::forTable('invoices')->where('name', 'Sent')->first();
                if ($sentStatus) {
                    $invoice->update(['status' => $sentStatus->id]);
                }
            }

            $invoice->update(['needs_resend' => false]);

            $emailed = in_array('email', $channels, true);
            $postbodeSent = in_array('postbode', $channels, true);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Invoice sent successfully.',
                ]);
            }

            if ($postbodeSent && ! $emailed) {
                return redirect()->back()->with('status', 'postbode-sent');
            }

            return redirect()->back()->with('status', 'invoice-sent');
        } catch (PostbodeApiException $e) {
            return redirect()->back()->with('error', $e->getMessage());
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
     * Export filtered invoices as a ZIP of PDFs.
     */
    public function exportZip(Request $request, PdfZipExportService $zipExport): StreamedResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $query = Invoice::where('company_id', $activeCompany->id)
            ->with(['customer', 'items.service', 'company.companySetting']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery->where('first_name', 'like', "%{$search}%")
                            ->orWhere('surname', 'like', "%{$search}%")
                            ->orWhere('org_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('date_filter')) {
            $this->applyInvoiceDateFilter($query, $request->date_filter);
        }

        $invoices = $query->latest()->get();

        if ($invoices->isEmpty()) {
            return redirect()->route('invoices.index')->with('error', 'No invoices to export.');
        }

        return $zipExport->download(
            $invoices,
            fn (Invoice $invoice) => $this->invoicePdf($invoice),
            fn (Invoice $invoice) => 'invoice-'.($invoice->invoice_number ?? $invoice->id).'.pdf',
            'invoices-'.now()->format('Y-m-d').'.zip'
        );
    }

    /**
     * Stream invoice PDF in the browser.
     */
    public function preview(Request $request, $invoice): Response|RedirectResponse
    {
        return $this->invoicePdfResponse($request, $invoice, 'preview');
    }

    /**
     * Download invoice as PDF.
     */
    public function download(Request $request, $invoice): Response|RedirectResponse
    {
        return $this->invoicePdfResponse($request, $invoice, 'download');
    }

    private function invoicePdfResponse(Request $request, $invoice, string $mode): Response|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany->id)
            ->firstOrFail();

        $filename = 'invoice-' . ($invoice->invoice_number ?? $invoice->id) . '.pdf';
        $pdf = $this->invoicePdf($invoice);

        return $mode === 'preview'
            ? $pdf->stream($filename)
            : $pdf->download($filename);
    }

    private function invoicePdf(Invoice $invoice): DomPdf
    {
        $invoice->loadMissing(['customer', 'items.service', 'company.companySetting', 'offer']);

        return Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'vatRate' => SiteSetting::getInteger('default_vat_rate', 21),
        ])->setPaper('a4');
    }

    private function applyInvoiceDateFilter($query, string $dateFilter): void
    {
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
                $lastQuarter = $now->copy()->subQuarter();
                $query->whereYear('invoice_date', $lastQuarter->year)
                    ->whereRaw('QUARTER(invoice_date) = ?', [$lastQuarter->quarter]);
                break;
            case 'last_year':
                $query->whereYear('invoice_date', $now->year - 1);
                break;
            default:
                if (is_numeric($dateFilter)) {
                    $query->whereYear('invoice_date', (int) $dateFilter);
                }
                break;
        }
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

    public function storeAttachment(Request $request, $invoice): RedirectResponse
    {
        $activeCompany = $request->user()?->activeCompany();
        $invoice = Invoice::where('id', $invoice)->where('company_id', $activeCompany?->id)->firstOrFail();

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);

        $path = $request->file('file')->store('invoice-attachments/'.$invoice->id, 'public');
        InvoiceAttachment::create([
            'invoice_id' => $invoice->id,
            'file_path' => $path,
            'original_name' => $request->file('file')->getClientOriginalName(),
        ]);

        return back()->with('status', 'attachment-uploaded');
    }

    public function destroyAttachment(Request $request, $invoice, InvoiceAttachment $attachment): RedirectResponse
    {
        $activeCompany = $request->user()?->activeCompany();
        $invoice = Invoice::where('id', $invoice)->where('company_id', $activeCompany?->id)->firstOrFail();

        if ($attachment->invoice_id !== $invoice->id) {
            abort(404);
        }

        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return back()->with('status', 'attachment-deleted');
    }

    public function createCreditNote(Request $request, $invoice): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'invoices.credit_note')) {
            return $deny;
        }
        if ($deny = CompanyAccess::denyCreate($user, $activeCompany, 'invoices', 'invoices.create')) {
            return $deny;
        }

        $source = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany?->id)
            ->with('items')
            ->firstOrFail();

        $draftStatus = Status::forTable('invoices')->where('name', 'Draft')->first();

        $credit = DB::transaction(function () use ($source, $draftStatus, $activeCompany) {
            $credit = Invoice::create([
                'company_id' => $activeCompany->id,
                'customer_id' => $source->customer_id,
                'offer_id' => $source->offer_id,
                'invoice_number' => $this->generateCreditNoteNumber($activeCompany->id),
                'invoice_date' => now(),
                'due_date' => now(),
                'intro' => $source->intro,
                'desc' => 'Credit note for '.$source->invoice_number,
                'notes' => $source->notes,
                'status' => $draftStatus?->id,
                'payment_status' => Invoice::PAYMENT_UNPAID,
                'parent_invoice_id' => $source->id,
            ]);

            foreach ($source->items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $credit->id,
                    'service_id' => $item->service_id,
                    'description' => $item->description,
                    'quantity' => -1 * abs((float) $item->quantity),
                    'price' => $item->price,
                ]);
            }

            return $credit;
        });

        return redirect()->route('invoices.edit', $credit->id)->with('status', 'credit-note-created');
    }

    public function sendReminder(Request $request, $invoice): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'invoices.reminder')) {
            return $deny;
        }

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany?->id)
            ->with(['customer', 'items.service', 'company.companySetting'])
            ->firstOrFail();

        $request->validate([
            'message' => ['nullable', 'string', 'max:10000'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $message = $request->input('message');
        Mail::to($request->input('email'))->send(new InvoiceReminder(
            $invoice,
            is_string($message) ? $message : '',
        ));

        return back()->with('status', 'reminder-sent');
    }

    public function createMollieCheckout(Request $request, $invoice, MolliePaymentService $mollie): RedirectResponse|FoundationResponse
    {
        $user = $request->user();
        $activeCompany = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'invoices.mollie')) {
            return $deny;
        }

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany?->id)
            ->firstOrFail();

        $url = $mollie->createCheckout($invoice, $activeCompany);

        return Inertia::location($url);
    }

    public function sendPeppol(Request $request, $invoice, PeppolSendService $peppol): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'invoices.peppol')) {
            return $deny;
        }

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany?->id)
            ->with(['customer', 'items.service', 'company.companySetting'])
            ->firstOrFail();

        $peppol->send($invoice);

        return back()->with('status', 'peppol-sent');
    }

    public function sendPostbode(Request $request, $invoice, PostbodeSendService $postbode): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'invoices.postbode')) {
            return $deny;
        }

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany?->id)
            ->firstOrFail();

        $settings = CompanyIntegrations::settings($activeCompany);
        if (! $settings || ! CompanyIntegrations::postbodeConfigured($activeCompany)) {
            return back()->with('error', 'Postbode is not configured for this workspace. Add your API token under Profile → Integrations.');
        }

        $validated = $request->validate([
            'registered' => ['nullable', 'boolean'],
        ]);

        try {
            $result = $postbode->sendInvoice(
                $invoice,
                $settings,
                $request->has('registered') ? $request->boolean('registered') : null,
            );

            $invoice->update([
                'postbode_sent_at' => now(),
                'postbode_postal_uuid' => $result['uuid'],
                'postbode_status' => $result['status'],
                'postbode_customer_reference' => $result['reference'],
            ]);

            return back()->with('status', 'postbode-sent');
        } catch (PostbodeApiException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Postbode could not send this invoice.');
        }
    }

    public function configureRecurring(Request $request, $invoice): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'invoices.recurring')) {
            return $deny;
        }

        $invoice = Invoice::where('id', $invoice)
            ->where('company_id', $activeCompany?->id)
            ->firstOrFail();

        $validated = $request->validate([
            'is_recurring' => ['required', 'boolean'],
            'recurring_interval' => ['nullable', 'required_if:is_recurring,true', 'in:weekly,monthly,yearly'],
        ]);

        $enabled = (bool) $validated['is_recurring'];
        $interval = $enabled ? ($validated['recurring_interval'] ?? 'monthly') : null;

        $payload = [
            'is_recurring' => $enabled,
            'recurring_interval' => $interval,
        ];

        if (! $enabled) {
            $payload['next_run_at'] = null;
        } else {
            $intervalChanged = $invoice->recurring_interval !== $interval;
            if (! $invoice->is_recurring || ! $invoice->next_run_at || $intervalChanged) {
                $payload['next_run_at'] = RecurringInvoice::initialNextRun($interval);
            }
        }

        $invoice->update($payload);

        return back()->with('status', 'recurring-updated');
    }

    /**
     * Generate invoice number automatically.
     */
    private function generateInvoiceNumber(int $companyId): string
    {
        return app(NumberingSeriesService::class)->nextForCompany($companyId, 'invoices');
    }

    private function generateCreditNoteNumber(int $companyId): string
    {
        return app(NumberingSeriesService::class)->nextForCompany($companyId, 'credit_notes');
    }

}
