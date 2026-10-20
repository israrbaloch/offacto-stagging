<?php

namespace App\Http\Controllers;

use App\Services\TimeEntryInvoicingService;
use App\Support\CompanyAccess;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class InvoiceFromTimeController extends Controller
{
    public function store(Request $request, TimeEntryInvoicingService $invoicing): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        if ($deny = CompanyAccess::denyCreate($user, $activeCompany, 'invoices', 'invoices.create')) {
            return $deny;
        }

        $data = $request->validate([
            'customer_id' => ['required', 'integer'],
            'time_entry_ids' => ['required', 'array', 'min:1'],
            'time_entry_ids.*' => ['integer'],
        ]);

        $invoice = $invoicing->createDraftInvoice(
            $activeCompany,
            $user,
            (int) $data['customer_id'],
            $data['time_entry_ids'],
        );

        return redirect()
            ->route('invoices.edit', $invoice)
            ->with('status', 'invoice-from-time-created');
    }
}
