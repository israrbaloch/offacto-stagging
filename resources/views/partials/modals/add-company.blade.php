<div class="e-modal e-modal--overflow" modal-id="add-company">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">

				<h2 class="e-modal__title">Bedrijf toevoegen</h2>

				<div class="e-note mt-30 mb-30 mt-20--m mb-20--m">
					<div class="e-note__icon">
						@svg('info')
					</div>
					<p class="e-note__text">Het toevoegen van een extra bedrijf verhoogt je abonnement met <b>€ 9,95</b> excl. per maand.<br/>
						<br />
					Voeg je bedrijf toe vanuit de KVK-database of vul je bedrijfsnaam handmatig in. Wanneer je het bedrijf hebt toegevoegd ontvang je een bevestiging van de abonnementswijziging en kan je de verdere gegevens invullen.</p>
				</div>

				<div class="e-search-contacts e-form__field-wrap e-form__field-wrap--with-icon">
					<input class="e-form__input" type="text" placeholder="Doorzoek de KVK..."/>
					@svg('search')
				</div>
				<div class="e-form__labels-inside">
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="company-name">Bedrijfsnaam</label>
						<input class="e-form__input" id="company-name" type="text" />
					</div>
					<div class="e-form__field-wrap e-form__field-wrap--checkboxes">
						<div class="e-form__multiple-checkboxes">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox" />
								<span class="e-form__checkbox-label"></span>
								<span class="e-form__checkbox-text">Ik ga akkoord met de <a href="#" target="_blank">Algemene voorwaarden</a></span>
							</label>
						</div>
					</div>
				</div>
				
				<div class="e-form__submit-wrap">
					<button class="e-form__submit e-button">Toevoegen</button>
				</div>

			</div>

		</div>

		<div class="e-modal__after-modal">
			<p class="e-modal__close-link js-close-modal">Annuleren</p>
		</div>

	</div>

	<div class="e-modal__bg js-close-modal"></div>
</div>