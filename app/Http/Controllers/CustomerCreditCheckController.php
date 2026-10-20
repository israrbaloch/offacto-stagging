<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Services\CreditsafeCreditCheckService;
use App\Support\CompanyAccess;
use App\Support\PlanEntitlements;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CustomerCreditCheckController extends Controller
{
    public function store(Request $request, Customer $customer, CreditsafeCreditCheckService $service): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany || $customer->company_id !== $activeCompany->id) {
            abort(404);
        }

        if ($reason = PlanEntitlements::blockCapabilityReason($user, $activeCompany, 'integrations.creditsafe')) {
            return back()->with('error', $reason);
        }

        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'customers.update')) {
            return $deny;
        }

        $customer->load('country');
        $service->check($customer, $activeCompany, $user);

        return back()->with('status', 'credit-check-completed');
    }
}
