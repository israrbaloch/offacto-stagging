<?php

namespace App\Http\Controllers;

use App\Services\MolliePaymentService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class MolliePaymentReturnController extends Controller
{
    /**
     * Customer return URL after Mollie checkout (invoice payments). Syncs when Mollie passes ?id= (local dev without webhook).
     */
    public function __invoke(Request $request, MolliePaymentService $mollie): View
    {
        $paymentId = $request->query('id');
        $paid = false;

        if (is_string($paymentId) && $paymentId !== '') {
            $paid = $mollie->syncInvoicePayment($paymentId);
            if (! $paid) {
                $mollie->handleWebhook($paymentId);
            }
        }

        return view('payments.mollie-return', [
            'paid' => $paid,
        ]);
    }
}
