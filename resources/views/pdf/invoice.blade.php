<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice #{{ $invoice->invoice_number ?? 'N/A' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10pt;
            color: #333;
            line-height: 1.4;
        }

        .invoice-container {
            max-width: 100%;
            padding: 20px;
        }

        /* Header Section */
        .header {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .header-left {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .header-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            text-align: right;
        }

        .company-logo {
            max-width: 150px;
            max-height: 60px;
            margin-bottom: 10px;
        }

        .company-name {
            font-size: 16pt;
            font-weight: bold;
            color: #11134E;
            margin-bottom: 5px;
        }

        .company-details {
            font-size: 9pt;
            color: #666;
            line-height: 1.6;
        }

        .invoice-title {
            font-size: 24pt;
            font-weight: bold;
            color: #7b0033;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
        }

        .invoice-meta {
            font-size: 9pt;
        }

        .invoice-meta-row {
            margin-bottom: 5px;
        }

        .invoice-meta-label {
            color: #666;
            display: inline-block;
            width: 80px;
        }

        .invoice-meta-value {
            font-weight: bold;
            color: #333;
        }

        /* Customer/Parties Section */
        .parties-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .party-box {
            display: table-cell;
            width: 48%;
            vertical-align: top;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }

        .party-box:first-child {
            margin-right: 4%;
        }

        .party-title {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #7b0033;
            border-bottom: 1px solid #7b0033;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .party-details {
            font-size: 9pt;
            line-height: 1.6;
        }

        .party-name {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 5px;
        }

        /* Introduction Section */
        .intro-section {
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #7b0033;
            border-bottom: 1px solid #7b0033;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .section-content {
            font-size: 9pt;
            line-height: 1.6;
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }

        .items-table thead {
            background-color: #11134E;
            color: white;
        }

        .items-table th {
            padding: 10px 8px;
            text-align: left;
            font-size: 9pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .items-table th:nth-child(n+2) {
            text-align: right;
        }

        .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 9pt;
        }

        .items-table td:nth-child(n+2) {
            text-align: right;
        }

        .item-name {
            font-weight: bold;
        }

        .item-description {
            font-size: 8pt;
            color: #666;
            margin-top: 3px;
        }

        /* Summary Section */
        .summary-section {
            width: 100%;
            margin-bottom: 30px;
        }

        .summary-table {
            width: 300px;
            margin-left: auto;
            border-collapse: collapse;
        }

        .summary-row {
            display: table-row;
        }

        .summary-row td {
            padding: 8px 10px;
            font-size: 10pt;
        }

        .summary-row td:first-child {
            text-align: right;
            color: #666;
        }

        .summary-row td:last-child {
            text-align: right;
            font-weight: bold;
            width: 120px;
        }

        .summary-row.subtotal {
            background-color: #f5f5f5;
        }

        .summary-row.tax {
            background-color: #e8f5e9;
            color: #2e7d32;
        }

        .summary-row.tax td {
            color: #2e7d32;
        }

        .summary-row.total {
            background-color: #7b0033;
            color: white;
            font-size: 12pt;
        }

        .summary-row.total td {
            color: white;
            font-weight: bold;
        }

        .summary-row.paid {
            background-color: #e3f2fd;
        }

        .summary-row.due {
            background-color: #fff3e0;
        }

        /* IP Transfer Section */
        .ip-section {
            background-color: #fff8e1;
            border: 1px solid #ffc107;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 25px;
        }

        .ip-title {
            font-size: 10pt;
            font-weight: bold;
            color: #ff8f00;
            margin-bottom: 8px;
        }

        .ip-content {
            font-size: 8pt;
            line-height: 1.5;
            color: #666;
        }

        /* Payment Section */
        .payment-section {
            margin-bottom: 25px;
        }

        .payment-info {
            display: table;
            width: 100%;
        }

        .payment-box {
            display: table-cell;
            width: 48%;
            vertical-align: top;
            padding: 15px;
            background-color: #e3f2fd;
            border-radius: 5px;
        }

        .payment-title {
            font-size: 10pt;
            font-weight: bold;
            color: #1565c0;
            margin-bottom: 8px;
        }

        .payment-details {
            font-size: 9pt;
            line-height: 1.6;
        }

        /* Footer */
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 8pt;
            color: #999;
            text-align: center;
        }

        .footer-company {
            font-weight: bold;
            color: #666;
        }

        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 3px;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-draft {
            background-color: #f5f5f5;
            color: #666;
        }

        .status-sent {
            background-color: #e3f2fd;
            color: #1565c0;
        }

        .status-paid {
            background-color: #e8f5e9;
            color: #2e7d32;
        }

        .status-overdue {
            background-color: #ffebee;
            color: #c62828;
        }

        /* Notes */
        .notes-section {
            margin-bottom: 25px;
        }

        .notes-content {
            font-size: 9pt;
            color: #666;
            background-color: #fafafa;
            padding: 10px;
            border-left: 3px solid #7b0033;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                @if($invoice->company->companySetting && $invoice->company->companySetting->invoice_logo)
                    <img src="{{ public_path('storage/' . $invoice->company->companySetting->invoice_logo) }}" alt="Logo" class="company-logo">
                @endif
                <div class="company-name">{{ $invoice->company->company_name }}</div>
                <div class="company-details">
                    {{ $invoice->company->street }} {{ $invoice->company->house }}<br>
                    {{ $invoice->company->postal_code }} {{ $invoice->company->city }}<br>
                    @if($invoice->company->country){{ $invoice->company->country }}<br>@endif
                    @if($invoice->company->email){{ $invoice->company->email }}<br>@endif
                    @if($invoice->company->phone){{ $invoice->company->phone }}@endif
                </div>
            </div>
            <div class="header-right">
                <div class="invoice-title">Invoice</div>
                <div class="invoice-meta">
                    <div class="invoice-meta-row">
                        <span class="invoice-meta-label">Invoice No:</span>
                        <span class="invoice-meta-value">{{ $invoice->invoice_number ?? 'N/A' }}</span>
                    </div>
                    <div class="invoice-meta-row">
                        <span class="invoice-meta-label">Date:</span>
                        <span class="invoice-meta-value">{{ $invoice->invoice_date ? $invoice->invoice_date->format('d/m/Y') : now()->format('d/m/Y') }}</span>
                    </div>
                    <div class="invoice-meta-row">
                        <span class="invoice-meta-label">Due Date:</span>
                        <span class="invoice-meta-value">{{ $invoice->due_date ? $invoice->due_date->format('d/m/Y') : '-' }}</span>
                    </div>
                    @if($invoice->offer)
                    <div class="invoice-meta-row">
                        <span class="invoice-meta-label">Offer Ref:</span>
                        <span class="invoice-meta-value">{{ $invoice->offer->offer_number }}</span>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Parties Section -->
        <table style="width: 100%; margin-bottom: 30px;">
            <tr>
                <td style="width: 48%; vertical-align: top; padding: 15px; background-color: #f8f9fa;">
                    <div class="party-title">Bill To</div>
                    <div class="party-details">
                        <div class="party-name">{{ $invoice->customer->first_name }} {{ $invoice->customer->surname }}</div>
                        @if($invoice->customer->org_name)
                            {{ $invoice->customer->org_name }}<br>
                        @endif
                        @if($invoice->customer->office_address)
                            {{ $invoice->customer->office_address }}<br>
                        @endif
                        @if($invoice->customer->postal_code || $invoice->customer->city)
                            {{ $invoice->customer->postal_code }} {{ $invoice->customer->city }}<br>
                        @endif
                        @if($invoice->customer->email)
                            {{ $invoice->customer->email }}<br>
                        @endif
                        @if($invoice->customer->phone)
                            {{ $invoice->customer->phone }}<br>
                        @endif
                        @if($invoice->customer->vat_number)
                            VAT: {{ $invoice->customer->vat_number }}
                        @endif
                    </div>
                </td>
                <td style="width: 4%;"></td>
                <td style="width: 48%; vertical-align: top; padding: 15px; background-color: #f8f9fa;">
                    <div class="party-title">From</div>
                    <div class="party-details">
                        <div class="party-name">{{ $invoice->company->company_name }}</div>
                        {{ $invoice->company->street }} {{ $invoice->company->house }}<br>
                        {{ $invoice->company->postal_code }} {{ $invoice->company->city }}<br>
                        @if($invoice->company->vat_number)
                            VAT: {{ $invoice->company->vat_number }}<br>
                        @endif
                        @if($invoice->company->companySetting && $invoice->company->companySetting->registration_number)
                            Reg: {{ $invoice->company->companySetting->registration_number }}
                        @endif
                    </div>
                </td>
            </tr>
        </table>

        <!-- Introduction -->
        @if($invoice->intro)
        <div class="intro-section">
            <div class="section-title">Introduction</div>
            <div class="section-content">
                {!! nl2br(e($invoice->intro)) !!}
            </div>
        </div>
        @endif

        <!-- Description -->
        @if($invoice->desc)
        <div class="intro-section">
            <div class="section-title">Description</div>
            <div class="section-content">
                {!! nl2br(e($invoice->desc)) !!}
            </div>
        </div>
        @endif

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 45%;">Description</th>
                    <th style="width: 12%;">Quantity</th>
                    <th style="width: 15%;">Price</th>
                    <th style="width: 13%;">VAT</th>
                    <th style="width: 15%;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $item)
                <tr>
                    <td>
                        <div class="item-name">{{ $item->service->name ?? 'Service' }}</div>
                        @if($item->description)
                            <div class="item-description">{{ $item->description }}</div>
                        @endif
                    </td>
                    <td>{{ $item->quantity }}</td>
                    <td>€ {{ number_format($item->price, 2, ',', '.') }}</td>
                    <td>{{ \App\Models\SiteSetting::getInteger('default_vat_rate', 21) }}%</td>
                    <td>€ {{ number_format($item->total, 2, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary-section">
            <table class="summary-table">
                <tr class="summary-row subtotal">
                    <td>Subtotal</td>
                    <td>€ {{ number_format($invoice->subtotal, 2, ',', '.') }}</td>
                </tr>
                <tr class="summary-row tax">
                    <td>VAT ({{ \App\Models\SiteSetting::getInteger('default_vat_rate', 21) }}%)</td>
                    <td>€ {{ number_format($invoice->tax_amount, 2, ',', '.') }}</td>
                </tr>
                <tr class="summary-row total">
                    <td>Total</td>
                    <td>€ {{ number_format($invoice->total, 2, ',', '.') }}</td>
                </tr>
                @if($invoice->amount_paid > 0)
                <tr class="summary-row paid">
                    <td>Amount Paid</td>
                    <td>€ {{ number_format($invoice->amount_paid, 2, ',', '.') }}</td>
                </tr>
                <tr class="summary-row due">
                    <td>Amount Due</td>
                    <td>€ {{ number_format($invoice->amount_due, 2, ',', '.') }}</td>
                </tr>
                @endif
            </table>
        </div>

        <!-- IP Transfer Terms -->
        @if($invoice->hasIpTransfer())
        <div class="ip-section">
            <div class="ip-title">Intellectual Property / Copyright Terms - {{ $invoice->ip_transfer_label }}</div>
            <div class="ip-content">
                {{ $invoice->ip_transfer_text }}
            </div>
        </div>
        @endif

        <!-- Payment Information -->
        @if($invoice->company->companySetting && ($invoice->company->companySetting->iban || $invoice->company->companySetting->bank_name))
        <div class="payment-section">
            <div class="section-title">Payment Information</div>
            <table style="width: 100%;">
                <tr>
                    <td style="width: 48%; vertical-align: top; padding: 15px; background-color: #e3f2fd;">
                        <div class="payment-title">Bank Details</div>
                        <div class="payment-details">
                            @if($invoice->company->companySetting->bank_name)
                                <strong>Bank:</strong> {{ $invoice->company->companySetting->bank_name }}<br>
                            @endif
                            @if($invoice->company->companySetting->iban)
                                <strong>IBAN:</strong> {{ $invoice->company->companySetting->iban }}<br>
                            @endif
                            @if($invoice->company->companySetting->bic)
                                <strong>BIC:</strong> {{ $invoice->company->companySetting->bic }}<br>
                            @endif
                            <strong>Reference:</strong> {{ $invoice->invoice_number ?? 'INV-' . $invoice->id }}
                        </div>
                    </td>
                    <td style="width: 4%;"></td>
                    <td style="width: 48%; vertical-align: top; padding: 15px; background-color: #fff3e0;">
                        <div class="payment-title" style="color: #e65100;">Payment Terms</div>
                        <div class="payment-details">
                            @if($invoice->due_date)
                                Please pay before <strong>{{ $invoice->due_date->format('d/m/Y') }}</strong><br>
                                @if($invoice->due_date->isFuture())
                                    ({{ now()->diffInDays($invoice->due_date) }} days remaining)
                                @elseif($invoice->due_date->isPast() && !$invoice->isPaid())
                                    <span style="color: #c62828;">(Overdue by {{ $invoice->due_date->diffInDays(now()) }} days)</span>
                                @endif
                            @else
                                Payment due upon receipt.
                            @endif
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        @endif

        <!-- Notes -->
        @if($invoice->notes)
        <div class="notes-section">
            <div class="section-title">Notes</div>
            <div class="notes-content">
                {!! nl2br(e($invoice->notes)) !!}
            </div>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <div class="footer-company">{{ $invoice->company->company_name }}</div>
            @if($invoice->company->vat_number)
                VAT: {{ $invoice->company->vat_number }}
                @if($invoice->company->companySetting && $invoice->company->companySetting->registration_number)
                    | Reg: {{ $invoice->company->companySetting->registration_number }}
                @endif
                <br>
            @endif
            @if($invoice->company->email){{ $invoice->company->email }}@endif
            @if($invoice->company->phone) | {{ $invoice->company->phone }}@endif
        </div>
    </div>
</body>
</html>
