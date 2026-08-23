<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offer #{{ $offer->offer_number ?? 'N/A' }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .offer-details {
            background: white;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .total {
            font-weight: bold;
            font-size: 1.2em;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{ $offer->company->company_name }}</h2>
        <p>{{ $offer->company->street }} {{ $offer->company->house }}</p>
        <p>{{ $offer->company->postal_code }} {{ $offer->company->city }}</p>
    </div>

    @if($customMessage)
    <div style="margin-bottom: 20px;">
        {!! nl2br(e($customMessage)) !!}
    </div>
    @endif

    <div class="offer-details">
        <h3>Offer #{{ $offer->offer_number ?? 'N/A' }}</h3>
        <p><strong>Date:</strong> {{ $offer->offer_date ? $offer->offer_date->format('d-m-Y') : 'N/A' }}</p>
        @if($offer->valid_until)
        <p><strong>Valid Until:</strong> {{ $offer->valid_until->format('d-m-Y') }}</p>
        @endif

        @if($offer->intro)
        <div style="margin: 20px 0;">
            {!! nl2br(e($offer->intro)) !!}
        </div>
        @endif

        <table>
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($offer->items as $item)
                <tr>
                    <td>{{ $item->service->name ?? 'N/A' }}</td>
                    <td>{{ $item->description ?? '-' }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>€ {{ number_format($item->price, 2, ',', '.') }}</td>
                    <td>€ {{ number_format($item->total, 2, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Subtotal:</strong></td>
                    <td><strong>€ {{ number_format($offer->subtotal, 2, ',', '.') }}</strong></td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Tax ({{ \App\Models\SiteSetting::getInteger('default_vat_rate', 21) }}%):</strong></td>
                    <td><strong>€ {{ number_format($offer->tax_amount, 2, ',', '.') }}</strong></td>
                </tr>
                <tr class="total">
                    <td colspan="4" style="text-align: right;"><strong>Total:</strong></td>
                    <td><strong>€ {{ number_format($offer->total, 2, ',', '.') }}</strong></td>
                </tr>
            </tfoot>
        </table>

        @if($offer->desc)
        <div style="margin-top: 20px;">
            <h4>Description</h4>
            {!! nl2br(e($offer->desc)) !!}
        </div>
        @endif
    </div>

    <div class="footer">
        <div style="margin-bottom:12px;display:inline-block;">@include('emails.partials.logo', ['width' => 120])</div>
        <p>This offer was sent by {{ $offer->company->company_name }}.</p>
        <p>For questions, please contact: {{ $offer->company->email }}</p>
    </div>
</body>
</html>
