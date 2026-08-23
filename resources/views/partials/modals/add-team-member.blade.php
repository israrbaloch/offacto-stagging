<div class="e-modal" modal-id="add-team-member">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<h2 class="e-modal__title">Teamlid toevoegen</h2>
			</div>

			<div class="e-modal__section">

				<div class="e-form">
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
							<label class="e-form__label" for="email">E-mail</label>
							<input class="e-form__input" id="email" type="text" placeholder="uw@email.nl"/>
						</div>
						<div class="e-form__field-wrap">
							<label class="e-form__label"> Rol</label>
							<div class="e-form__select-wrap">
								<select class="e-form__select">
									<option>Teamlid</option>
									<option>Admin</option>
								</select>
							</div>
						</div>
						<div class="e-form__field-wrap e-form__field-wrap--checkboxes">
							<label class="e-form__label">Bedrijven</label>
							<div class="e-form__multiple-checkboxes">
								<label class="e-form__checkbox-wrap">
									<input class="e-form__checkbox" type="checkbox" checked/>
									<span class="e-form__checkbox-label"></span>
									<span class="e-form__checkbox-text">Revaio</span>
								</label>
								<label class="e-form__checkbox-wrap">
									<input class="e-form__checkbox" type="checkbox" />
									<span class="e-form__checkbox-label"></span>
									<span class="e-form__checkbox-text">Offacto</span>
								</label>
							</div>
						</div>
					</div>
					<div class="e-form__submit-wrap">
						<button class="e-form__submit e-button">Toevoegen</button>
					</div>
				</div>

			</div>

		</div>

		<div class="e-modal__after-modal">
			<p class="e-modal__close-link js-close-modal">Annuleren</p>
		</div>

	</div>

	<div class="e-modal__bg js-close-modal"></div>
</div>