<?php

namespace App\Support;

use App\Models\Invoice;

class InvoiceMessage
{
    public static function merge(string $html, Invoice $invoice): string
    {
        $invoice->loadMissing(['customer', 'company']);
        $customer = $invoice->customer;
        $client = trim(($customer?->first_name.' '.$customer?->surname))
            ?: ($customer?->org_name ?: 'Client');
        $company = $invoice->company?->company_name ?: 'our company';
        $number = $invoice->invoice_number ?: (string) $invoice->id;

        $payLink = filled($invoice->mollie_checkout_url) ? (string) $invoice->mollie_checkout_url : '';

        return str_replace(
            ['#CLIENTNAME#', '#COMPANY#', '#INVOICENUMBER#', '#PAYLINK#'],
            [e($client), e($company), e($number), e($payLink)],
            $html
        );
    }
}
