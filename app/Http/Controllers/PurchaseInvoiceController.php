<?php

namespace App\Http\Controllers;

use App\Http\Requests\SavePurchaseInvoiceRequest;
use App\Models\PurchaseInvoice;
use App\Models\Supplier;
use App\Services\PurchaseInvoiceReviewService;
use App\Support\CompanyAccess;
use App\Support\PurchaseCategories;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PurchaseInvoiceController extends Controller
{
    public function __construct(private PurchaseInvoiceReviewService $review) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $invoices = PurchaseInvoice::query()
            ->where('company_id', $company->id)
            ->with(['supplier', 'lines'])
            ->orderByDesc('invoice_date')
            ->orderByDesc('id')
            ->get();

        $selected = $request->integer('invoice');
        if (! $selected) {
            $selected = $invoices->firstWhere('status', PurchaseInvoice::STATUS_REVIEW)?->id
                ?? $invoices->first()?->id;
        }

        $slug = Str::slug($company->company_name ?: 'company') ?: 'company';

        return Inertia::render('Purchases/Index', [
            'invoices' => $invoices,
            'suppliers' => Supplier::query()->where('company_id', $company->id)->orderBy('name')->get(),
            'categories' => PurchaseCategories::KEYS,
            'selectedId' => $selected,
            'inboxAddress' => $slug.'@in.offacto.app',
        ]);
    }

    public function store(SavePurchaseInvoiceRequest $request): RedirectResponse
    {
        $company = $this->companyOrRedirect($request);
        if ($company instanceof RedirectResponse) {
            return $company;
        }

        try {
            $invoice = $this->persistNew($request, $company);
        } catch (UniqueConstraintViolationException) {
            return back()->withErrors([
                'invoice_number' => 'This supplier already has that invoice number.',
            ])->withInput();
        }

        return redirect()->route('purchases.index', ['invoice' => $invoice->id])->with('status', 'purchase-saved');
    }

    private function persistNew(SavePurchaseInvoiceRequest $request, $company): PurchaseInvoice
    {
        return DB::transaction(function () use ($request, $company) {
            $supplier = $this->resolveSupplier($company->id, $request);
            $totals = $this->totals($request);
            $file = $this->storeFile($request, $company->id);
            $flags = $this->review->detect($company->id, $this->flagPayload($supplier->id, $request, $totals['amount_incl']), null, $file['contents']);

            $invoice = PurchaseInvoice::create([
                'company_id' => $company->id,
                'supplier_id' => $supplier->id,
                'invoice_number' => $request->string('invoice_number')->toString(),
                'invoice_date' => $request->date('invoice_date'),
                'due_date' => $request->date('due_date'),
                'category' => $request->string('category')->toString(),
                'status' => PurchaseInvoice::STATUS_REVIEW,
                ...$totals,
                'iban' => $this->review->normalizeIban($request->input('iban')) ?: null,
                'payment_note' => $request->input('payment_note'),
                'flags' => $flags,
                'file_path' => $file['path'],
                'file_name' => $file['name'],
            ]);

            $this->syncLines($invoice, $request->input('lines'));
            $this->review->syncSupplierIban($supplier, $invoice->iban);

            return $invoice;
        });
    }

    public function update(SavePurchaseInvoiceRequest $request, PurchaseInvoice $purchase): RedirectResponse
    {
        $this->authorizeBill($request, $purchase);

        try {
            $this->persistUpdate($request, $purchase);
        } catch (UniqueConstraintViolationException) {
            return back()->withErrors([
                'invoice_number' => 'This supplier already has that invoice number.',
            ])->withInput();
        }

        return redirect()->route('purchases.index', ['invoice' => $purchase->id])->with('status', 'purchase-saved');
    }

    private function persistUpdate(SavePurchaseInvoiceRequest $request, PurchaseInvoice $purchase): void
    {
        DB::transaction(function () use ($request, $purchase) {
            $supplier = $this->resolveSupplier($purchase->company_id, $request);
            $totals = $this->totals($request);
            $amountsChanged = abs((float) $purchase->amount_excl - $totals['amount_excl']) > 0.001
                || abs((float) $purchase->vat_rate - $totals['vat_rate']) > 0.001;

            $file = $this->storeFile($request, $purchase->company_id, $purchase);
            $flags = $this->review->detect(
                $purchase->company_id,
                $this->flagPayload($supplier->id, $request, $totals['amount_incl']),
                $purchase->id,
                $file['contents'],
            );

            $status = $purchase->status;
            $bookedAt = $purchase->booked_at;
            $paidAt = $purchase->paid_at;
            if ($amountsChanged && in_array($status, PurchaseInvoice::REPORT_STATUSES, true)) {
                $status = PurchaseInvoice::STATUS_REVIEW;
                $bookedAt = null;
                $paidAt = null;
            }

            $purchase->update([
                'supplier_id' => $supplier->id,
                'invoice_number' => $request->string('invoice_number')->toString(),
                'invoice_date' => $request->date('invoice_date'),
                'due_date' => $request->date('due_date'),
                'category' => $request->string('category')->toString(),
                'status' => $status,
                ...$totals,
                'iban' => $this->review->normalizeIban($request->input('iban')) ?: null,
                'payment_note' => $request->input('payment_note'),
                'flags' => $flags,
                'file_path' => $file['path'] ?? $purchase->file_path,
                'file_name' => $file['name'] ?? $purchase->file_name,
                'booked_at' => $bookedAt,
                'paid_at' => $paidAt,
            ]);

            $this->syncLines($purchase, $request->input('lines'));
            $this->review->syncSupplierIban($supplier, $purchase->iban);
        });
    }

    public function book(Request $request, PurchaseInvoice $purchase): RedirectResponse
    {
        $this->authorizeBill($request, $purchase);
        if ($purchase->status === PurchaseInvoice::STATUS_FLAGGED) {
            return back()->with('error', 'Clear the suspicious flag before booking.');
        }

        $purchase->update([
            'status' => PurchaseInvoice::STATUS_BOOKED,
            'booked_at' => $purchase->booked_at ?? now(),
        ]);

        return redirect()->route('purchases.index', ['invoice' => $purchase->id])->with('status', 'purchase-booked');
    }

    public function flag(Request $request, PurchaseInvoice $purchase): RedirectResponse
    {
        $this->authorizeBill($request, $purchase);
        $flags = $purchase->flags ?? [];
        if (! in_array('manual', $flags, true)) {
            $flags[] = 'manual';
        }

        $purchase->update([
            'status' => PurchaseInvoice::STATUS_FLAGGED,
            'flags' => $flags,
            'booked_at' => null,
            'paid_at' => null,
        ]);

        return redirect()->route('purchases.index', ['invoice' => $purchase->id])->with('status', 'purchase-flagged');
    }

    public function pay(Request $request, PurchaseInvoice $purchase): RedirectResponse
    {
        $this->authorizeBill($request, $purchase);
        if ($purchase->status !== PurchaseInvoice::STATUS_BOOKED && $purchase->status !== PurchaseInvoice::STATUS_PAID) {
            return back()->with('error', 'Book the invoice before marking it paid.');
        }

        $purchase->update([
            'status' => PurchaseInvoice::STATUS_PAID,
            'booked_at' => $purchase->booked_at ?? now(),
            'paid_at' => $purchase->paid_at ?? now(),
        ]);

        return redirect()->route('purchases.index', ['invoice' => $purchase->id])->with('status', 'purchase-paid');
    }

    public function file(Request $request, PurchaseInvoice $purchase)
    {
        $this->authorizeBill($request, $purchase);
        if (! $purchase->file_path || ! Storage::disk('local')->exists($purchase->file_path)) {
            abort(404);
        }

        return Storage::disk('local')->download($purchase->file_path, $purchase->file_name ?: 'invoice.pdf');
    }

    public function export(Request $request): StreamedResponse|RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company) {
            return redirect()->route('companies.index');
        }

        $rows = PurchaseInvoice::query()
            ->where('company_id', $company->id)
            ->whereIn('status', PurchaseInvoice::REPORT_STATUSES)
            ->with('supplier')
            ->orderBy('invoice_date')
            ->get();

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Date', 'Supplier', 'Number', 'Category', 'Excl', 'VAT', 'Incl', 'Status', 'Paid at']);
            foreach ($rows as $row) {
                fputcsv($out, [
                    $row->invoice_date?->toDateString(),
                    $row->supplier?->name,
                    $row->invoice_number,
                    $row->category,
                    $row->amount_excl,
                    $row->vat_amount,
                    $row->amount_incl,
                    $row->status,
                    $row->paid_at?->toDateString(),
                ]);
            }
            fclose($out);
        }, 'purchase-invoices.csv', ['Content-Type' => 'text/csv']);
    }

    private function companyOrRedirect(Request $request): mixed
    {
        $company = $request->user()->activeCompany();
        if (! $company) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }
        if ($deny = CompanyAccess::denyWrite($request->user(), $company, false, null)) {
            return $deny;
        }

        return $company;
    }

    private function authorizeBill(Request $request, PurchaseInvoice $purchase): void
    {
        $company = $request->user()->activeCompany();
        abort_unless($company && $purchase->company_id === $company->id, 404);
    }

    private function resolveSupplier(int $companyId, SavePurchaseInvoiceRequest $request): Supplier
    {
        if ($request->filled('supplier_id')) {
            $supplier = Supplier::query()
                ->where('company_id', $companyId)
                ->where('id', $request->integer('supplier_id'))
                ->firstOrFail();
        } else {
            $supplier = Supplier::query()->firstOrCreate(
                [
                    'company_id' => $companyId,
                    'name' => $request->string('supplier_name')->toString(),
                ],
                [],
            );
        }

        $supplier->fill([
            'vat_number' => $request->input('supplier_vat') ?: $supplier->vat_number,
            'address' => $request->input('supplier_address') ?: $supplier->address,
        ]);
        $supplier->save();

        return $supplier;
    }

    /**
     * @return array{amount_excl: float, vat_rate: float, vat_amount: float, amount_incl: float}
     */
    private function totals(SavePurchaseInvoiceRequest $request): array
    {
        $excl = round(collect($request->input('lines'))->sum(fn ($line) => (float) $line['amount_excl']), 2);
        $rate = round((float) $request->input('vat_rate'), 2);
        $vat = round($excl * $rate / 100, 2);

        return [
            'amount_excl' => $excl,
            'vat_rate' => $rate,
            'vat_amount' => $vat,
            'amount_incl' => round($excl + $vat, 2),
        ];
    }

    /**
     * @return array{supplier_id: int, invoice_number: string, invoice_date: string, amount_incl: float, iban: ?string, payment_note: ?string}
     */
    private function flagPayload(int $supplierId, SavePurchaseInvoiceRequest $request, float $incl): array
    {
        return [
            'supplier_id' => $supplierId,
            'invoice_number' => $request->string('invoice_number')->toString(),
            'invoice_date' => $request->date('invoice_date')->toDateString(),
            'amount_incl' => $incl,
            'iban' => $request->input('iban'),
            'payment_note' => $request->input('payment_note'),
        ];
    }

    /**
     * @param  list<array{description: string, amount_excl: numeric}>  $lines
     */
    private function syncLines(PurchaseInvoice $invoice, array $lines): void
    {
        $invoice->lines()->delete();
        foreach (array_values($lines) as $index => $line) {
            $invoice->lines()->create([
                'description' => $line['description'],
                'amount_excl' => $line['amount_excl'],
                'position' => $index,
            ]);
        }
    }

    /**
     * @return array{path: ?string, name: ?string, contents: ?string}
     */
    private function storeFile(Request $request, int $companyId, ?PurchaseInvoice $existing = null): array
    {
        if (! $request->hasFile('file')) {
            $contents = null;
            if ($existing?->file_path && Storage::disk('local')->exists($existing->file_path)) {
                $contents = Storage::disk('local')->get($existing->file_path);
            }

            return ['path' => null, 'name' => null, 'contents' => $contents];
        }

        $upload = $request->file('file');
        $contents = file_get_contents($upload->getRealPath()) ?: '';
        $path = $upload->store('purchase-invoices/'.$companyId, 'local');

        if ($existing?->file_path) {
            Storage::disk('local')->delete($existing->file_path);
        }

        return [
            'path' => $path,
            'name' => $upload->getClientOriginalName(),
            'contents' => $contents,
        ];
    }
}
