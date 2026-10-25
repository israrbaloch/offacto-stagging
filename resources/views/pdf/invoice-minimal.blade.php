@php
    use App\Models\Invoice;
    use App\Support\BrandColors;

    $company = $invoice->company;
    $settings = $company?->companySetting;
    $theme = BrandColors::resolve(is_array($settings?->theme) ? $settings->theme : null);
    $brand = $theme['primary'];
    $customer = $invoice->customer;
    $fromName = $company?->company_name ?: trim(($company?->first_name.' '.$company?->surname));
    $toName = $customer?->org_name ?: trim(($customer?->first_name.' '.$customer?->surname)) ?: 'Client';
    $fromLine = trim(($company?->street ?? '').' '.($company?->house ?? ''));
    $fromCity = trim(($company?->postal_code ?? '').' '.($company?->city ?? ''));
    $vatRate = $vatRate ?? 21;
    $subtotal = $invoice->subtotal;
    $tax = $invoice->tax_amount;
    $total = $invoice->total;
    $isCredit = filled($invoice->parent_invoice_id);
    $sign = $isCredit ? -1 : 1;
    $companyLogo = $settings?->invoice_logo ? public_path('storage/'.$settings->invoice_logo) : null;
    $logo = ($companyLogo && is_file($companyLogo))
        ? $companyLogo
        : public_path('assets/images/logo-offacto.svg');
    $fmt = fn ($d) => $d ? $d->format('d/m/Y') : '—';
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; color: #1A1F3C; line-height: 1.45; }
        .paper { padding: 28px 32px; }
        .row { width: 100%; }
        .row td { vertical-align: top; }
        .muted { color: #5C6488; font-size: 9pt; }
        h4 { font-size: 18pt; font-weight: bold; color: {{ $brand }}; margin: 0 0 4px; }
        .from-name { font-weight: bold; font-size: 11pt; margin-top: 6px; }
        .logo { width: 34px; height: auto; }
        .billto { margin: 18px 0 14px; padding: 10px 12px; border-left: 3px solid {{ $brand }}; background: #F5F7FF; }
        .billto-lbl { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.06em; font-weight: bold; color: #5C6488; margin-bottom: 4px; }
        table.lines { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.lines th, table.lines td { padding: 6px 0; border-bottom: 1px solid #EEF1FF; font-size: 9pt; }
        table.lines th { color: #5C6488; font-weight: bold; text-align: left; }
        table.lines td.num, table.lines th.num { text-align: right; }
        .totals { width: 220px; margin-left: auto; margin-top: 10px; }
        .totals table { width: 100%; border-collapse: collapse; }
        .totals td { padding: 3px 0; font-size: 9pt; }
        .totals td:last-child { text-align: right; }
        .totals .due td { font-weight: bold; font-size: 11pt; color: {{ $brand }}; border-top: 1px solid #EEF1FF; padding-top: 6px; }
        .pay { margin-top: 12px; padding: 10px 12px; background: #F5F7FF; border-radius: 8px; font-size: 9pt; }
        .qr { width: 52px; height: 52px; border: 1px solid #E4E9F7; background: #eee; }
    </style>
</head>
<body>
<div class="paper">
    <table class="row">
        <tr>
            <td style="width: 55%;">
                <img src="{{ $logo }}" class="logo" alt="">
                <div class="from-name">{{ $fromName }}</div>
                <div class="muted">
                    @if($fromLine){{ $fromLine }}<br>@endif
                    {{ $fromCity }}
                    @if($company?->vat_number)<br>{{ $company->vat_number }}@endif
                </div>
            </td>
            <td style="width: 45%; text-align: right;">
                <h4>{{ $isCredit ? 'Credit note' : 'Invoice' }}</h4>
                <div class="muted">
                    {{ $invoice->invoice_number }}<br>
                    {{ $fmt($invoice->invoice_date) }}
                </div>
            </td>
        </tr>
    </table>

    <div class="billto">
        <div class="billto-lbl">Bill to</div>
        <strong>{{ $toName }}</strong>
        @if($customer?->office_address)<br><span class="muted">{!! nl2br(e($customer->office_address)) !!}</span>@endif
        @if($customer?->vat_number)<br>{{ $customer->vat_number }}@endif
    </div>

    <table class="lines">
        <thead>
            <tr>
                <th>Description</th>
                <th class="num">Qty</th>
                <th class="num">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($invoice->items as $item)
                <tr>
                    <td>{{ $item->description ?: ($item->service?->name ?? 'Line') }}</td>
                    <td class="num">{{ $item->quantity }}</td>
                    <td class="num">{{ number_format($sign * (float) $item->total, 2, ',', ' ') }} €</td>
                </tr>
            @empty
                <tr><td colspan="3" class="muted" style="text-align:center;padding:12px;">No lines</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr><td>Subtotal</td><td>{{ number_format($sign * $subtotal, 2, ',', ' ') }} €</td></tr>
            <tr><td class="muted">VAT ({{ $vatRate }}%)</td><td class="muted">{{ number_format($sign * $tax, 2, ',', ' ') }} €</td></tr>
            <tr class="due"><td>{{ $isCredit ? 'To refund' : 'Amount due' }}</td><td>{{ number_format($sign * $total, 2, ',', ' ') }} €</td></tr>
        </table>
    </div>

    @if(!$isCredit)
        <table class="pay row" style="margin-top:14px;">
            <tr>
                <td>
                    Pay before <strong>{{ $fmt($invoice->due_date) }}</strong><br>
                    @if($settings?->iban ?? false){{ $settings->iban }}<br>@endif
                    <strong>—</strong>
                    @if($invoice->mollie_checkout_url)<br><span style="color:{{ $brand }};font-weight:bold;">Or pay online via Mollie →</span>@endif
                </td>
                <td style="width: 60px; text-align: right;"><div class="qr"></div></td>
            </tr>
        </table>
    @endif
</div>
</body>
</html>
