<div class="e-filter-date e-form__select-wrap">
	<select class="e-form__select e-form__select--small" name="date_filter" onchange="applyDateFilter(this.value)">
		<option value="" {{ !request('date_filter') ? 'selected' : '' }}>All time</option>
		<option value="current_year" {{ request('date_filter') == 'current_year' ? 'selected' : '' }}>Current year</option>
		<option value="current_month" {{ request('date_filter') == 'current_month' ? 'selected' : '' }}>Current month</option>
		<option value="current_quarter" {{ request('date_filter') == 'current_quarter' ? 'selected' : '' }}>Current quarter</option>
		<option value="last_quarter" {{ request('date_filter') == 'last_quarter' ? 'selected' : '' }}>Last quarter</option>
		<option value="last_year" {{ request('date_filter') == 'last_year' ? 'selected' : '' }}>Last year</option>
		@for($year = date('Y'); $year >= date('Y') - 5; $year--)
			<option value="{{ $year }}" {{ request('date_filter') == $year ? 'selected' : '' }}>{{ $year }}</option>
		@endfor
	</select>
</div>

<script>
function applyDateFilter(value) {
	const url = new URL(window.location.href);
	if (value) {
		url.searchParams.set('date_filter', value);
	} else {
		url.searchParams.delete('date_filter');
	}
	// Preserve search parameter
	const search = document.querySelector('input[name="search"]');
	if (search && search.value) {
		url.searchParams.set('search', search.value);
	}
	window.location.href = url.toString();
}
</script>
