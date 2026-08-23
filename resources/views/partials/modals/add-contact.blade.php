<div class="e-modal e-modal--overflow" modal-id="add-contact">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<h2 class="e-modal__title">Contact toevoegen</h2>
			</div>

			<div class="e-modal__section">
				<div class="e-search-contacts e-form__field-wrap e-form__field-wrap--with-icon">
					<input class="e-form__input" type="text" placeholder="Doorzoek de KVK..."/>
					@svg('search')
				</div>
			</div>

			<div class="e-modal__section e-modal__section--bordered">
				<h3 class="e-modal__section-title">Bedrijfsgegevens</h3>
				<div class="e-form__labels-inside">
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="company-name">Bedrijfsnaam</label>
						<input class="e-form__input" id="company-name" type="text" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="kvk">KVK</label>
						<input class="e-form__input" id="kvk" type="text" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="btw-id">BTW-id</label>
						<input class="e-form__input" id="btw-id" type="text" />
					</div>
				</div>
			</div>

			<div class="e-modal__section e-modal__section--bordered">
				<h3 class="e-modal__section-title">Contactgegevens</h3>
				<div class="e-form__labels-inside">
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="name">Voornaam</label>
						<input class="e-form__input" id="name" type="text" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="surname">Achternaam</label>
						<input class="e-form__input" id="surname" type="text" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="phone">Telefoon</label>
						<input class="e-form__input" id="phone" type="text" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="mail">E-mail</label>
						<input class="e-form__input" id="mail" type="text" placeholder="uw@email.nl"/>
					</div>
				</div>
			</div>

			<div class="e-modal__section e-modal__section--bordered">
				<h3 class="e-modal__section-title">Betaalgegevens</h3>
				<div class="e-form__labels-inside">
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="iban">IBAN</label>
						<input class="e-form__input" id="iban" type="text" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="iban-person">Ten name van</label>
						<input class="e-form__input" id="iban-person" type="text" />
					</div>
				</div>
			</div>

			<div class="e-modal__section e-modal__section--bordered">
				<h3 class="e-modal__section-title">Adresgegevens</h3>
				<div class="e-form__labels-inside">
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="address">Adres</label>
						<input class="e-form__input" id="address" type="text" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="zipcode" >Postcode</label>
						<input class="e-form__input" id="zipcode" type="text" placeholder="0000 AA" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="city">Plaats</label>
						<input class="e-form__input" id="city" type="text" placeholder="uw@email.nl"/>
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label">Land</label>
						<div class="e-form__select-wrap">
							<select class="e-form__select">
								<option>Nederland</option>
								<option>België</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			<div class="e-modal__section e-modal__section--bordered">
				<h3 class="e-modal__section-title">Template instellingen</h3>
				<div class="e-form__labels-inside">
					<div class="e-form__field-wrap">
						<label class="e-form__label">Offerte</label>
						<div class="e-form__select-wrap">
							<select class="e-form__select">
								<option>Template 1</option>
								<option>Template 2</option>
								<option>Template 3</option>
							</select>
						</div>
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label">Factuur</label>
						<div class="e-form__select-wrap">
							<select class="e-form__select">
								<option>Template 1</option>
								<option>Template 2</option>
								<option>Template 3</option>
							</select>
						</div>
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label">Offerte e-mail</label>
						<div class="e-form__select-wrap">
							<select class="e-form__select">
								<option>Template 1</option>
								<option>Template 2</option>
								<option>Template 3</option>
							</select>
						</div>
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label">Factuur e-mail</label>
						<div class="e-form__select-wrap">
							<select class="e-form__select">
								<option>Template 1</option>
								<option>Template 2</option>
								<option>Template 3</option>
							</select>
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