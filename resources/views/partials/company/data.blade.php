<section class="c-harmonica js-harmonica"> {{-- DEV Note: If trial is expired. Add class 'e-trial-expired' and remove class 'js-harmonica' --}}

	<div class="c-harmonica__heading">
		<div class="c-harmonica__heading-icon">
			@svg('arrow-down')
		</div>
		<h2 class="c-harmonica__heading-title">Bedrijfsgegevens</h2>
	</div>

	<div class="c-harmonica__content">

		<div class="l-grid l-grid--colx2">

			<div class="l-grid__col e-form">
				<h3 class="e-form__title">Bedrijfsgegevens</h3>
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
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="website">Website</label>
						<input class="e-form__input" id="website" type="text" />
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

			<div class="l-grid__col e-form">
				<h3 class="e-form__title">Adresgegevens</h3>
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

		</div>

		<button class="e-button mt-20">Wijzigingen opslaan</button>

	</div>
</section>