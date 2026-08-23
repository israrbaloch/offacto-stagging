@extends('app')

@section('title', 'Offers')

@section('content')

	@include('partials.modals.delete-offer')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Offers</h1>
			<a class="e-button" href="{{ route('offers.create') }}">@svg('plus') Add Offer</a>
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
							<span>€ {{ number_format($stats['open'], 2, ',', '.') }}</span> open
						</li>
						<li class="c-stats-summary__list-item">
							<span>€ {{ number_format($stats['accepted'], 2, ',', '.') }}</span> accepted
						</li>
						<li class="c-stats-summary__list-item">
							<span>€ {{ number_format($stats['invoiced'], 2, ',', '.') }}</span> invoiced
						</li>
					</ul>
				</div>
			</div>

			<div class="l-page-header__selection-actions">
				<button class="e-button e-button--bordered e-button--purple-dark">Invoice</button>
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
					@if(session('status') === 'offer-created')
						Offer created successfully.
					@elseif(session('status') === 'offer-updated')
						Offer updated successfully.
					@elseif(session('status') === 'offer-deleted')
						Offer deleted successfully.
					@elseif(session('status') === 'offer-sent')
						Offer sent successfully.
					@endif
				</p>
			</div>
		@endif

		@if(session('error'))
			<div class="e-note e-note--error mb-20">
				<p class="e-note__text">{{ session('error') }}</p>
			</div>
		@endif

		@if($offers->count() > 0)
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
							Offer Number
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Date
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Customer
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Valid Until
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Amount
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Status
						</div>
						<div class="c-table__thead-td">Actions</div>
					</div>
				</div>

				<div class="c-table__tbody">
					@foreach($offers as $offer)
					<div class="c-table__tr">
						<div class="c-table__td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox" value="{{ $offer->id }}"/>
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>
						<div class="c-table__td c-table__td--number">
							<a href="{{ route('offers.show', $offer->id) }}" class="c-table__text">{{ $offer->offer_number ?? '-' }}</a>
						</div>
						<div class="c-table__td c-table__td--date">
							<p class="c-table__text">{{ $offer->offer_date ? $offer->offer_date->format('d-m-Y') : '-' }}</p>
						</div>
						<div class="c-table__td c-table__td--contact">
							<p class="c-table__text">{{ $offer->customer->first_name }} {{ $offer->customer->surname }}</p>
							@if($offer->customer->org_name)
								<p class="c-table__text" style="color: #999; font-size: 1.2rem; margin-top: 0.5rem;">{{ $offer->customer->org_name }}</p>
							@endif
						</div>
						<div class="c-table__td c-table__td--date">
							<p class="c-table__text">{{ $offer->valid_until ? $offer->valid_until->format('d-m-Y') : '-' }}</p>
						</div>
						<div class="c-table__td c-table__td--costs">
							<p class="c-table__text">€ {{ number_format($offer->total, 2, ',', '.') }}</p>
						</div>
						<div class="c-table__td c-table__td--status">
							@if($offer->statusRelation)
								<span class="c-table__badge">{{ $offer->statusRelation->name }}</span>
							@else
								<span class="c-table__badge">-</span>
							@endif
						</div>
						<div class="c-table__td">
							<a href="{{ route('offers.show', $offer->id) }}" class="e-button e-button--bordered e-button--purple-dark e-button--small">View</a>
							<a href="{{ route('offers.edit', $offer->id) }}" class="e-button e-button--bordered e-button--purple-dark e-button--small">Edit</a>
							<button 
								class="e-button e-button--bordered e-button--red e-button--small delete-offer-btn" 
								data-offer-id="{{ $offer->id }}"
								data-offer-number="{{ $offer->offer_number ?? 'N/A' }}">
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
			<p class="e-note__text">No offers found. Click "Add Offer" to create your first offer.</p>
		</div>
		@endif

	</div>

	@push('scripts')
	<script src="{{ asset('js/offers.js') }}?v={{ uniqid() }}"></script>
	@endpush

@endsection
