<div class="e-widget">
	<div class="e-widget__head">
		<h2 class="e-widget__title">Open Offers</h2>
		<div class="c-stats-summary">
			<ul class="c-stats-summary__list">
				<li class="c-stats-summary__list-item">
					<span>€ {{ number_format($stats['openOffersTotal'] ?? 0, 2, ',', '.') }}</span> in open offers
				</li>
			</ul>
		</div>
	</div>
	<div class="e-widget__content">
		
		@if($openOffers->count() > 0)
		<div class="c-table-compact">
			<div class="c-table-compact__table">
				<div class="c-table-compact__thead">
					<div class="c-table-compact__thead-tr">
						<div class="c-table-compact__thead-td">
							Offer Number
						</div>
						<div class="c-table-compact__thead-td hide-viewport-d">
							Date
						</div>
						<div class="c-table-compact__thead-td hide-viewport-m">
							Customer
						</div>
						<div class="c-table-compact__thead-td">
							Amount
						</div>
						<div class="c-table-compact__thead-td hide-viewport-t">
							Status
						</div>
					</div>
				</div>	
				<div class="c-table-compact__tbody">
					@foreach($openOffers as $offer)
					<a href="{{ route('offers.show', $offer->id) }}" class="c-table-compact__row-link">
						<div class="c-table-compact__td">
							{{ $offer->offer_number }}
						</div>
						<div class="c-table-compact__td hide-viewport-d">
							{{ $offer->created_at->format('d-m-Y') }}
						</div>
						<div class="c-table-compact__td hide-viewport-m">
							{{ $offer->customer->first_name ?? '' }} {{ $offer->customer->surname ?? '' }}
						</div>
						<div class="c-table-compact__td c-table-compact__td--nowrap">
							€ {{ number_format($offer->total ?? 0, 2, ',', '.') }}
						</div>
						<div class="c-table-compact__td hide-viewport-t">
							<div class="e-label e-label--{{ strtolower($offer->statusRelation->name ?? 'draft') }}">
								{{ $offer->statusRelation->name ?? 'Draft' }}
							</div>
						</div>
					</a>
					@endforeach
				</div>
			</div>			
		</div>
		@else
		<div class="e-widget__empty">
			<p>No open offers. <a href="{{ route('offers.create') }}">Create your first offer</a></p>
		</div>
		@endif

	</div>
</div>
