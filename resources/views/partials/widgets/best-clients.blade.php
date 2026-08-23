<div class="c-widget-list e-widget">
	<div class="e-widget__head">
		<h2 class="e-widget__title">Top Paying Customers</h2>
	</div>
	<div class="e-widget__content">
	
		@if($topCustomers->count() > 0)
		<ul class="c-widget-list__list">
			@foreach($topCustomers as $index => $customer)
			<li class="c-widget-list__item">
				<div class="c-widget-list__item-col">
					<p class="c-widget-list__item-number">
						{{ $index + 1 }}
					</p>
					<p class="c-widget-list__item-name">
						{{ $customer->first_name }} {{ $customer->surname }}
						@if($customer->org_name)
							<span style="color: #999; font-size: 1.2rem;">({{ $customer->org_name }})</span>
						@endif
					</p>
				</div>
				<div class="c-widget-list__item-col">
					<p class="c-widget-list__item-desc">
						<span>€ {{ number_format($customer->total_invoiced ?? 0, 2, ',', '.') }}</span> invoiced
					</p>
				</div>
			</li>
			@endforeach
		</ul>
		@else
		<div class="e-widget__empty">
			<p>No customer data yet. Start creating offers to see your top customers.</p>
		</div>
		@endif

	</div>
</div>
