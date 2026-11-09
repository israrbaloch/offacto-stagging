<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse|RedirectResponse
    {
        $query = trim((string) $request->input('q', ''));
        $user = $request->user();
        $companyId = $user?->activeCompany()?->id;

        if ($query === '') {
            return $request->boolean('suggest')
                ? response()->json(['invoices' => [], 'offers' => [], 'customers' => []])
                : redirect()->route('dashboard');
        }

        if (! $companyId) {
            return $request->boolean('suggest')
                ? response()->json(['invoices' => [], 'offers' => [], 'customers' => []])
                : redirect()->route('companies.index');
        }

        $results = $this->results($companyId, $query);

        if ($request->boolean('suggest')) {
            return response()->json($results);
        }

        $first = $results['invoices'][0] ?? $results['offers'][0] ?? $results['customers'][0] ?? null;
        if ($first) {
            return redirect($first['href']);
        }

        return redirect()->route('invoices.index', ['search' => $query]);
    }

    /**
     * @return array{invoices: list<array{label: string, meta: string, href: string}>, offers: list<array{label: string, meta: string, href: string}>, customers: list<array{label: string, meta: string, href: string}>}
     */
    private function results(int $companyId, string $query): array
    {
        $like = '%'.$query.'%';

        $invoices = Invoice::query()
            ->where('company_id', $companyId)
            ->with('customer:id,first_name,surname,org_name')
            ->where(function ($q) use ($like) {
                $q->where('invoice_number', 'like', $like)
                    ->orWhereHas('customer', fn ($customer) => $this->whereCustomerName($customer, $like));
            })
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Invoice $invoice) => [
                'label' => $invoice->invoice_number ?: __('offers.untitled'),
                'meta' => $this->customerLabel($invoice->customer),
                'href' => route('invoices.edit', $invoice),
            ])
            ->all();

        $offers = Offer::query()
            ->where('company_id', $companyId)
            ->with('customer:id,first_name,surname,org_name')
            ->where(function ($q) use ($like) {
                $q->where('offer_number', 'like', $like)
                    ->orWhereHas('customer', fn ($customer) => $this->whereCustomerName($customer, $like));
            })
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Offer $offer) => [
                'label' => $offer->offer_number ?: __('offers.untitled'),
                'meta' => $this->customerLabel($offer->customer),
                'href' => route('offers.edit', $offer),
            ])
            ->all();

        $customers = Customer::query()
            ->where('company_id', $companyId)
            ->where(fn ($q) => $this->whereCustomerName($q, $like))
            ->orderBy('org_name')
            ->limit(5)
            ->get()
            ->map(fn (Customer $customer) => [
                'label' => $this->customerLabel($customer),
                'meta' => (string) ($customer->email ?? ''),
                'href' => route('customers.index', ['search' => $query]),
            ])
            ->all();

        return [
            'invoices' => $invoices,
            'offers' => $offers,
            'customers' => $customers,
        ];
    }

    private function whereCustomerName($query, string $like): void
    {
        $query->where('first_name', 'like', $like)
            ->orWhere('surname', 'like', $like)
            ->orWhere('org_name', 'like', $like)
            ->orWhere('email', 'like', $like);
    }

    private function customerLabel(?Customer $customer): string
    {
        if (! $customer) {
            return '';
        }

        return $customer->org_name
            ?: trim($customer->first_name.' '.$customer->surname);
    }
}
