@extends('layouts.app')

@section('title', 'View Company: ' . $company->company_name)

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">{{ $company->company_name }}</h1>
			<span class="c-table__badge c-table__badge--{{ $company->is_active ? 'active' : 'inactive' }}">
				{{ $company->is_active ? 'Active' : 'Inactive' }}
			</span>
			@if($company->statusRelation)
			<span class="c-table__badge c-table__badge--{{ strtolower(str_replace(' ', '-', $company->statusRelation->name)) }}">
				{{ $company->statusRelation->name }}
			</span>
			@endif
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<a href="{{ route('admin.companies.index') }}" class="e-button e-button--bordered">Back to Companies</a>
				<a href="{{ route('admin.companies.edit', $company) }}" class="e-button">Edit Company</a>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		@if(session('status'))
			<div class="e-note e-note--success mb-20">
				<p class="e-note__text">
					@if(session('status') === 'company-updated')
						Company updated successfully.
					@elseif(session('status') === 'company-approved')
						Company approved successfully.
					@elseif(session('status') === 'company-rejected')
						Company rejected successfully.
					@elseif(session('status') === 'company-activated')
						Company activated successfully.
					@elseif(session('status') === 'company-deactivated')
						Company deactivated successfully.
					@endif
				</p>
			</div>
		@endif

		@if(session('error'))
			<div class="e-note e-note--error mb-20">
				<p class="e-note__text">{{ session('error') }}</p>
			</div>
		@endif

		<div class="l-widget-grid">
			<div class="l-widget-grid__left">

				{{-- Company Details --}}
				<div class="e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Company Details</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						<ul class="c-widget-stats__list">
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Owner</span>
								<span class="c-widget-stats__item-data">
									<a href="{{ route('admin.users.show', $company->user) }}">{{ $company->user->name }}</a>
								</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Email</span>
								<span class="c-widget-stats__item-data">{{ $company->email }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Phone</span>
								<span class="c-widget-stats__item-data">{{ $company->phone ?? 'N/A' }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">VAT Number</span>
								<span class="c-widget-stats__item-data">{{ $company->vat_number ?? 'N/A' }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Address</span>
								<span class="c-widget-stats__item-data">
									{{ $company->street }} {{ $company->house }}, {{ $company->postal_code }} {{ $company->city }}
								</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Created</span>
								<span class="c-widget-stats__item-data">{{ $company->created_at->format('d M Y H:i') }}</span>
							</li>
							@if($company->approved_at)
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Approved</span>
								<span class="c-widget-stats__item-data">{{ $company->approved_at->format('d M Y H:i') }} by {{ $company->approver->name ?? 'N/A' }}</span>
							</li>
							@endif
						</ul>
					</div>
				</div>

				{{-- Quick Actions --}}
				<div class="e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Quick Actions</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						@if($company->isPendingApproval())
						<form action="{{ route('admin.companies.approve', $company) }}" method="POST" style="display: inline;">
							@csrf
							<button type="submit" class="e-button">Approve Company</button>
						</form>
						<form action="{{ route('admin.companies.reject', $company) }}" method="POST" style="display: inline;" class="ml-10">
							@csrf
							<button type="submit" class="e-button e-button--red">Reject Company</button>
						</form>
						@endif

						@if($company->isApproved())
						<form action="{{ route('admin.companies.toggle-active', $company) }}" method="POST" style="display: inline;" class="{{ $company->isPendingApproval() ? 'mt-20' : '' }}">
							@csrf
							<button type="submit" class="e-button {{ $company->is_active ? 'e-button--red' : '' }}">
								{{ $company->is_active ? 'Deactivate Company' : 'Activate Company' }}
							</button>
						</form>
						@endif
					</div>
				</div>

			</div>
			<div class="l-widget-grid__right">

				{{-- Statistics --}}
				<div class="c-widget-stats e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Statistics</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						<ul class="c-widget-stats__list">
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Services</span>
								<span class="c-widget-stats__item-data">{{ $company->services->count() }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Customers</span>
								<span class="c-widget-stats__item-data">{{ $company->customers->count() }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Offers</span>
								<span class="c-widget-stats__item-data">{{ $company->offers->count() }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Invoices</span>
								<span class="c-widget-stats__item-data">{{ $company->invoices->count() }}</span>
							</li>
						</ul>
					</div>
				</div>

			</div>
		</div>

		{{-- Company Services --}}
		<div class="e-widget mt-30">
			<div class="e-widget__head">
				<h2 class="e-widget__title">Services ({{ $company->services->count() }})</h2>
			</div>
			<div class="e-widget__content">
				@if($company->services->count() > 0)
				<div class="c-table">
					<div class="c-table__wrap">
						<div class="c-table__thead">
							<div class="c-table__thead-tr">
								<div class="c-table__thead-td">Name</div>
								<div class="c-table__thead-td">Price</div>
								<div class="c-table__thead-td">Status</div>
								<div class="c-table__thead-td">Actions</div>
							</div>
						</div>
						<div class="c-table__tbody">
							@foreach($company->services as $service)
							<div class="c-table__tr">
								<div class="c-table__td">
									<a href="{{ route('admin.services.show', $service) }}" class="c-table__link">{{ $service->name }}</a>
								</div>
								<div class="c-table__td">
									<p class="c-table__text">€ {{ number_format($service->price, 2, ',', '.') }}</p>
								</div>
								<div class="c-table__td">
									<span class="c-table__badge">{{ $service->statusRelation->name ?? 'N/A' }}</span>
								</div>
								<div class="c-table__td">
									<a href="{{ route('admin.services.show', $service) }}" class="e-button e-button--bordered e-button--small">View</a>
									<a href="{{ route('admin.services.edit', $service) }}" class="e-button e-button--bordered e-button--small">Edit</a>
								</div>
							</div>
							@endforeach
						</div>
					</div>
				</div>
				@else
				<div class="e-widget__empty">
					<p>This company has no services.</p>
				</div>
				@endif
			</div>
		</div>

		{{-- Company Invoices --}}
		<div class="e-widget mt-30">
			<div class="e-widget__head">
				<h2 class="e-widget__title">Recent Invoices ({{ $company->invoices->count() }})</h2>
			</div>
			<div class="e-widget__content">
				@if($company->invoices->count() > 0)
				<div class="c-table">
					<div class="c-table__wrap">
						<div class="c-table__thead">
							<div class="c-table__thead-tr">
								<div class="c-table__thead-td">Invoice #</div>
								<div class="c-table__thead-td">Date</div>
								<div class="c-table__thead-td">Total</div>
								<div class="c-table__thead-td">Status</div>
							</div>
						</div>
						<div class="c-table__tbody">
							@foreach($company->invoices->take(10) as $invoice)
							<div class="c-table__tr">
								<div class="c-table__td">
									<p class="c-table__text">{{ $invoice->invoice_number }}</p>
								</div>
								<div class="c-table__td">
									<p class="c-table__text">{{ $invoice->invoice_date?->format('d M Y') ?? 'N/A' }}</p>
								</div>
								<div class="c-table__td">
									<p class="c-table__text">€ {{ number_format($invoice->total, 2, ',', '.') }}</p>
								</div>
								<div class="c-table__td">
									<span class="c-table__badge c-table__badge--{{ strtolower($invoice->statusRelation->name ?? 'draft') }}">
										{{ $invoice->statusRelation->name ?? 'Draft' }}
									</span>
								</div>
							</div>
							@endforeach
						</div>
					</div>
				</div>
				@else
				<div class="e-widget__empty">
					<p>This company has no invoices.</p>
				</div>
				@endif
			</div>
		</div>

	</div>

@endsection
