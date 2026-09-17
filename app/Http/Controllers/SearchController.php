<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Offer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $query = trim((string) $request->input('q', ''));
        if ($query === '') {
            return redirect()->route('dashboard');
        }

        $user = $request->user();
        $companyId = $user?->activeCompany()?->id;

        if (! $companyId) {
            return redirect()->route('companies.index');
        }

        $invoiceMatch = Invoice::where('company_id', $companyId)
            ->where('invoice_number', 'like', "%{$query}%")
            ->exists();

        if ($invoiceMatch) {
            return redirect()->route('invoices.index', ['search' => $query]);
        }

        $offerMatch = Offer::where('company_id', $companyId)
            ->where('offer_number', 'like', "%{$query}%")
            ->exists();

        if ($offerMatch) {
            return redirect()->route('offers.index', ['search' => $query]);
        }

        $customerMatch = Customer::where('company_id', $companyId)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('surname', 'like', "%{$query}%")
                    ->orWhere('org_name', 'like', "%{$query}%");
            })
            ->exists();

        if ($customerMatch) {
            return redirect()->route('customers.index', ['search' => $query]);
        }

        return redirect()->route('invoices.index', ['search' => $query]);
    }
}
