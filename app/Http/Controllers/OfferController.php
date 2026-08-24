<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendOfferRequest;
use App\Http\Requests\StoreOfferRequest;
use App\Http\Requests\UpdateOfferRequest;
use App\Mail\OfferSent;
use App\Models\Customer;
use App\Models\Offer;
use App\Models\OfferItem;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\Status;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class OfferController extends Controller
{
    /**
     * Display a listing of the offers.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        // Build query with filters
        $query = Offer::where('company_id', $activeCompany->id)
            ->with(['customer', 'statusRelation', 'items.service']);

        // Search filter (customer name or offer number)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('offer_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($customerQuery) use ($search) {
                      $customerQuery->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('surname', 'like', "%{$search}%")
                                    ->orWhere('org_name', 'like', "%{$search}%");
                  });
            });
        }

        // Date filter
        if ($request->filled('date_filter')) {
            $dateFilter = $request->date_filter;
            $now = now();
            
            switch ($dateFilter) {
                case 'current_year':
                    $query->whereYear('offer_date', $now->year);
                    break;
                case 'current_month':
                    $query->whereYear('offer_date', $now->year)
                          ->whereMonth('offer_date', $now->month);
                    break;
                case 'current_quarter':
                    $query->whereYear('offer_date', $now->year)
                          ->whereRaw('QUARTER(offer_date) = ?', [$now->quarter]);
                    break;
                case 'last_quarter':
                    $lastQuarter = $now->subQuarter();
                    $query->whereYear('offer_date', $lastQuarter->year)
                          ->whereRaw('QUARTER(offer_date) = ?', [$lastQuarter->quarter]);
                    break;
                case 'last_year':
                    $query->whereYear('offer_date', $now->year - 1);
                    break;
                default:
                    // Check if it's a specific year
                    if (is_numeric($dateFilter)) {
                        $query->whereYear('offer_date', (int)$dateFilter);
                    }
                    break;
            }
        }

        // Get all offers for stats calculation (without filters)
        $allOffers = Offer::where('company_id', $activeCompany->id)
            ->with(['statusRelation', 'items'])
            ->get();

        // Calculate statistics from all offers
        $stats = [
            'open' => $allOffers->filter(function($offer) {
                return $offer->statusRelation && in_array(strtolower($offer->statusRelation->name), ['draft', 'sent', 'pending']);
            })->sum(function($offer) {
                return $offer->total;
            }),
            'accepted' => $allOffers->filter(function($offer) {
                return $offer->statusRelation && strtolower($offer->statusRelation->name) === 'accepted';
            })->sum(function($offer) {
                return $offer->total;
            }),
            'invoiced' => $allOffers->filter(function($offer) {
                return $offer->statusRelation && strtolower($offer->statusRelation->name) === 'invoiced';
            })->sum(function($offer) {
                return $offer->total;
            }),
            'expired' => $allOffers->filter(function ($offer) {
                $name = strtolower((string) $offer->statusRelation?->name);
                return $offer->valid_until
                    && $offer->valid_until->isPast()
                    && in_array($name, ['draft', 'sent', 'pending', 'open'], true);
            })->sum(function ($offer) {
                return $offer->total;
            }),
        ];

        $statuses = Status::forTable('offers')->pluck('name', 'id');

        // Paginate results
        $offers = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Offers/Index', [
            'offers' => $offers,
            'statuses' => $statuses,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new offer.
     */
    public function create(Request $request): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $defaultStatus = Status::where('for', 'offers')->where('name', 'Draft')->first()
            ?? Status::forTable('offers')->first();

        $offer = Offer::create([
            'company_id' => $activeCompany->id,
            'customer_id' => null,
            'offer_number' => $this->generateOfferNumber($activeCompany->id),
            'offer_date' => now(),
            'status' => $defaultStatus?->id,
        ]);

        return redirect()->route('offers.edit', $offer);
    }

    /**
     * Store a newly created offer in storage.
     */
    public function store(StoreOfferRequest $request): JsonResponse|RedirectResponse
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
            // Generate offer number
            $offerNumber = $this->generateOfferNumber($activeCompany->id);

            // Create offer
            $offer = Offer::create([
                'company_id' => $activeCompany->id,
                'customer_id' => $request->validated()['customer_id'],
                'offer_number' => $offerNumber,
                'offer_date' => $request->validated()['offer_date'] ?? now(),
                'valid_until' => $request->validated()['valid_until'] ?? null,
                'intro' => $request->validated()['intro'] ?? null,
                'desc' => $request->validated()['desc'] ?? null,
                'notes' => $request->validated()['notes'] ?? null,
                'status' => $request->validated()['status'],
            ]);

            // Create offer items
            foreach ($request->validated()['items'] as $itemData) {
                $item = new OfferItem([
                    'service_id' => $itemData['service_id'],
                    'description' => $itemData['description'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                ]);
                $item->calculateTotal();
                $offer->items()->save($item);
            }

            DB::commit();

            $offer->load(['customer', 'statusRelation', 'items.service']);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Offer created successfully.',
                    'data' => $offer,
                ], 201);
            }

            return redirect()->route('offers.index')->with('status', 'offer-created');
        } catch (\Exception $e) {
            DB::rollBack();
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Failed to create offer.',
                    'errors' => ['general' => [$e->getMessage()]],
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Failed to create offer: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified offer.
     */
    public function show(Request $request, $offer): Response|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $offer = Offer::where('id', $offer)
            ->where('company_id', $activeCompany->id)
            ->with(['customer', 'statusRelation', 'items.service', 'company.companySetting'])
            ->firstOrFail();

        return Inertia::render('Offers/Show', [
            'offer' => $offer,
        ]);
    }

    /**
     * Show the form for editing the specified offer.
     */
    public function edit(Request $request, $offer): Response|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $offer = Offer::where('id', $offer)
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

        $statuses = Status::forTable('offers')->pluck('name', 'id');

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
        $existingItems = $offer->items->map(function($item, $index) {
            return [
                'id' => $index,
                'service_id' => $item->service_id,
                'service_name' => $item->service->name ?? 'N/A',
                'description' => $item->description ?? '',
                'kind' => $item->service_id ? 'product' : ((float) $item->price === 0.0 && (float) $item->quantity === 0.0 ? 'text' : 'custom'),
                'quantity' => $item->quantity,
                'price' => (float)$item->price,
                'total' => (float)$item->total,
            ];
        })->values();

        return Inertia::render('Offers/Create', [
            'offer' => $offer,
            'customers' => $customers,
            'services' => $services,
            'statuses' => $statuses,
            'defaultStatusId' => $offer->status,
            'servicesData' => $servicesData,
            'existingItems' => $existingItems,
            'vatRate' => SiteSetting::getInteger('default_vat_rate', 21),
            'nextOfferNumber' => $offer->offer_number,
            'customersData' => Customer::where('company_id', $activeCompany->id)
                ->get(['id', 'first_name', 'surname', 'org_name', 'office_address', 'email']),
        ]);
    }

    /**
     * Update the specified offer in storage.
     */
    public function update(UpdateOfferRequest $request, $offer): JsonResponse|RedirectResponse
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

        $offer = Offer::where('id', $offer)
            ->where('company_id', $activeCompany->id)
            ->first();

        if (!$offer) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Offer not found or access denied.',
                    'errors' => ['offer' => ['You do not have access to this offer.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Offer not found or access denied.');
        }

        DB::beginTransaction();
        try {
            // Update offer
            $offer->update([
                'customer_id' => $request->validated()['customer_id'] ?? null,
                'offer_date' => $request->validated()['offer_date'] ?? $offer->offer_date,
                'valid_until' => $request->validated()['valid_until'] ?? null,
                'intro' => $request->validated()['intro'] ?? null,
                'desc' => $request->validated()['desc'] ?? null,
                'notes' => $request->validated()['notes'] ?? null,
                'status' => $request->validated()['status'],
            ]);

            $offer->items()->delete();

            foreach ($request->validated()['items'] ?? [] as $itemData) {
                $item = new OfferItem([
                    'service_id' => $itemData['service_id'],
                    'description' => $itemData['description'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                ]);
                $item->calculateTotal();
                $offer->items()->save($item);
            }

            DB::commit();

            $offer->load(['customer', 'statusRelation', 'items.service']);

            if ($request->boolean('autosave')) {
                return back();
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Offer updated successfully.',
                    'data' => $offer,
                ]);
            }

            return redirect()->route('offers.index')->with('status', 'offer-updated');
        } catch (\Exception $e) {
            DB::rollBack();
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Failed to update offer.',
                    'errors' => ['general' => [$e->getMessage()]],
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Failed to update offer: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified offer from storage.
     */
    public function destroy(Request $request, $offer): JsonResponse|RedirectResponse
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

        $offer = Offer::where('id', $offer)
            ->where('company_id', $activeCompany->id)
            ->first();

        if (!$offer) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Offer not found or access denied.',
                    'errors' => ['offer' => ['You do not have access to this offer.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Offer not found or access denied.');
        }

        $offer->delete(); // Soft delete

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Offer deleted successfully.',
            ]);
        }

        return redirect()->route('offers.index')->with('status', 'offer-deleted');
    }

    /**
     * Send the offer via email.
     */
    public function send(SendOfferRequest $request, $offer): JsonResponse|RedirectResponse
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

        $offer = Offer::where('id', $offer)
            ->where('company_id', $activeCompany->id)
            ->with(['customer', 'items.service', 'company'])
            ->first();

        if (!$offer) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Offer not found or access denied.',
                    'errors' => ['offer' => ['You do not have access to this offer.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Offer not found or access denied.');
        }

        try {
            $offer->loadMissing(['customer', 'items.service', 'company.companySetting']);
            $sentStatus = Status::where('for', 'offers')->where('name', 'Sent')->first();
            if ($sentStatus) {
                $offer->update(['status' => $sentStatus->id]);
            }

            Mail::to($request->validated()['email'])->send(
                new OfferSent($offer, $request->validated()['message'] ?? '')
            );

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Offer sent successfully.',
                ]);
            }

            return redirect()->route('offers.index')->with('status', 'offer-sent');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Failed to send offer.',
                    'errors' => ['email' => [$e->getMessage()]],
                ], 500);
            }

            return redirect()->back()->with('error', 'Failed to send offer: ' . $e->getMessage());
        }
    }

    public function preview(Request $request, $offer): HttpResponse|RedirectResponse
    {
        return $this->offerPdf($request, $offer, 'preview');
    }

    public function download(Request $request, $offer): HttpResponse|RedirectResponse
    {
        return $this->offerPdf($request, $offer, 'download');
    }

    private function offerPdf(Request $request, $offer, string $mode): HttpResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (!$activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $offer = Offer::where('id', $offer)
            ->where('company_id', $activeCompany->id)
            ->with(['customer', 'items.service', 'company.companySetting', 'statusRelation'])
            ->firstOrFail();

        $status = strtolower((string) $offer->statusRelation?->name);
        if (! in_array($status, ['sent', 'accepted', 'invoiced'], true)) {
            abort(403, 'The PDF is available after the offer is sent.');
        }

        $pdf = Pdf::loadView('pdf.offer', [
            'offer' => $offer,
            'vatRate' => SiteSetting::getInteger('default_vat_rate', 21),
        ])->setPaper('a4');

        $filename = 'quotation-'.($offer->offer_number ?? $offer->id).'.pdf';

        return $mode === 'preview'
            ? $pdf->stream($filename)
            : $pdf->download($filename);
    }

    /**
     * Generate offer number automatically.
     */
    private function generateOfferNumber(int $companyId): string
    {
        $year = now()->format('Y');
        $prefix = SiteSetting::get('offer_prefix', 'OFF-');
        
        // Ensure prefix ends with a separator for pattern matching
        $prefixPattern = rtrim($prefix, '-');
        
        // Get the last offer number for this company and year
        $lastOffer = Offer::where('company_id', $companyId)
            ->where('offer_number', 'like', "{$prefixPattern}{$year}-%")
            ->orderBy('id', 'desc')
            ->first();
        
        if ($lastOffer && preg_match('/' . preg_quote($prefixPattern, '/') . '\d{4}-(\d+)/', $lastOffer->offer_number, $matches)) {
            $nextNumber = (int)$matches[1] + 1;
        } else {
            $nextNumber = 1;
        }
        
        return $prefixPattern . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
