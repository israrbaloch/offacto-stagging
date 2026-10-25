<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    @if($companyLogoUrl ?? null)
        <div style="margin-bottom: 16px;">
            @include('emails.partials.logo', ['width' => 140, 'companyLogo' => $companyLogoUrl])
        </div>
    @endif

    <p>Hello {{ $invoice->customer?->first_name ?? 'there' }},</p>

    @if($customMessage)
        <div>{!! $customMessage !!}</div>
    @else
        <p>This is a friendly reminder that invoice <strong>#{{ $invoice->invoice_number }}</strong> is due on {{ $invoice->due_date?->format('F j, Y') }}.</p>
        <p>Outstanding amount: <strong>€ {{ number_format($invoice->amount_due, 2) }}</strong></p>
    @endif

    <p>Thank you,<br>{{ $invoice->company?->company_name }}</p>
</body>
</html>
