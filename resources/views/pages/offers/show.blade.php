@extends('app')

@section('title', 'Offer Preview')

@section('content')

    <div class="l-page-header">
        <div class="l-page-header__left-wrap">
            <h1 class="l-page-header__title">← Offer Preview</h1>
        </div>
        <div class="l-page-header__right-wrap">
            <div class="l-page-header__right-content">
                <a href="{{ route('offers.index') }}" class="e-button e-button--bordered">Back</a>
                <a href="{{ route('offers.edit', $offer->id) }}"
                    class="e-button e-button--bordered e-button--purple-dark">Edit</a>
                <button class="e-button" id="send-offer-btn" data-offer-id="{{ $offer->id }}">Send</button>
            </div>
        </div>
    </div>

    <div class="l-page-content l-page-content--inline-spacing">
        <div class="c-offer-page">
            {{-- Header --}}
            <header class="c-offer-top">
                <div class="c-offer-logo">
                    @if ($offer->company->companySetting && $offer->company->companySetting->invoice_logo)
                        <img src="{{ asset('storage/' . $offer->company->companySetting->invoice_logo) }}"
                            alt="{{ $offer->company->company_name }}">
                    @else
                        <div class="c-offer-logo-placeholder">
                            {{ strtoupper(substr($offer->company->company_name, 0, 2)) }}
                        </div>
                        <span class="c-offer-logo-text">{{ $offer->company->company_name }}</span>
                    @endif
                </div>
                <div class="c-offer-title">
                    <h1>Offer</h1>
                    @if ($offer->desc)
                        <p>Where expectations meet execution.</p>
                    @endif
                </div>
                <div class="c-offer-meta">
                    <div><strong>Offer no.</strong><br>{{ $offer->offer_number ?? 'N/A' }}</div>
                    <div><strong>Offered
                            date</strong><br>{{ $offer->offer_date ? $offer->offer_date->format('d/m/Y') : now()->format('d/m/Y') }}
                    </div>
                    @if ($offer->valid_until)
                        <div><strong>Valid until</strong><br>{{ $offer->valid_until->format('d/m/Y') }}</div>
                    @endif
                </div>
            </header>

            {{-- Client & Executor --}}
            <section class="c-offer-two-cols">
                <div>
                    <h3>Client</h3>
                    <p>
                        {{ $offer->customer->first_name }} {{ $offer->customer->surname }}<br>
                        @if ($offer->customer->org_name)
                            {{ $offer->customer->org_name }}<br>
                        @endif
                        @if ($offer->customer->office_address)
                            {{ $offer->customer->office_address }}
                        @endif
                    </p>
                </div>
                <div>
                    <h3>Executor</h3>
                    <p>
                        {{ auth()->user()->name ?? $offer->company->company_name }}<br>
                        {{ $offer->customer->first_name }} {{ $offer->customer->surname }}<br>
                        @if ($offer->customer->phone)
                            {{ $offer->customer->phone }}<br>
                        @endif
                        {{ $offer->customer->email }}
                    </p>
                </div>
            </section>

            {{-- Introduction --}}
            @if ($offer->intro)
                <section>
                    <h3>Introduction</h3>
                    <p>{!! nl2br(e($offer->intro)) !!}</p>
                </section>
            @endif

            {{-- Assignment --}}
            @if ($offer->desc)
                <section>
                    <h3>Description</h3>
                    <p>{!! nl2br(e($offer->desc)) !!}</p>
                </section>
            @endif

            {{-- Performance Table --}}
            <table class="c-offer-items">
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
                    @foreach ($offer->items as $item)
                        <tr>
                            <td>{{ $item->service->name ?? 'N/A' }}{{ $item->description ? ' - ' . $item->description : '' }}
                            </td>
                            <td>{{ $item->quantity }}</td>
                            <td>€ {{ number_format($item->price, 2, ',', '.') }}</td>
                            <td>21 %</td>
                            <td>€ {{ number_format($item->total, 2, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            {{-- Summary --}}
            <div class="c-offer-summary">
                <div>Subtotal <span>€ {{ number_format($offer->subtotal, 2, ',', '.') }}</span></div>
                <div>Btw ({{ \App\Models\SiteSetting::getInteger('default_vat_rate', 21) }}%) <span>€ {{ number_format($offer->tax_amount, 2, ',', '.') }}</span></div>
                <div class="c-offer-grand">Total <span>€ {{ number_format($offer->total, 2, ',', '.') }}</span></div>
            </div>

            {{-- Special conditions --}}
            @if ($offer->notes)
                <section>
                    <h3>Special notes</h3>
                    <p>{!! nl2br(e($offer->notes)) !!}</p>
                </section>
            @endif

            {{-- Footer --}}
            <footer class="c-offer-footer">
                <h3>Offer prepared by</h3>
                <p>
                    {{ $offer->company->company_name }}<br>
                    {{ $offer->company->street }} {{ $offer->company->house }}<br>
                    {{ $offer->company->postal_code }}
                    {{ $offer->company->city }}{{ $offer->company->country ? ', ' . $offer->company->country : '' }}<br><br>
                    @if ($offer->company->vat_number)
                        {{ $offer->company->vat_number }}
                        @if ($offer->company->companySetting && $offer->company->companySetting->registration_number)
                            – {{ $offer->company->companySetting->registration_number }}
                        @endif
                        <br>
                    @endif
                    @if ($offer->company->email)
                        {{ $offer->company->email }}
                    @endif
                </p>
            </footer>
        </div>
    </div>

    @include('partials.modals.send-offer', ['offer' => $offer])

    @push('styles')
        <style>
            .c-offer-page {
                font-family: "Helvetica Neue", Arial, sans-serif;
                color: #111;
                background: #fff;
                max-width: 800px;
                margin: auto;
                padding: 40px;
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            }

            .c-offer-top {
                display: grid;
                grid-template-columns: 120px 1fr 200px;
                align-items: start;
                gap: 20px;
            }

            .c-offer-logo img {
                width: 110px;
                /* max-height: 60px; */
                object-fit: contain;
            }

            .c-offer-logo-placeholder {
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

            .c-offer-logo-text {
                display: block;
                font-size: 11px;
                color: #666;
                margin-top: 4px;
            }

            .c-offer-title {
                margin-left: 50px;
                margin-top: 25px;
            }

            .c-offer-title h1 {
                font-size: 32px;
                letter-spacing: 1px;
                margin: 0;
                font-weight: 900;
				text-transform: uppercase;	
            }

            .c-offer-title p {
                font-size: 12px;
                margin-top: 4px;
                color: #666;
            }

            .c-offer-meta {
                font-size: 12px;
                text-align: right;
            }

            .c-offer-meta div {
                margin-bottom: 8px;
            }

            .c-offer-meta strong {
                color: #666;
            }

            .c-offer-page h3 {
                font-size: 16px;
                text-transform: uppercase;
                margin-bottom: 6px;
                border-bottom: 1px solid #7b0033;
                padding-bottom: 4px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }

            .c-offer-page p {
                font-size: 12px;
                line-height: 1.5;
                margin: 0;
            }

            .c-offer-two-cols {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-top: 30px;
            }

            .c-offer-page section {
                margin-top: 25px;
            }

            .c-offer-items {
                width: 100%;
                border-collapse: collapse;
                margin-top: 25px;
                font-size: 12px;
            }

            .c-offer-items th {
                text-align: left;
                border-bottom: 1px solid #000;
                padding-bottom: 6px;
                font-weight: 600;
            }

            .c-offer-items td {
                padding: 10px 0;
                border-bottom: 1px solid #f0f0f0;
            }

            .c-offer-items th:nth-child(n+2),
            .c-offer-items td:nth-child(n+2) {
                text-align: right;
            }

            .c-offer-summary {
                margin-top: 20px;
                font-size: 12px;
                width: 100%;
            }

            .c-offer-summary div {
                display: flex;
                justify-content: space-between;
                margin-top: 4px;
                padding: 4px 0;
            }

            .c-offer-grand {
                font-weight: bold;
                color: #7b0033;
                border-top: 1px solid #E2E2E2;
                padding-top: 8px !important;
                margin-top: 8px;
            }

            .c-offer-footer {
                margin-top: 30px;
                font-size: 11px;
            }

            .c-offer-footer p {
                font-size: 11px;
                color: #666;
            }

            /* Page header buttons */
            .l-page-header__right-content {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            @media (max-width: 768px) {
                .c-offer-page {
                    padding: 20px;
                }

                .c-offer-top {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }

                .c-offer-meta {
                    text-align: left;
                }

                .c-offer-two-cols {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }

                .c-offer-items {
                    font-size: 11px;
                }

                .c-offer-items th,
                .c-offer-items td {
                    padding: 8px 4px;
                }
            }
        </style>
    @endpush

    @push('scripts')
        <script src="{{ asset('js/offers.js') }}?v={{ uniqid() }}"></script>
        <script>
            // Send offer button handler
            document.addEventListener('DOMContentLoaded', function() {
                const sendBtn = document.getElementById('send-offer-btn');
                if (sendBtn) {
                    sendBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const modal = document.querySelector('[modal-id="send-offer"]');
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
