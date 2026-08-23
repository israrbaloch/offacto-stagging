<form action="" method="GET" class="e-search-contacts e-form__field-wrap e-form__field-wrap--small e-form__field-wrap--with-icon">
	<input 
		class="e-form__input e-form__input--small" 
		type="text" 
		name="search"
		placeholder="Select a contact"
		value="{{ request('search') }}"
	/>
	@svg('search')
	{{-- Preserve other filters --}}
	@if(request('date_filter'))
		<input type="hidden" name="date_filter" value="{{ request('date_filter') }}">
	@endif
</form>
