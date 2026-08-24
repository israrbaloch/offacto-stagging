<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quotation {{ $offer->offer_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; color: #334155; line-height: 1.45; }
        .page { padding: 28px 32px; }
        .top { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
        .title { font-size: 26pt; font-weight: bold; color: #4f46e5; letter-spacing: -0.5px; }
        .meta { margin-top: 8px; font-size: 8.5pt; color: #64748b; }
        .meta strong { color: #0f172a; }
        .party-label { font-size: 7.5pt; letter-spacing: 1.2px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
        .party-name { font-size: 10pt; font-weight: bold; color: #0f172a; margin-bottom: 3px; }
        .party-detail { font-size: 8.5pt; color: #64748b; line-height: 1.55; }
        .right { text-align: left; width: 58%; }
        .section { margin-bottom: 22px; }
        .section-title { font-size: 11pt; font-weight: bold; color: #0f172a; margin-bottom: 8px; }
        .section-body { font-size: 9pt; color: #475569; line-height: 1.6; }
        .section-body ul { margin: 4px 0 8px 16px; }
        .section-body li { margin: 2px 0; }
        table.items { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
        table.items th { font-size: 7.5pt; letter-spacing: 1px; text-transform: uppercase; color: #94a3b8; text-align: left; padding: 0 0 8px; border-bottom: 1px solid #e2e8f0; }
        table.items th.num { text-align: right; }
        table.items td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 9pt; vertical-align: top; }
        table.items td.num { text-align: right; white-space: nowrap; }
        .item-name { font-weight: bold; color: #0f172a; }
        .item-desc { font-size: 8pt; color: #94a3b8; margin-top: 2px; }
        .bottom { width: 100%; border-collapse: collapse; }
        .terms { background: #eef2ff; padding: 12px 14px; font-size: 8pt; color: #4338ca; line-height: 1.5; }
        .totals { width: 230px; margin-left: auto; }
        .totals td { padding: 5px 0; font-size: 9pt; }
        .totals .label { color: #64748b; }
        .totals .value { text-align: right; font-weight: bold; color: #0f172a; }
        .totals .grand .label, .totals .grand .value { font-size: 13pt; color: #4f46e5; padding-top: 8px; }
        .auth-label { font-size: 7.5pt; letter-spacing: 1.2px; text-transform: uppercase; color: #94a3b8; margin: 28px 0 12px; }
        .sign { width: 100%; border-collapse: collapse; }
        .sign-name { font-weight: bold; color: #0f172a; }
        .sign-line { border-bottom: 1px solid #cbd5e1; height: 28px; margin-bottom: 6px; color: #94a3b8; font-size: 8pt; }
        .muted { color: #94a3b8; font-size: 8pt; }
        .logo { max-height: 28px; margin-bottom: 10px; }
    </style>
</head>
<body>
@php
    $company = $offer->company;
    $settings = $company?->companySetting;
    $customer = $offer->customer;
    $fromName = $company?->company_name ?: trim(($company?->first_name.' '.$company?->surname));
    $toName = $customer?->org_name ?: trim(($customer?->first_name.' '.$customer?->surname)) ?: 'Client to be selected';
    $vatRate = $vatRate ?? 21;
    $logo = $settings?->invoice_logo ? public_path('storage/'.$settings->invoice_logo) : public_path('assets/images/logo-offacto.svg');
    $scope = trim(preg_replace('/^.*\n\n/s', '', (string) $offer->intro, 1)) ?: $offer->intro;
    $scope = $offer->desc ?: $scope;
    $sender = trim(($company?->first_name.' '.$company?->surname));
    $client = trim(($customer?->first_name.' '.$customer?->surname));
@endphp
<div class="page">
    <table class="top">
        <tr>
            <td style="width:42%; vertical-align:top;">
                @if(is_file($logo) && !str_ends_with($logo, '.svg'))
                    <img src="{{ $logo }}" class="logo" alt="Logo">
                @endif
                <div class="title">Quotation</div>
                <div class="meta">
                    <div><strong>#{{ $offer->offer_number }}</strong></div>
                    <div>Date: {{ optional($offer->offer_date)->format('M j, Y') ?: '—' }}</div>
                    <div>Valid until: {{ optional($offer->valid_until)->format('M j, Y') ?: '—' }}</div>
                </div>
            </td>
            <td class="right" style="vertical-align:top;">
                <table style="width:100%;">
                    <tr>
                        <td style="width:50%; vertical-align:top; padding-right:16px;">
                            <div class="party-label">From</div>
                            <div class="party-name">{{ $fromName ?: 'Your company' }}</div>
                            <div class="party-detail">
                                {{ trim(($company?->street.' '.$company?->house)) }}<br>
                                {{ trim(($company?->postal_code.' '.$company?->city)) }}<br>
                                {{ $company?->email }}
                            </div>
                        </td>
                        <td style="width:50%; vertical-align:top;">
                            <div class="party-label">To</div>
                            <div class="party-name">{{ $toName }}</div>
                            <div class="party-detail">
                                @if($client && $customer?->org_name)
                                    Attn: {{ $client }}<br>
                                @endif
                                {{ $customer?->office_address ?: '—' }}<br>
                                {{ $customer?->email }}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    @if($scope)
    <div class="section">
        <div class="section-title">Project Scope</div>
        <div class="section-body">@include('partials.rich', ['html' => $offer->desc ?: $offer->intro])</div>
    </div>
    @endif

    <table class="items">
        <thead>
            <tr>
                <th>Description</th>
                <th class="num" style="width:50px;">Qty</th>
                <th class="num" style="width:90px;">Price</th>
                <th class="num" style="width:90px;">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($offer->items as $item)
                <tr>
                    <td>
                        <div class="item-name">{{ $item->service->name ?? 'Line item' }}</div>
                        @if($item->description)
                            <div class="item-desc">{{ $item->description }}</div>
                        @endif
                    </td>
                    <td class="num">{{ $item->quantity }}</td>
                    <td class="num">€ {{ number_format((float) $item->price, 2, ',', '.') }}</td>
                    <td class="num">€ {{ number_format((float) $item->total, 2, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="muted">No quotation lines yet.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <table class="bottom">
        <tr>
            <td style="width:55%; vertical-align:top; padding-right:20px;">
                <div class="terms">
                    Payment is due according to the terms in this quotation. 50% may be requested upon approval, with the remainder on delivery, unless otherwise agreed in writing.
                    @if($offer->notes)
                        <br><br>{{ $offer->notes }}
                    @endif
                </div>
            </td>
            <td style="width:45%; vertical-align:top;">
                <table class="totals">
                    <tr>
                        <td class="label">Subtotal</td>
                        <td class="value">€ {{ number_format($offer->subtotal, 2, ',', '.') }}</td>
                    </tr>
                    <tr>
                        <td class="label">VAT ({{ $vatRate }}%)</td>
                        <td class="value">€ {{ number_format($offer->tax_amount, 2, ',', '.') }}</td>
                    </tr>
                    <tr class="grand">
                        <td class="label">Total</td>
                        <td class="value">€ {{ number_format($offer->total, 2, ',', '.') }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <div class="auth-label">Authorization</div>
    <table class="sign">
        <tr>
            <td style="width:48%; vertical-align:top; padding-right:8%;">
                <div class="sign-name">{{ $sender ?: $fromName }}</div>
                <div class="muted">{{ $company?->self_employed_activity ?: 'Authorized representative' }}</div>
                <div class="muted">{{ optional($offer->offer_date)->format('M j, Y') }}</div>
            </td>
            <td style="width:48%; vertical-align:top;">
                <div class="sign-line">Sign here...</div>
                <div class="sign-name">{{ $client ?: 'Client' }}</div>
                <div class="muted">Authorized representative</div>
                <div class="muted">Date</div>
            </td>
        </tr>
    </table>
</div>
</body>
</html>
