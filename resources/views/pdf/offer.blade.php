@php
    use App\Support\BrandColors;

    $company = $offer->company;
    $settings = $company?->companySetting;
    $theme = BrandColors::resolve(is_array($settings?->theme) ? $settings->theme : null);
    $primary = $theme['primary'];
    $secondary = $theme['secondary'];
    $headerBg = $primary.'14';
    $customer = $offer->customer;
    $fromName = $company?->company_name ?: trim(($company?->first_name.' '.$company?->surname));
    $toName = $customer?->org_name ?: trim(($customer?->first_name.' '.$customer?->surname)) ?: 'Client to be selected';
    $client = trim(($customer?->first_name.' '.$customer?->surname));
    $vatRate = $vatRate ?? 21;
    $companyLogo = $settings?->invoice_logo ? public_path('storage/'.$settings->invoice_logo) : null;
    $logo = ($companyLogo && is_file($companyLogo))
        ? $companyLogo
        : public_path('assets/images/logo-offacto.svg');
    $scope = $offer->desc ?: $offer->intro;
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quotation {{ $offer->offer_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; color: #475569; line-height: 1.5; }
        .page-content { padding: 36px 40px 28px; }
        .head-row { width: 100%; margin-bottom: 24px; }
        .doc-no { text-align: right; font-size: 8pt; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8; font-weight: bold; }
        .logo { max-height: 42px; max-width: 180px; }
        .title { margin-top: 20px; font-size: 28pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: {{ $secondary }}; }
        .date-line { margin-top: 8px; font-size: 10pt; color: #64748b; }
        .parties { width: 100%; margin-top: 28px; border-collapse: collapse; }
        .parties td { width: 50%; vertical-align: top; font-size: 9.5pt; color: #64748b; line-height: 1.55; }
        .parties .right { text-align: right; }
        .party-heading { font-size: 10pt; font-weight: bold; color: #0f172a; margin-bottom: 6px; }
        .party-name { font-weight: bold; color: #1e293b; margin-bottom: 4px; }
        .scope { margin-top: 24px; font-size: 9.5pt; color: #64748b; line-height: 1.6; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 28px; border: 1px solid #e2e8f0; }
        table.items th { background: {{ $headerBg }}; color: {{ $secondary }}; font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; }
        table.items th.num { text-align: right; }
        table.items td { padding: 10px 12px; border-top: 1px solid #f1f5f9; font-size: 9.5pt; vertical-align: top; color: #334155; }
        table.items td.num { text-align: right; white-space: nowrap; }
        table.items td.item-title { font-weight: bold; color: #1e293b; }
        table.items td.item-desc { font-size: 8pt; color: #94a3b8; padding-top: 0; }
        table.items tfoot td { border-top: 1px solid #e2e8f0; padding: 6px 12px; font-size: 9pt; }
        table.items tfoot td.num { text-align: right; }
        table.items tfoot .total-row td { border-top: 2px solid #cbd5e1; padding-top: 10px; padding-bottom: 10px; font-weight: bold; font-size: 11pt; color: #0f172a; }
        table.items tfoot .total-row td.amount { color: {{ $primary }}; }
        .footer-notes { margin-top: 24px; font-size: 9.5pt; color: #475569; line-height: 1.55; }
        .footer-notes strong { color: #0f172a; }
        .wave { display: block; width: 100%; height: 72px; margin: 0; padding: 0; }
    </style>
</head>
<body>
<div class="page-content">
    <table class="head-row">
        <tr>
            <td style="width: 60%; vertical-align: top;">
                <img src="{{ $logo }}" class="logo" alt="Logo">
            </td>
            <td style="width: 40%; vertical-align: top;" class="doc-no">
                No. {{ $offer->offer_number }}
            </td>
        </tr>
    </table>

    <div class="title">Quotation</div>
    <div class="date-line">Date: {{ optional($offer->offer_date)->format('F j, Y') ?: '—' }}</div>
    @if($offer->valid_until)
        <div class="date-line">Valid until: {{ $offer->valid_until->format('F j, Y') }}</div>
    @endif

    <table class="parties">
        <tr>
            <td>
                <div class="party-heading">Billed to:</div>
                <div class="party-name">{{ $toName }}</div>
                @if($client && $customer?->org_name)
                    Attn: {{ $client }}<br>
                @endif
                {{ $customer?->office_address ?: '' }}<br>
                {{ $customer?->email }}
            </td>
            <td class="right">
                <div class="party-heading">From:</div>
                <div class="party-name">{{ $fromName ?: 'Your company' }}</div>
                {{ trim(($company?->street.' '.$company?->house)) }}<br>
                {{ trim(($company?->postal_code.' '.$company?->city)) }}<br>
                {{ $company?->email }}
            </td>
        </tr>
    </table>

    @if($scope)
        <div class="scope">@include('partials.rich', ['html' => $scope])</div>
    @endif

    <table class="items">
        <thead>
            <tr>
                <th>Item</th>
                <th class="num" style="width: 72px;">Quantity</th>
                <th class="num" style="width: 88px;">Price</th>
                <th class="num" style="width: 88px;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @forelse($offer->items as $item)
                <tr>
                    <td>
                        <div class="item-title">{{ $item->service->name ?? ($item->description ?: 'Line item') }}</div>
                        @if($item->service?->name && $item->description && $item->description !== $item->service->name)
                            <div class="item-desc">{{ $item->description }}</div>
                        @endif
                    </td>
                    <td class="num">{{ $item->quantity }}</td>
                    <td class="num">€ {{ number_format((float) $item->price, 2, ',', '.') }}</td>
                    <td class="num">€ {{ number_format((float) $item->total, 2, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">No quotation lines yet.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2"></td>
                <td class="num" style="color: #64748b; font-size: 8.5pt;">Subtotal</td>
                <td class="num">€ {{ number_format($offer->subtotal, 2, ',', '.') }}</td>
            </tr>
            <tr>
                <td colspan="2"></td>
                <td class="num" style="color: #64748b; font-size: 8.5pt;">VAT ({{ $vatRate }}%)</td>
                <td class="num">€ {{ number_format($offer->tax_amount, 2, ',', '.') }}</td>
            </tr>
            <tr class="total-row">
                <td colspan="2"></td>
                <td class="num">Total</td>
                <td class="num amount">€ {{ number_format($offer->total, 2, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    @if(filled($offer->payment_terms) || filled($offer->notes))
        <div class="footer-notes" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            @if(filled($offer->payment_terms))
                <p><strong style="color: {{ $secondary }};">Payment terms:</strong> {{ $offer->payment_terms }}</p>
            @endif
            @if(filled($offer->notes))
                <p style="margin-top: 10px;"><strong style="color: {{ $secondary }};">Note:</strong> {{ $offer->notes }}</p>
            @endif
        </div>
    @endif
</div>
<svg class="wave" viewBox="0 0 1200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="{{ $primary }}" fill-opacity="0.12" d="M0,40 C200,80 400,0 600,35 C800,70 1000,20 1200,50 L1200,100 L0,100 Z"/>
    <path fill="{{ $secondary }}" fill-opacity="0.18" d="M0,55 C250,95 450,25 650,60 C850,90 1050,35 1200,65 L1200,100 L0,100 Z"/>
</svg>
</body>
</html>
