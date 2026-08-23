<div class="c-widget-yearly e-widget">
	<div class="c-widget-yearly__head">
		<h1 class="c-widget-yearly__title"><span>2022</span> Jaaroverzicht</h1>
	</div>
	<div class="c-widget-yearly__content">

		<div class="e-horizontal-scroll">
			<div class="e-horizontal-scroll__inner">
				<ul class="c-widget-yearly__months">

					<li class="c-widget-yearly__subjects c-widget-yearly__month">
						<div class="c-widget-yearly__month-bar">
						</div>
						<p class="c-widget-yearly__month-price">Omzet</p>
						<p class="c-widget-yearly__month-price">- Uitgaven</p>
						<p class="c-widget-yearly__month-price">Netto</p>
					</li>

					@foreach(range(1, 4) as $i)
					<li class="c-widget-yearly__month">
						<div class="c-widget-yearly__month-bar">
							<p class="c-widget-yearly__month-bar-name">Jan</p>

							{{-- DEV NOTE: The month with the highest earnings is 100%  --}}
							<div class="c-widget-yearly__month-bar-bg" style="height: 100%;"></div>
						</div>
						<p class="c-widget-yearly__month-price">€ 5700</p>
						<p class="c-widget-yearly__month-price">€ 5700</p>
						<p class="c-widget-yearly__month-price"><span>€ 5700</span></p>
					</li>
					<li class="c-widget-yearly__month">
						<div class="c-widget-yearly__month-bar">
							<p class="c-widget-yearly__month-bar-name">Feb</p>

							{{-- DEV NOTE: The month with the highest earnings is 100%  --}}
							<div class="c-widget-yearly__month-bar-bg" style="height: 25%;"></div>
						</div>
						<p class="c-widget-yearly__month-price">€ 1300</p>
						<p class="c-widget-yearly__month-price">€ 1300</p>
						<p class="c-widget-yearly__month-price"><span>€ 0</span></p>
					</li>
					<li class="c-widget-yearly__month">
						<div class="c-widget-yearly__month-bar">
							<p class="c-widget-yearly__month-bar-name">Mar</p>

							{{-- DEV NOTE: The month with the highest earnings is 100%  --}}
							<div class="c-widget-yearly__month-bar-bg" style="height: 50%;"></div>
						</div>
						<p class="c-widget-yearly__month-price">€ 2600</p>
						<p class="c-widget-yearly__month-price">€ 2600</p>
						<p class="c-widget-yearly__month-price"><span>€ 2600</span></p>
					</li>
					@endforeach

				</ul>
			</div>
		</div>

	</div>
</div>