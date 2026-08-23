<div class="e-modal e-modal--overflow" modal-id="add-incoming">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<h2 class="e-modal__title">Inkomend toevoegen</h2>
			</div>
			

			<div class="e-modal__section e-modal__section--bordered"> {{-- DEV NOTE: If file is uploaded and scanned, add the classes 'e-modal__section--harmonica js-harmonica-modal' --}}
				
				<h3 class="e-modal__section-title">Bestand</h3>

				<div class="e-modal__section-content">

					{{-- DEV NOTE: Hide after the file is uploaded and scanned --}}
					<div class="e-note mb-20">
						<div class="e-note__icon">
							@svg('info')
						</div>
						<p class="e-note__text">Upload een PDF bestand. Offacto zal het bestand uitlezen en probeert de gegevens automatisch in te vullen.</p>
					</div>

					<div class="e-form__upload-area">
						<input class="e-form__upload-area-input" type="file" name="incoming-pdf" id="incoming-pdf" required="required" multiple="multiple"/>
						<div class="e-form__upload-area-text">
							<div class="e-form__upload-area-text-uploading">Uploading...</div>
							<div class="e-form__upload-area-text-default">Upload PDF bestand</div>
						</div>
					</div>
					{{-- END DEV NOTE --}}
					

					{{-- DEV NOTE: Show after the file is uploaded and scanned
					<div class="e-form__uploaded-files">
						<img src="/images/file-example.png" />
						<div class="e-form__uploaded-files-buttons">
							<button class="e-button e-button--purple-dark e-button--bordered">Downloaden</button>
							<button class="e-button e-button--purple-dark e-button--bordered">Verwijderen</button>
						</div>
					</div>
					--}}

				</div>

				{{-- DEV NOTE: Show after the file is uploaded and scanned
				<div class="e-note mt-20">
					<div class="e-note__icon">
						@svg('info')
					</div>
					<p class="e-note__text">Het bestand is succesvol uitgelezen en de gegevens zijn automatisch ingevuld. Selecteer het contact en controleer de gegevens indien nodig.</p>
				</div>
				--}}

			</div>

			<div class="e-modal__section e-modal__section--bordered">
				<h3 class="e-modal__section-title">Contact</h3>
				<div class="e-search-contacts e-form__field-wrap e-form__field-wrap--with-icon">
					<input class="e-form__input" type="text" placeholder="Doorzoek de KVK..."/>
					@svg('search')
				</div>
			</div>

			<div class="e-modal__section e-modal__section--bordered">
				<h3 class="e-modal__section-title">Factuurgegevens</h3>
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

			<div class="e-modal__section e-modal__section--bordered">
				<h3 class="e-modal__section-title">Bedrag</h3>
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