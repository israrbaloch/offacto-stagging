@extends('app')

@section('title', 'Invoice Preview')

@section('content')

    @include('partials.modals.send-invoice', ['invoice' => $invoice])
    @include('partials.modals.record-payment', ['invoice' => $invoice, 'paymentMethods' => $paymentMethods])

    <div class="l-page-header">
        <div class="l-page-header__left-wrap">
            <h1 class="l-page-header__title">← Invoice Preview</h1>
        </div>
        <div class="l-page-header__right-wrap">
            <div class="l-page-header__right-content">
                <a href="{{ route('invoices.index') }}" class="e-button e-button--bordered">Back</a>
                <a href="{{ route('invoices.edit', $invoice->id) }}" class="e-button e-button--bordered e-button--purple-dark">Edit</a>
                <a href="{{ route('invoices.download', $invoice->id) }}" class="e-button e-button--bordered e-button--purple-dark">
                    @svg('download') PDF
                </a>
                <a href="{{ route('invoices.ubl', $invoice->id) }}" class="e-button e-button--bordered e-button--purple-dark">
                    @svg('download') UBL/XML
                </a>
                @if(!$invoice->isPaid())
                <button class="e-button e-button--bordered e-button--green" id="record-payment-btn">
                    @svg('plus') Record Payment
                </button>
                @endif
                <button class="e-button" id="send-invoice-btn" data-invoice-id="{{ $invoice->id }}">
                    @svg('send') Send
                </button>
            </div>
        </div>
    </div>

    <div class="l-page-content l-page-content--inline-spacing">

        @if(session('status'))
            <div class="e-note e-note--success mb-20">
                <p class="e-note__text">
                    @if(session('status') === 'invoice-created')
                        Invoice created successfully.
                    @elseif(session('status') === 'invoice-updated')
                        Invoice updated successfully.
                    @elseif(session('status') === 'invoice-sent')
                        Invoice sent successfully.
                    @elseif(session('status') === 'payment-recorded')
                        Payment recorded successfully.
                    @endif
                </p>
            </div>
        @endif

        @if(session('error'))
            <div class="e-note e-note--error mb-20">
                <p class="e-note__text">{{ session('error') }}</p>
            </div>
        @endif

        {{-- Payment Status Banner --}}
        @if($invoice->isOverdue())
        <div class="c-invoice-banner c-invoice-banner--overdue">
            <div class="c-invoice-banner__icon">@svg('alert')</div>
            <div class="c-invoice-banner__content">
                <strong>Overdue</strong> - This invoice was due on {{ $invoice->due_date->format('d-m-Y') }} ({{ $invoice->due_date->diffInDays(now()) }} days overdue)
            </div>
            <div class="c-invoice-banner__amount">€ {{ number_format($invoice->amount_due, 2, ',', '.') }} due</div>
        </div>
        @elseif($invoice->isPaid())
        <div class="c-invoice-banner c-invoice-banner--paid">
            <div class="c-invoice-banner__icon">@svg('check')</div>
            <div class="c-invoice-banner__content">
                <strong>Paid in Full</strong> - This invoice has been fully paid.
            </div>
            <div class="c-invoice-banner__amount">€ {{ number_format($invoice->total, 2, ',', '.') }}</div>
        </div>
        @elseif($invoice->payment_status === 'partial')
        <div class="c-invoice-banner c-invoice-banner--partial">
            <div class="c-invoice-banner__icon">@svg('info')</div>
            <div class="c-invoice-banner__content">
                <strong>Partially Paid</strong> - € {{ number_format($invoice->amount_paid, 2, ',', '.') }} received, € {{ number_format($invoice->amount_due, 2, ',', '.') }} remaining
            </div>
            <div class="c-invoice-banner__amount">€ {{ number_format($invoice->amount_due, 2, ',', '.') }} due</div>
        </div>
        @endif

        <div class="c-invoice-page">
            {{-- Header --}}
            <header class="c-invoice-top">
                <div class="c-invoice-logo">
                    @if ($invoice->company->companySetting && $invoice->company->companySetting->invoice_logo)
                        <img src="{{ asset('storage/' . $invoice->company->companySetting->invoice_logo) }}"
                            alt="{{ $invoice->company->company_name }}">
                    @else
                        <div class="c-invoice-logo-placeholder">
                            {{ strtoupper(substr($invoice->company->company_name, 0, 2)) }}
                        </div>
                        <span class="c-invoice-logo-text">{{ $invoice->company->company_name }}</span>
                    @endif
                </div>
                <div class="c-invoice-title">
                    <h1>Invoice</h1>
                    <p>Invoice #{{ $invoice->invoice_number ?? 'N/A' }}</p>
                </div>
                <div class="c-invoice-meta">
                    <div><strong>Invoice No.</strong><br>{{ $invoice->invoice_number ?? 'N/A' }}</div>
                    <div><strong>Invoice Date</strong><br>{{ $invoice->invoice_date ? $invoice->invoice_date->format('d/m/Y') : now()->format('d/m/Y') }}</div>
                    @if ($invoice->due_date)
                        <div class="{{ $invoice->isOverdue() ? 'c-invoice-meta--overdue' : '' }}">
                            <strong>Due Date</strong><br>{{ $invoice->due_date->format('d/m/Y') }}
                        </div>
                    @endif
                    @if ($invoice->offer)
                        <div><strong>Offer Ref.</strong><br>{{ $invoice->offer->offer_number }}</div>
                    @endif
                </div>
            </header>

            {{-- Client & Company --}}
            <section class="c-invoice-two-cols">
                <div>
                    <h3>Bill To</h3>
                    <p>
                        {{ $invoice->customer->first_name }} {{ $invoice->customer->surname }}<br>
                        @if ($invoice->customer->org_name)
                            {{ $invoice->customer->org_name }}<br>
                        @endif
                        @if ($invoice->customer->office_address)
                            {{ $invoice->customer->office_address }}<br>
                        @endif
                        @if ($invoice->customer->postal_code || $invoice->customer->city)
                            {{ $invoice->customer->postal_code }} {{ $invoice->customer->city }}<br>
                        @endif
                        @if ($invoice->customer->email)
                            {{ $invoice->customer->email }}<br>
                        @endif
                        @if ($invoice->customer->vat_number)
                            VAT: {{ $invoice->customer->vat_number }}
                        @endif
                    </p>
                </div>
                <div>
                    <h3>From</h3>
                    <p>
                        {{ $invoice->company->company_name }}<br>
                        {{ $invoice->company->street }} {{ $invoice->company->house }}<br>
                        {{ $invoice->company->postal_code }} {{ $invoice->company->city }}<br>
                        @if ($invoice->company->vat_number)
                            VAT: {{ $invoice->company->vat_number }}<br>
                        @endif
                        {{ $invoice->company->email }}
                    </p>
                </div>
            </section>

            {{-- Introduction --}}
            @if ($invoice->intro)
                <section>
                    <h3>Introduction</h3>
                    <p>{!! nl2br(e($invoice->intro)) !!}</p>
                </section>
            @endif

            {{-- Description --}}
            @if ($invoice->desc)
                <section>
                    <h3>Description</h3>
                    <p>{!! nl2br(e($invoice->desc)) !!}</p>
                </section>
            @endif

            {{-- Items Table --}}
            <table class="c-invoice-items">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>VAT</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($invoice->items as $item)
                        <tr>
                            <td>{{ $item->service->name ?? 'N/A' }}{{ $item->description ? ' - ' . $item->description : '' }}</td>
                            <td>{{ $item->quantity }}</td>
                            <td>€ {{ number_format($item->price, 2, ',', '.') }}</td>
                            <td>{{ \App\Models\SiteSetting::getInteger('default_vat_rate', 21) }}%</td>
                            <td>€ {{ number_format($item->total, 2, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            {{-- Summary --}}
            <div class="c-invoice-summary">
                <div>Subtotal <span>€ {{ number_format($invoice->subtotal, 2, ',', '.') }}</span></div>
                <div>VAT ({{ \App\Models\SiteSetting::getInteger('default_vat_rate', 21) }}%) <span>€ {{ number_format($invoice->tax_amount, 2, ',', '.') }}</span></div>
                <div class="c-invoice-grand">Total <span>€ {{ number_format($invoice->total, 2, ',', '.') }}</span></div>
                @if($invoice->amount_paid > 0)
                <div class="c-invoice-paid">Amount Paid <span>€ {{ number_format($invoice->amount_paid, 2, ',', '.') }}</span></div>
                <div class="c-invoice-due {{ $invoice->isOverdue() ? 'c-invoice-due--overdue' : '' }}">Amount Due <span>€ {{ number_format($invoice->amount_due, 2, ',', '.') }}</span></div>
                @endif
            </div>

            {{-- IP Transfer Terms --}}
            @if($invoice->hasIpTransfer())
            <section class="c-invoice-ip-section">
                <h3>Intellectual Property / Copyright Terms</h3>
                <div class="c-invoice-ip-type">{{ $invoice->ip_transfer_label }}</div>
                <p>{{ $invoice->ip_transfer_text }}</p>
            </section>
            @endif

            {{-- Payment History --}}
            @if($invoice->payments->count() > 0)
            <section class="c-invoice-payments">
                <h3>Payment History</h3>
                <table class="c-invoice-payments-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($invoice->payments as $payment)
                        <tr>
                            <td>{{ $payment->payment_date->format('d-m-Y') }}</td>
                            <td>€ {{ number_format($payment->amount, 2, ',', '.') }}</td>
                            <td>{{ $payment->payment_method_label }}</td>
                            <td>{{ $payment->reference ?? '-' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </section>
            @endif

            {{-- Notes --}}
            @if ($invoice->notes)
                <section>
                    <h3>Notes</h3>
                    <p>{!! nl2br(e($invoice->notes)) !!}</p>
                </section>
            @endif

            {{-- Payment Info --}}
            @if($invoice->company->companySetting && ($invoice->company->companySetting->iban || $invoice->company->companySetting->bank_name))
            <section class="c-invoice-payment-info">
                <h3>Payment Information</h3>
                <div class="c-invoice-payment-details">
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
            </section>
            @endif

            {{-- Footer --}}
            <footer class="c-invoice-footer">
                <h3>Invoice prepared by</h3>
                <p>
                    {{ $invoice->company->company_name }}<br>
                    {{ $invoice->company->street }} {{ $invoice->company->house }}<br>
                    {{ $invoice->company->postal_code }} {{ $invoice->company->city }}{{ $invoice->company->country ? ', ' . $invoice->company->country : '' }}<br><br>
                    @if ($invoice->company->vat_number)
                        {{ $invoice->company->vat_number }}
                        @if ($invoice->company->companySetting && $invoice->company->companySetting->registration_number)
                            – {{ $invoice->company->companySetting->registration_number }}
                        @endif
                        <br>
                    @endif
                    @if ($invoice->company->email)
                        {{ $invoice->company->email }}
                    @endif
                </p>
            </footer>
        </div>
    </div>

    @push('styles')
        <style>
            /* Invoice Banner */
            .c-invoice-banner {
                display: flex;
                align-items: center;
                padding: 1.5rem 2rem;
                border-radius: 0.8rem;
                margin-bottom: 2rem;
                gap: 1.5rem;
            }

            .c-invoice-banner__icon svg {
                width: 2.4rem;
                height: 2.4rem;
            }

            .c-invoice-banner__content {
                flex: 1;
                font-size: 1.4rem;
            }

            .c-invoice-banner__amount {
                font-size: 1.8rem;
                font-weight: 700;
            }

            .c-invoice-banner--overdue {
                background: #ffebee;
                border: 1px solid #f44336;
                color: #c62828;
            }

            .c-invoice-banner--paid {
                background: #e8f5e9;
                border: 1px solid #4caf50;
                color: #2e7d32;
            }

            .c-invoice-banner--partial {
                background: #e3f2fd;
                border: 1px solid #2196f3;
                color: #1565c0;
            }

            /* Invoice Page */
            .c-invoice-page {
                font-family: "Helvetica Neue", Arial, sans-serif;
                color: #111;
                background: #fff;
                max-width: 800px;
                margin: auto;
                padding: 40px;
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            }

            .c-invoice-top {
                display: grid;
                grid-template-columns: 120px 1fr 200px;
                align-items: start;
                gap: 20px;
            }

            .c-invoice-logo img {
                width: 110px;
                object-fit: contain;
            }

            .c-invoice-logo-placeholder {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
                border-radius: 4px;
            }

            .c-invoice-logo-text {
                display: block;
                font-size: 11px;
                color: #666;
                margin-top: 4px;
            }

            .c-invoice-title {
                margin-left: 50px;
                margin-top: 25px;
            }

            .c-invoice-title h1 {
                font-size: 32px;
                letter-spacing: 1px;
                margin: 0;
                font-weight: 900;
                text-transform: uppercase;
            }

            .c-invoice-title p {
                font-size: 12px;
                margin-top: 4px;
                color: #666;
            }

            .c-invoice-meta {
                font-size: 12px;
                text-align: right;
            }

            .c-invoice-meta div {
                margin-bottom: 8px;
            }

            .c-invoice-meta strong {
                color: #666;
            }

            .c-invoice-meta--overdue {
                color: #c62828;
            }

            .c-invoice-page h3 {
                font-size: 16px;
                text-transform: uppercase;
                margin-bottom: 6px;
                border-bottom: 1px solid #7b0033;
                padding-bottom: 4px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }

            .c-invoice-page p {
                font-size: 12px;
                line-height: 1.5;
                margin: 0;
            }

            .c-invoice-two-cols {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-top: 30px;
            }

            .c-invoice-page section {
                margin-top: 25px;
            }

            .c-invoice-items {
                width: 100%;
                border-collapse: collapse;
                margin-top: 25px;
                font-size: 12px;
            }

            .c-invoice-items th {
                text-align: left;
                border-bottom: 1px solid #000;
                padding-bottom: 6px;
                font-weight: 600;
            }

            .c-invoice-items td {
                padding: 10px 0;
                border-bottom: 1px solid #f0f0f0;
            }

            .c-invoice-items th:nth-child(n+2),
            .c-invoice-items td:nth-child(n+2) {
                text-align: right;
            }

            .c-invoice-summary {
                margin-top: 20px;
                font-size: 12px;
                width: 100%;
            }

            .c-invoice-summary div {
                display: flex;
                justify-content: space-between;
                margin-top: 4px;
                padding: 4px 0;
            }

            .c-invoice-grand {
                font-weight: bold;
                color: #7b0033;
                border-top: 1px solid #E2E2E2;
                padding-top: 8px !important;
                margin-top: 8px;
            }

            .c-invoice-paid {
                color: #2e7d32;
            }

            .c-invoice-due {
                font-weight: bold;
                border-top: 1px solid #E2E2E2;
                padding-top: 8px !important;
            }

            .c-invoice-due--overdue {
                color: #c62828;
            }

            /* IP Section */
            .c-invoice-ip-section {
                background: #fff8e1;
                border: 1px solid #ffc107;
                border-radius: 0.6rem;
                padding: 1.5rem;
                margin-top: 25px;
            }

            .c-invoice-ip-section h3 {
                color: #ff8f00;
                border-bottom-color: #ffc107;
            }

            .c-invoice-ip-type {
                font-weight: 600;
                color: #ff8f00;
                margin-bottom: 0.8rem;
            }

            /* Payment History */
            .c-invoice-payments {
                margin-top: 25px;
            }

            .c-invoice-payments-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                margin-top: 10px;
            }

            .c-invoice-payments-table th,
            .c-invoice-payments-table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #f0f0f0;
            }

            .c-invoice-payments-table th {
                background: #f5f5f5;
                font-weight: 600;
            }

            /* Payment Info */
            .c-invoice-payment-info {
                background: #e3f2fd;
                border-radius: 0.6rem;
                padding: 1.5rem;
                margin-top: 25px;
            }

            .c-invoice-payment-info h3 {
                color: #1565c0;
                border-bottom-color: #1565c0;
            }

            .c-invoice-payment-details p {
                margin-bottom: 0.5rem;
            }

            .c-invoice-footer {
                margin-top: 30px;
                font-size: 11px;
            }

            .c-invoice-footer p {
                font-size: 11px;
                color: #666;
            }

            /* Page header buttons */
            .l-page-header__right-content {
                display: flex;
                gap: 1rem;
                align-items: center;
                flex-wrap: wrap;
            }

            .e-button--green {
                background-color: #2e7d32;
                border-color: #2e7d32;
                color: white;
            }

            .e-button--green:hover {
                background-color: #1b5e20;
                border-color: #1b5e20;
            }

            @media (max-width: 768px) {
                .c-invoice-page {
                    padding: 20px;
                }

                .c-invoice-top {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }

                .c-invoice-meta {
                    text-align: left;
                }

                .c-invoice-two-cols {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }

                .c-invoice-items {
                    font-size: 11px;
                }

                .c-invoice-items th,
                .c-invoice-items td {
                    padding: 8px 4px;
                }
            }
        </style>
    @endpush

    @push('scripts')
        <script src="{{ asset('js/invoices.js') }}?v={{ uniqid() }}"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Send invoice button handler
                const sendBtn = document.getElementById('send-invoice-btn');
                if (sendBtn) {
                    sendBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const modal = document.querySelector('[modal-id="send-invoice"]');
                        if (modal) {
                            modal.classList.add('e-modal--open');
                            document.body.classList.add('body--no-scroll');
                        }
                    });
                }

                // Record payment button handler
                const paymentBtn = document.getElementById('record-payment-btn');
                if (paymentBtn) {
                    paymentBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const modal = document.querySelector('[modal-id="record-payment"]');
                        if (modal) {
                            modal.classList.add('e-modal--open');
                            document.body.classList.add('body--no-scroll');
                        }
                    });
                }

                // Modal close handlers
                document.addEventListener('click', function(e) {
                    if (e.target.closest('.js-close-modal')) {
                        const modal = e.target.closest('.e-modal');
                        if (modal) {
                            e.preventDefault();
                            e.stopPropagation();
                            modal.classList.remove('e-modal--open');
                            document.body.classList.remove('body--no-scroll');
                        }
                    }
                });
            });
        </script>
    @endpush

@endsection
