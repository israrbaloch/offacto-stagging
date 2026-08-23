@extends('layouts.app')

@section('title', 'View Service: ' . $service->name)

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">{{ $service->name }}</h1>
			<span class="c-table__badge">{{ $service->statusRelation->name ?? 'N/A' }}</span>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<a href="{{ route('admin.services.index') }}" class="e-button e-button--bordered">Back to Services</a>
				<a href="{{ route('admin.services.edit', $service) }}" class="e-button">Edit Service</a>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

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

		<div class="l-widget-grid">
			<div class="l-widget-grid__left">

				{{-- Service Details --}}
				<div class="e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Service Details</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						<ul class="c-widget-stats__list">
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Company</span>
								<span class="c-widget-stats__item-data">
									<a href="{{ route('admin.companies.show', $service->company) }}">{{ $service->company->company_name }}</a>
								</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Owner</span>
								<span class="c-widget-stats__item-data">
									<a href="{{ route('admin.users.show', $service->company->user) }}">{{ $service->company->user->name }}</a>
								</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Price</span>
								<span class="c-widget-stats__item-data">€ {{ number_format($service->price, 2, ',', '.') }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Unit</span>
								<span class="c-widget-stats__item-data">{{ $service->unit ?? 'N/A' }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Status</span>
								<span class="c-widget-stats__item-data">{{ $service->statusRelation->name ?? 'N/A' }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Created</span>
								<span class="c-widget-stats__item-data">{{ $service->created_at->format('d M Y H:i') }}</span>
							</li>
						</ul>
						
						@if($service->description)
						<div class="mt-20">
							<h4>Description</h4>
							<p>{{ $service->description }}</p>
						</div>
						@endif
					</div>
				</div>

				{{-- Quick Actions --}}
				<div class="e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Quick Actions</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						@if($service->statusRelation?->name === 'Pending')
						<form action="{{ route('admin.services.approve', $service) }}" method="POST" style="display: inline;">
							@csrf
							<button type="submit" class="e-button">Approve Service</button>
						</form>
						<form action="{{ route('admin.services.reject', $service) }}" method="POST" style="display: inline;" class="ml-10">
							@csrf
							<button type="submit" class="e-button e-button--red">Reject Service</button>
						</form>
						@endif
					</div>
				</div>

			</div>
			<div class="l-widget-grid__right">

				{{-- Usage Statistics --}}
				<div class="c-widget-stats e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Usage Statistics</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						<ul class="c-widget-stats__list">
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Used in Offers</span>
								<span class="c-widget-stats__item-data">{{ $service->offerItems->count() }}</span>
							</li>
						</ul>
					</div>
				</div>

			</div>
		</div>

	</div>

@endsection
