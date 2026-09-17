<p>Hello {{ $invoice->customer?->first_name ?? 'there' }},</p>

@if($customMessage)
<div>{!! $customMessage !!}</div>
@else
<p>This is a friendly reminder that invoice <strong>#{{ $invoice->invoice_number }}</strong> is due on {{ $invoice->due_date?->format('F j, Y') }}.</p>
<p>Outstanding amount: <strong>€ {{ number_format($invoice->amount_due, 2) }}</strong></p>
@endif

<p>Thank you,<br>{{ $invoice->company?->company_name }}</p>
