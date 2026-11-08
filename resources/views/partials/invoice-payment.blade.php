@php
    $paymentReference = \App\Support\BelgianPaymentReference::fromDocument($invoice->invoice_number, $invoice->id);
    $paymentIban = \App\Support\BelgianPaymentReference::formatIban($settings?->iban ?? null);
    $paymentIsCredit = filled($invoice->parent_invoice_id);
@endphp
@if(!$paymentIsCredit && ($paymentIban || $paymentReference || $invoice->mollie_checkout_url))
    <div style="margin-top:16px;padding:12px 14px;background:#f5f7ff;border-radius:8px;font-size:9.5pt;line-height:1.55;">
        @if($invoice->due_date)
            Pay before <strong>{{ $invoice->due_date->format('d/m/Y') }}</strong><br>
        @endif
        @if($paymentIban)
            IBAN: <strong>{{ $paymentIban }}</strong><br>
        @endif
        @if($paymentReference)
            Structured reference: <strong>{{ $paymentReference }}</strong><br>
        @endif
        @if($invoice->mollie_checkout_url)
            <a href="{{ $invoice->mollie_checkout_url }}" style="color:{{ $brand ?? $primary }};font-weight:bold;">Pay online</a>
        @endif
    </div>
@endif
