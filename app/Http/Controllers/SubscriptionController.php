<?php

namespace App\Http\Controllers;

use App\Support\SubscriptionReminder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function dismissReminder(Request $request): RedirectResponse
    {
        SubscriptionReminder::dismiss($request);

        return back();
    }

    public function updateReminders(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        $request->user()?->update([
            'billing_reminders_enabled' => $data['enabled'],
        ]);

        return back()->with('status', 'billing-reminders-updated');
    }

    public function cancel(Request $request): RedirectResponse
    {
        $company = $request->user()?->activeCompany();
        if (! $company || ! $company->hasValidSubscription()) {
            return redirect()->route('upgrade')->with('error', __('subscription.cancel_not_available'));
        }

        if ($company->subscription_cancel_at_period_end) {
            return redirect()->route('upgrade')->with('status', 'subscription-already-cancelled');
        }

        $company->cancelSubscriptionAtPeriodEnd();

        return redirect()->route('upgrade')->with('status', 'subscription-cancelled');
    }
}
