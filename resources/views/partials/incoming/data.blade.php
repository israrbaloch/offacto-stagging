<section class="c-harmonica c-harmonica--always-open">

	<div class="c-harmonica__heading">
		<div class="c-harmonica__heading-icon">
			@svg('arrow-down')
		</div>
		<h2 class="c-harmonica__heading-title">Gegevens</h2>
	</div>

	<div class="c-harmonica__content">

		<div class="l-grid l-grid--colx2">

			<div class="l-grid__col e-form">
				<h3 class="e-form__title">Factuurgegevens</h3>
				<div class="e-form__labels-inside">
					<div class="e-form__field-wrap">
						<label class="e-form__label">Type</label>
						<div class="e-form__select-wrap">
							<select class="e-form__select">
								<option>Inkoopfactuur</option>
								<option>Bon</option>
							</select>
						</div>
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="incoming-id">Factuur kenmerk</label>
						<input class="e-form__input" id="incoming-id" type="text" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="incoming-date">Factuurdatum</label>
						<input class="e-form__input" id="incoming-date" type="text" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="incoming-end-date">Vervaldatum</label>
						<input class="e-form__input" id="incoming-end-date" type="text" />
					</div>
				</div>
			</div>

			<div class="l-grid__col e-form">
				<h3 class="e-form__title">Contact</h3>
				<p class="e-form__desc">We zoeken eerst door je contacten. Kunnen we niks vinden? Dan zoeken we in de KVK database.</p>
				@include('partials.elements.search-contacts')
        		{{-- @include('partials.elements.search-contacts-results') --}}
				<button class="e-button mt-20">Wijzigingen opslaan</button>
			</div>
			
			<div class="l-grid__col e-form">
				<h3 class="e-form__title">Bedrag</h3>
				<div class="e-form__labels-inside">
					<div class="e-form__field-wrap">
						<label class="e-form__label">BTW</label>
						<div class="e-form__select-wrap">
							<select class="e-form__select">
								<option>Inclusief 21% BTW</option>
								<option>Exclusief 21% BTW</option>
								<option>Inclusief 9% BTW</option>
								<option>Exclusief 9% BTW</option>
								<option>0% BTW</option>
							</select>
						</div>
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="incoming-price">Bedrag</label>
						<input class="e-form__input" id="incoming-price" type="text" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="incoming-btw">BTW</label>
						<input class="e-form__input" id="incoming-btw" type="text" />
					</div>
				</div>
			</div>

		</div>

	</div>
</section>