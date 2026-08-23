<section class="c-harmonica js-harmonica"> {{-- DEV Note: If trial is expired. Add class 'e-trial-expired' and remove class 'js-harmonica' --}}

	<div class="c-harmonica__heading">
		<div class="c-harmonica__heading-icon">
			@svg('arrow-down')
		</div>
		<h2 class="c-harmonica__heading-title">Huisstijl & Template instellingen</h2>
	</div>

	<div class="c-harmonica__content">

		<div class="l-grid l-grid--colx2">

			<div class="l-grid__col e-form">

				<div class="c-logo-upload">
					<div class="c-logo-upload__image">
						<img src="/images/no-image.svg" />
					</div>
					<div class="c-logo-upload__content">
						<h3 class="c-logo-upload__title e-form__title">Logo</h3>
						<h3 class="c-logo-upload__desc e-form__desc">Aanbevolen formaat 300x300 pixels, .jpg of .png</h3>

						<div class="c-logo-upload__button-area">
							<input class="c-logo-upload__button-input" type="file" name="incoming-pdf" id="incoming-pdf" required="required" multiple="multiple"/>
							<div class="c-logo-upload__button e-button e-button--bordered e-button--purple-dark">
								<div class="c-logo-upload__button-text-selected">Upload bestand</div>
								<div class="c-logo-upload__button-text-default">Selecteer een bestand</div>
							</div>
						</div>
						
					</div>
				</div>

				<h3 class="e-form__title">Huisstijl kleuren</h3>
				<h3 class="e-form__desc">De primaire kleur is de steunkleur van uw bedrijf. Laat de secondaire kleur op grijs staan of kies een andere donkere kleur. Om het resultaat te zien klikt u op de template voorbeelden.</h3>
				<div class="e-form__labels-inside">
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="color-primary">Primair</label>
						<span class="e-form__input-color-sample" style="background-color: #FE835C;"></span>
						<input class="e-form__input" id="color-primary" type="text" value="#FE835C" />
					</div>
					<div class="e-form__field-wrap">
						<label class="e-form__label" for="color-secondary">Secundair</label>
						<span class="e-form__input-color-sample" style="background-color: #454545;"></span>
						<input class="e-form__input" id="color-secondary" type="text" value="#454545"/>
					</div>
				</div>
			</div>

			<div class="l-grid__col e-form">
				<h3 class="e-form__title">Templates</h3>
				<div class="e-form__labels-inside">
					<div class="e-form__field-wrap">
						<label class="e-form__label">Offerte template</label>
						<div class="e-form__select-wrap">
							<select class="e-form__select">
								<option>Template 1</option>
								<option>Template 2</option>
								<option>Template 3</option>
							</select>
						</div>
					</div>
					<div class="e-form__field-wrap">
						<button class="e-button">Voorbeeld</button>
					</div>
					<div class="e-form__field-wrap mt-20">
						<label class="e-form__label">Factuur template</label>
						<div class="e-form__select-wrap">
							<select class="e-form__select">
								<option>Template 1</option>
								<option>Template 2</option>
								<option>Template 3</option>
							</select>
						</div>
					</div>
					<div class="e-form__field-wrap">
						<button class="e-button">Voorbeeld</button>
					</div>
				</div>
			</div>

		</div>

		<button class="e-button mt-20">Wijzigingen opslaan</button>

	</div>
</section>