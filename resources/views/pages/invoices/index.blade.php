@extends('app')

@section('title', 'Invoices')

@section('content')

	@include('partials.modals.delete-invoice')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Invoices</h1>
			<a class="e-button" href="{{ route('invoices.create') }}">@svg('plus') Add Invoice</a>
		</div>

		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				@include('partials.elements.search-contacts-small')
				@include('partials.elements.filter-date')

				<div class="c-stats-summary">
					<div class="c-stats-summary__icon">
						@svg('stats')
					</div>
					<ul class="c-stats-summary__list">
						<li class="c-stats-summary__list-item">
							<span>€ {{ number_format($stats['draft'], 2, ',', '.') }}</span> draft
						</li>
						<li class="c-stats-summary__list-item">
							<span>€ {{ number_format($stats['sent'], 2, ',', '.') }}</span> sent
						</li>
						<li class="c-stats-summary__list-item">
							<span>€ {{ number_format($stats['paid'], 2, ',', '.') }}</span> paid
						</li>
						@if($stats['overdue'] > 0)
						<li class="c-stats-summary__list-item c-stats-summary__list-item--overdue">
							<span>€ {{ number_format($stats['overdue'], 2, ',', '.') }}</span> overdue
						</li>
						@endif
					</ul>
				</div>
			</div>

			<div class="l-page-header__selection-actions">
				<button class="e-button e-button--bordered e-button--purple-dark">Mark as Paid</button>
				<button class="e-button e-button--bordered e-button--purple-dark">Duplicate</button>
				<button class="e-button e-button--bordered e-button--purple-dark">Archive</button>
				<button class="e-button e-button--bordered e-button--purple-dark">Delete</button>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing l-page-content--has-table">

		@if(session('status'))
			<div class="e-note e-note--success mb-20">
				<p class="e-note__text">
					@if(session('status') === 'invoice-created')
						Invoice created successfully.
					@elseif(session('status') === 'invoice-updated')
						Invoice updated successfully.
					@elseif(session('status') === 'invoice-deleted')
						Invoice deleted successfully.
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

		@if($invoices->count() > 0)
		<div class="c-table">
			<div class="c-table__wrap">
				<div class="c-table__thead">
					<div class="c-table__thead-tr">
						<div class="c-table__thead-td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox js-select-all-checkboxes" type="checkbox" />
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable c-table__thead-td--sorted">
							Invoice Number
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Date
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Customer
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Due Date
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Amount
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Status
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Payment
						</div>
						<div class="c-table__thead-td">Actions</div>
					</div>
				</div>

				<div class="c-table__tbody">
					@foreach($invoices as $invoice)
					<div class="c-table__tr">
						<div class="c-table__td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox" value="{{ $invoice->id }}"/>
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>
						<div class="c-table__td c-table__td--number">
							<a href="{{ route('invoices.show', $invoice->id) }}" class="c-table__text">{{ $invoice->invoice_number ?? '-' }}</a>
						</div>
						<div class="c-table__td c-table__td--date">
							<p class="c-table__text">{{ $invoice->invoice_date ? $invoice->invoice_date->format('d-m-Y') : '-' }}</p>
						</div>
						<div class="c-table__td c-table__td--contact">
							<p class="c-table__text">{{ $invoice->customer->first_name }} {{ $invoice->customer->surname }}</p>
							@if($invoice->customer->org_name)
								<p class="c-table__text" style="color: #999; font-size: 1.2rem; margin-top: 0.5rem;">{{ $invoice->customer->org_name }}</p>
							@endif
						</div>
						<div class="c-table__td c-table__td--date">
							<p class="c-table__text {{ $invoice->isOverdue() ? 'c-table__text--overdue' : '' }}">
								{{ $invoice->due_date ? $invoice->due_date->format('d-m-Y') : '-' }}
								@if($invoice->isOverdue())
									<span class="c-table__overdue-badge">Overdue</span>
								@endif
							</p>
						</div>
						<div class="c-table__td c-table__td--costs">
							<p class="c-table__text">€ {{ number_format($invoice->total, 2, ',', '.') }}</p>
							@if($invoice->amount_paid > 0 && $invoice->amount_due > 0)
								<p class="c-table__text c-table__text--small" style="color: #2e7d32;">
									Paid: € {{ number_format($invoice->amount_paid, 2, ',', '.') }}
								</p>
							@endif
						</div>
						<div class="c-table__td c-table__td--status">
							@if($invoice->statusRelation)
								<span class="c-table__badge c-table__badge--{{ strtolower($invoice->statusRelation->name) }}">{{ $invoice->statusRelation->name }}</span>
							@else
								<span class="c-table__badge">-</span>
							@endif
						</div>
						<div class="c-table__td c-table__td--status">
							@php
								$paymentStatusClass = match($invoice->payment_status) {
									'paid' => 'c-table__badge--paid',
									'partial' => 'c-table__badge--partial',
									default => 'c-table__badge--unpaid',
								};
								$paymentStatusText = match($invoice->payment_status) {
									'paid' => 'Paid',
									'partial' => 'Partial',
									default => 'Unpaid',
								};
							@endphp
							<span class="c-table__badge {{ $paymentStatusClass }}">{{ $paymentStatusText }}</span>
						</div>
						<div class="c-table__td">
							<a href="{{ route('invoices.show', $invoice->id) }}" class="e-button e-button--bordered e-button--purple-dark e-button--small">View</a>
							<a href="{{ route('invoices.edit', $invoice->id) }}" class="e-button e-button--bordered e-button--purple-dark e-button--small">Edit</a>
							<button 
								class="e-button e-button--bordered e-button--red e-button--small delete-invoice-btn" 
								data-invoice-id="{{ $invoice->id }}"
								data-invoice-number="{{ $invoice->invoice_number ?? 'N/A' }}">
								Delete
							</button>
						</div>
					</div>
					@endforeach
				</div>
			</div>
		</div>

		@include('partials.elements.pagination')
		@else
		<div class="e-note e-note--info">
			<p class="e-note__text">No invoices found. Click "Add Invoice" to create your first invoice.</p>
		</div>
		@endif

	</div>

	@push('styles')
	<style>
		.c-stats-summary__list-item--overdue span {
			color: #c62828;
		}

		.c-table__text--overdue {
			color: #c62828 !important;
		}

		.c-table__overdue-badge {
			display: inline-block;
			background: #ffebee;
			color: #c62828;
			font-size: 1rem;
			padding: 0.2rem 0.5rem;
			border-radius: 3px;
			margin-left: 0.5rem;
		}

		.c-table__text--small {
			font-size: 1.1rem;
			margin-top: 0.3rem;
		}

		.c-table__badge--paid {
			background-color: #e8f5e9;
			color: #2e7d32;
		}

		.c-table__badge--partial {
			background-color: #e3f2fd;
			color: #1565c0;
		}

		.c-table__badge--unpaid {
			background-color: #fff3e0;
			color: #e65100;
		}

		.c-table__badge--draft {
			background-color: #f5f5f5;
			color: #666;
		}

		.c-table__badge--sent {
			background-color: #e3f2fd;
			color: #1565c0;
		}
	</style>
	@endpush

	@push('scripts')
	<script src="{{ asset('js/invoices.js') }}?v={{ uniqid() }}"></script>
	@endpush

@endsection
