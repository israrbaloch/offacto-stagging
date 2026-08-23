<div class="c-widget-stats e-widget">
	<div class="e-widget__head">
		<h2 class="e-widget__title">Net Result</h2>
		<div class="e-filter-date e-form__select-wrap">
			<select class="e-form__select e-form__select--small">
				<option selected>Current Year</option>
				<option>Current Month</option>
				<option>Current Quarter</option>
				<option>Last Quarter</option>
			</select>
		</div>
	</div>
	<div class="e-widget__content e-widget__content--inline-spacing">
		<div class="c-widget-stats__result">
			<p class="c-widget-stats__result-number">€ {{ number_format($stats['netResult'] ?? 0, 2, ',', '.') }}</p>
			<p class="c-widget-stats__result-note">from {{ $stats['periodStart'] ?? 'January 1' }} to {{ $stats['periodEnd'] ?? 'today' }}</p>
		</div>
		<ul class="c-widget-stats__list">
			<li class="c-widget-stats__item">
				<span class="c-widget-stats__item-subject">Revenue</span>
				<span class="c-widget-stats__item-data">€ {{ number_format($stats['revenue'] ?? 0, 2, ',', '.') }}</span>
			</li>
			<li class="c-widget-stats__item">
				<span class="c-widget-stats__item-subject">Expenses</span>
				<span class="c-widget-stats__item-data">- € {{ number_format($stats['expenses'] ?? 0, 2, ',', '.') }}</span>
			</li>
			<li class="c-widget-stats__item">
				<span class="c-widget-stats__item-subject">Net Result</span>
				<span class="c-widget-stats__item-data">€ {{ number_format($stats['netResult'] ?? 0, 2, ',', '.') }}</span>
			</li>
		</ul>
	</div>
</div>
