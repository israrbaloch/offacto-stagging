<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #{{ $invoice->invoice_number ?? 'N/A' }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #11134E, #4054B2);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .custom-message {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #4054B2;
        }
        .invoice-box {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .invoice-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 15px;
            margin-bottom: 15px;
        }
        .invoice-number {
            font-size: 20px;
            font-weight: bold;
            color: #11134E;
        }
        .invoice-status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-unpaid {
            background: #fff3e0;
            color: #e65100;
        }
        .status-partial {
            background: #e3f2fd;
            color: #1565c0;
        }
        .status-paid {
            background: #e8f5e9;
            color: #2e7d32;
        }
        .invoice-meta {
            display: flex;
            gap: 30px;
            margin-bottom: 20px;
        }
        .meta-item {
            flex: 1;
        }
        .meta-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .meta-value {
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
        }
        td:nth-child(n+2), th:nth-child(n+2) {
            text-align: right;
        }
        .summary-row {
            font-weight: bold;
        }
        .summary-row.subtotal {
            color: #666;
        }
        .summary-row.tax {
            color: #2e7d32;
        }
        .summary-row.total {
            background: #11134E;
            color: white;
            font-size: 16px;
        }
        .summary-row.total td {
            padding: 15px 12px;
        }
        .due-date-box {
            background: #fff3e0;
            border: 2px solid #ff9800;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 25px;
        }
        .due-date-box.overdue {
            background: #ffebee;
            border-color: #f44336;
        }
        .due-date-label {
            font-size: 12px;
            color: #e65100;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .due-date-value {
            font-size: 24px;
            font-weight: bold;
            color: #e65100;
        }
        .due-date-box.overdue .due-date-label,
        .due-date-box.overdue .due-date-value {
            color: #c62828;
        }
        .payment-info {
            background: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .payment-info h3 {
            color: #1565c0;
            margin: 0 0 15px 0;
            font-size: 16px;
        }
        .payment-info p {
            margin: 5px 0;
            font-size: 14px;
        }
        .payment-info strong {
            display: inline-block;
            width: 80px;
            color: #666;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
        .footer a {
            color: #4054B2;
            text-decoration: none;
        }
        .amount-due {
            text-align: center;
            margin: 20px 0;
        }
        .amount-due-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        .amount-due-value {
            font-size: 36px;
            font-weight: bold;
            color: #7b0033;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>{{ $invoice->company->company_name }}</h1>
            <p>{{ $invoice->company->street }} {{ $invoice->company->house }}, {{ $invoice->company->postal_code }} {{ $invoice->company->city }}</p>
        </div>

        <div class="content">
            @if($customMessage)
            <div class="custom-message">
                {!! nl2br(e($customMessage)) !!}
            </div>
            @endif

            <div class="invoice-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div class="invoice-number">Invoice #{{ $invoice->invoice_number ?? 'N/A' }}</div>
                    <span class="invoice-status status-{{ $invoice->payment_status }}">
                        @if($invoice->payment_status === 'paid')
                            Paid
                        @elseif($invoice->payment_status === 'partial')
                            Partially Paid
                        @else
                            Unpaid
                        @endif
                    </span>
                </div>

                <table>
                    <tr>
                        <td><strong>Invoice Date:</strong></td>
                        <td style="text-align: left;">{{ $invoice->invoice_date ? $invoice->invoice_date->format('d-m-Y') : 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Due Date:</strong></td>
                        <td style="text-align: left;">{{ $invoice->due_date ? $invoice->due_date->format('d-m-Y') : 'Upon receipt' }}</td>
                    </tr>
                    @if($invoice->offer)
                    <tr>
                        <td><strong>Offer Reference:</strong></td>
                        <td style="text-align: left;">{{ $invoice->offer->offer_number }}</td>
                    </tr>
                    @endif
                </table>

                <div class="amount-due">
                    <div class="amount-due-label">Amount Due</div>
                    <div class="amount-due-value">€ {{ number_format($invoice->amount_due, 2, ',', '.') }}</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($invoice->items as $item)
                        <tr>
                            <td>
                                {{ $item->service->name ?? 'Service' }}
                                @if($item->description)
                                    <br><small style="color: #999;">{{ $item->description }}</small>
                                @endif
                            </td>
                            <td>{{ $item->quantity }}</td>
                            <td>€ {{ number_format($item->price, 2, ',', '.') }}</td>
                            <td>€ {{ number_format($item->total, 2, ',', '.') }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                    <tfoot>
                        <tr class="summary-row subtotal">
                            <td colspan="3" style="text-align: right;">Subtotal:</td>
                            <td>€ {{ number_format($invoice->subtotal, 2, ',', '.') }}</td>
                        </tr>
                        <tr class="summary-row tax">
                            <td colspan="3" style="text-align: right;">VAT ({{ \App\Models\SiteSetting::getInteger('default_vat_rate', 21) }}%):</td>
                            <td>€ {{ number_format($invoice->tax_amount, 2, ',', '.') }}</td>
                        </tr>
                        <tr class="summary-row total">
                            <td colspan="3" style="text-align: right;">Total:</td>
                            <td>€ {{ number_format($invoice->total, 2, ',', '.') }}</td>
                        </tr>
                        @if($invoice->amount_paid > 0)
                        <tr class="summary-row">
                            <td colspan="3" style="text-align: right; color: #2e7d32;">Amount Paid:</td>
                            <td style="color: #2e7d32;">€ {{ number_format($invoice->amount_paid, 2, ',', '.') }}</td>
                        </tr>
                        @endif
                    </tfoot>
                </table>
            </div>

            @if($invoice->due_date && !$invoice->isPaid())
            <div class="due-date-box {{ $invoice->isOverdue() ? 'overdue' : '' }}">
                <div class="due-date-label">
                    @if($invoice->isOverdue())
                        Payment Overdue
                    @else
                        Payment Due
                    @endif
                </div>
                <div class="due-date-value">{{ $invoice->due_date->format('d F Y') }}</div>
                @if($invoice->isOverdue())
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #c62828;">
                        This invoice is {{ $invoice->due_date->diffInDays(now()) }} days overdue
                    </p>
                @else
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #e65100;">
                        {{ now()->diffInDays($invoice->due_date) }} days remaining
                    </p>
                @endif
            </div>
            @endif

            @if($invoice->company->companySetting && ($invoice->company->companySetting->iban || $invoice->company->companySetting->bank_name))
            <div class="payment-info">
                <h3>Payment Information</h3>
                @if($invoice->company->companySetting->bank_name)
                <p><strong>Bank:</strong> {{ $invoice->company->companySetting->bank_name }}</p>
                @endif
                @if($invoice->company->companySetting->iban)
                <p><strong>IBAN:</strong> {{ $invoice->company->companySetting->iban }}</p>
                @endif
                @if($invoice->company->companySetting->bic)
                <p><strong>BIC:</strong> {{ $invoice->company->companySetting->bic }}</p>
                @endif
                <p><strong>Reference:</strong> {{ $invoice->invoice_number ?? 'INV-' . $invoice->id }}</p>
            </div>
            @endif

            @if($invoice->hasIpTransfer())
            <div style="background: #fff8e1; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <h4 style="color: #ff8f00; margin: 0 0 10px 0;">IP/Copyright Terms: {{ $invoice->ip_transfer_label }}</h4>
                <p style="font-size: 12px; color: #666; margin: 0; line-height: 1.5;">
                    {{ $invoice->ip_transfer_text }}
                </p>
            </div>
            @endif

            @if($invoice->notes)
            <div style="background: #f5f5f5; border-left: 4px solid #7b0033; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #7b0033;">Notes</h4>
                <p style="margin: 0; font-size: 14px; color: #666;">
                    {!! nl2br(e($invoice->notes)) !!}
                </p>
            </div>
            @endif
        </div>

        <div class="footer">
            <p>This invoice was sent by <strong>{{ $invoice->company->company_name }}</strong></p>
            @if($invoice->company->email)
            <p>For questions, please contact: <a href="mailto:{{ $invoice->company->email }}">{{ $invoice->company->email }}</a></p>
            @endif
            @if($invoice->company->vat_number)
            <p>VAT: {{ $invoice->company->vat_number }}</p>
            @endif
        </div>
    </div>
</body>
</html>
