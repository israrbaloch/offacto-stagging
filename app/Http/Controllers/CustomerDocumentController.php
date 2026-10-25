<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Support\CompanyAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CustomerDocumentController extends Controller
{
    public function store(Request $request, Customer $customer): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user?->activeCompany();

        if (! $activeCompany || $customer->company_id !== $activeCompany->id) {
            abort(404);
        }

        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'customers.update')) {
            return $deny;
        }

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'attach_on_invoice' => ['sometimes', 'boolean'],
        ]);

        $path = $validated['file']->store('customer-documents/'.$customer->id, 'public');

        $document = $customer->documents()->create([
            'company_id' => $activeCompany->id,
            'original_name' => $validated['file']->getClientOriginalName(),
            'file_path' => $path,
            'attach_on_invoice' => $request->boolean('attach_on_invoice', true),
        ]);

        if ($request->expectsJson()) {
            return response()->json(['data' => $document], 201);
        }

        return redirect()
            ->route('customers.index', ['customer' => $customer->id])
            ->with('status', 'customer-document-uploaded');
    }

    public function update(Request $request, Customer $customer, CustomerDocument $document): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user?->activeCompany();

        if (! $activeCompany || $customer->company_id !== $activeCompany->id || $document->customer_id !== $customer->id) {
            abort(404);
        }

        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'customers.update')) {
            return $deny;
        }

        $validated = $request->validate([
            'attach_on_invoice' => ['required', 'boolean'],
        ]);

        $document->update(['attach_on_invoice' => $validated['attach_on_invoice']]);

        if ($request->expectsJson()) {
            return response()->json(['data' => $document->fresh()]);
        }

        return redirect()
            ->route('customers.index', ['customer' => $customer->id])
            ->with('status', 'customer-document-updated');
    }

    public function destroy(Request $request, Customer $customer, CustomerDocument $document): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user?->activeCompany();

        if (! $activeCompany || $customer->company_id !== $activeCompany->id || $document->customer_id !== $customer->id) {
            abort(404);
        }

        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'customers.update')) {
            return $deny;
        }

        $document->delete();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Deleted']);
        }

        return redirect()
            ->route('customers.index', ['customer' => $customer->id])
            ->with('status', 'customer-document-deleted');
    }
}
