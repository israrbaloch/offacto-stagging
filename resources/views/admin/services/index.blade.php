@extends('layouts.app')

@section('title', 'Manage Services')

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Manage Services</h1>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<div class="c-stats-summary">
					<ul class="c-stats-summary__list">
						<li class="c-stats-summary__list-item">{{ $services->total() }} services</li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing l-page-content--has-table">

		@if(session('status'))
			<div class="e-note e-note--success mb-20">
				<p class="e-note__text">
					@if(session('status') === 'service-updated')
						Service updated successfully.
					@elseif(session('status') === 'service-approved')
						Service approved successfully.
					@elseif(session('status') === 'service-rejected')
						Service rejected successfully.
					@endif
				</p>
			</div>
		@endif

		@if(session('error'))
			<div class="e-note e-note--error mb-20">
				<p class="e-note__text">{{ session('error') }}</p>
			</div>
		@endif

		@if($services->count() > 0)
		<div class="c-table">
			<div class="c-table__wrap">
				<div class="c-table__thead">
					<div class="c-table__thead-tr">
						<div class="c-table__thead-td">Service Name</div>
						<div class="c-table__thead-td">Company</div>
						<div class="c-table__thead-td">Price</div>
						<div class="c-table__thead-td">Status</div>
						<div class="c-table__thead-td">Actions</div>
					</div>
				</div>

				<div class="c-table__tbody">
					@foreach($services as $service)
					<div class="c-table__tr">
						<div class="c-table__td">
							<a href="{{ route('admin.services.show', $service) }}" class="c-table__link">{{ $service->name }}</a>
						</div>
						<div class="c-table__td">
							<a href="{{ route('admin.companies.show', $service->company) }}" class="c-table__link">{{ $service->company->company_name }}</a>
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
							@if($service->statusRelation?->name === 'Pending')
							<form action="{{ route('admin.services.approve', $service) }}" method="POST" style="display: inline;">
								@csrf
								<button type="submit" class="e-button e-button--bordered e-button--small">Approve</button>
							</form>
							@endif
						</div>
					</div>
					@endforeach
				</div>
			</div>
		</div>

		{{-- Pagination --}}
		<div class="c-pagination">
			{{ $services->links() }}
		</div>
		@else
		<div class="e-note">
			<p class="e-note__text">No services found matching your criteria.</p>
		</div>
		@endif

	</div>

@endsection
