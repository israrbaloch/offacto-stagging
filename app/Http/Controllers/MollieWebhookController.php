<?php

namespace App\Http\Controllers;

use App\Services\MolliePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MollieWebhookController extends Controller
{
    public function __invoke(Request $request, MolliePaymentService $mollie): Response
    {
        $paymentId = $request->input('id');
        if ($paymentId) {
            $mollie->handleWebhook($paymentId);
        }

        return response('', 200);
    }
}
