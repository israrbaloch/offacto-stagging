@php
    use App\Support\BrandColors;
    use App\Support\CompanyBranding;

    $company = $offer->company;
    $settings = $company?->companySetting;
    $theme = BrandColors::resolve(is_array($settings?->theme) ? $settings->theme : null);
    $brand = $theme['primary'];
    $accent = $theme['secondary'];
    $customer = $offer->customer;
    $fromName = $company?->company_name ?: trim(($company?->first_name.' '.$company?->surname));
    $toName = $customer?->org_name ?: trim(($customer?->first_name.' '.$customer?->surname)) ?: 'Client';
    $fromLine = trim(($company?->street ?? '').' '.($company?->house ?? ''));
    $fromCity = trim(($company?->postal_code ?? '').' '.($company?->city ?? ''));
    $vatRate = $vatRate ?? 21;
    $subtotal = $offer->subtotal;
    $tax = $offer->tax_amount;
    $total = $offer->total;
    $logo = CompanyBranding::pdfLogoOrDefault($settings);
    $fmt = fn ($d) => $d ? $d->format('d/m/Y') : '—';
    $modern = ($layout ?? '') === 'modern';
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quotation {{ $offer->offer_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; color: #1A1F3C; line-height: 1.45; }
        .paper { padding: 28px 32px; }
        .hero { padding: 18px 22px; margin: -28px -32px 18px; color: #fff; background: {{ $brand }}; }
        .hero h4 { color: #fff; font-size: 18pt; margin: 0 0 4px; }
        .hero .muted { color: #eef1ff; font-size: 9pt; }
        .row { width: 100%; }
        .row td { vertical-align: top; }
        .muted { color: #5C6488; font-size: 9pt; }
        h4 { font-size: 18pt; font-weight: bold; color: {{ $brand }}; margin: 0 0 4px; }
        .from-name { font-weight: bold; font-size: 11pt; margin-top: 6px; }
        .logo { width: 34px; height: auto; }
        .billto { margin: 18px 0 14px; padding: 10px 12px; border-left: 3px solid {{ $brand }}; background: #F5F7FF; }
        .billto-lbl { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.06em; font-weight: bold; color: {{ $accent }}; margin-bottom: 4px; }
        table.lines { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.lines th, table.lines td { padding: 6px 0; border-bottom: 1px solid #EEF1FF; font-size: 9pt; }
        table.lines th { color: {{ $accent }}; font-weight: bold; text-align: left; }
        table.lines td.num, table.lines th.num { text-align: right; }
        .totals { width: 220px; margin-left: auto; margin-top: 10px; }
        .totals table { width: 100%; border-collapse: collapse; }
        .totals td { padding: 3px 0; font-size: 9pt; }
        .totals td:last-child { text-align: right; }
        .totals .due td { font-weight: bold; font-size: 11pt; color: {{ $brand }}; border-top: 1px solid #EEF1FF; padding-top: 6px; }
    </style>
</head>
<body>
<div class="paper">
    @if($modern)
        <div class="hero">
            <table class="row">
                <tr>
                    <td style="width: 55%;">
                        <img src="{{ $logo }}" class="logo" alt="">
                        <div class="from-name">{{ $fromName }}</div>
                        <div class="muted">
                            @if($fromLine){{ $fromLine }}<br>@endif
                            {{ $fromCity }}
                        </div>
                    </td>
                    <td style="width: 45%; text-align: right;">
                        <h4>Quotation</h4>
                        <div class="muted">
                            {{ $offer->offer_number }}<br>
                            {{ $fmt($offer->offer_date) }}
                            @if($offer->valid_until)<br>Valid until: {{ $fmt($offer->valid_until) }}@endif
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    @else
        <table class="row">
            <tr>
                <td style="width: 55%;">
                    <img src="{{ $logo }}" class="logo" alt="">
                    <div class="from-name">{{ $fromName }}</div>
                    <div class="muted">
                        @if($fromLine){{ $fromLine }}<br>@endif
                        {{ $fromCity }}
                    </div>
                </td>
                <td style="width: 45%; text-align: right;">
                    <h4>Quotation</h4>
                    <div class="muted">
                        {{ $offer->offer_number }}<br>
                        {{ $fmt($offer->offer_date) }}
                        @if($offer->valid_until)<br>Valid until: {{ $fmt($offer->valid_until) }}@endif
                    </div>
                </td>
            </tr>
        </table>
    @endif

    <div class="billto">
        <div class="billto-lbl">Bill to</div>
        <strong>{{ $toName }}</strong>
        @if($customer?->office_address)<br><span class="muted">{!! nl2br(e($customer->office_address)) !!}</span>@endif
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
            @forelse($offer->items as $item)
                <tr>
                    <td>{{ $item->description ?: ($item->service?->name ?? 'Line') }}</td>
                    <td class="num">{{ $item->quantity }}</td>
                    <td class="num">{{ number_format((float) $item->total, 2, ',', ' ') }} €</td>
                </tr>
            @empty
                <tr><td colspan="3" class="muted" style="text-align:center;padding:12px;">No lines</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr><td>Subtotal</td><td>{{ number_format($subtotal, 2, ',', ' ') }} €</td></tr>
            <tr><td class="muted">VAT ({{ $vatRate }}%)</td><td class="muted">{{ number_format($tax, 2, ',', ' ') }} €</td></tr>
            <tr class="due"><td>Total</td><td>{{ number_format($total, 2, ',', ' ') }} €</td></tr>
        </table>
    </div>
</div>
</body>
</html>
