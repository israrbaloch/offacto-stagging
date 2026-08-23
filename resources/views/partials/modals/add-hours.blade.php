<div class="e-modal e-modal--overflow e-modal--380" modal-id="add-hours">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">

				<h2 class="e-modal__title">@svg('clock') Uren toevoegen</h2>

			</div>

			<div class="e-modal__section">
				
				<div class="e-form">
					<div class="e-form__field-wrap e-form__field-wrap--multiple-inputs">
						<label class="e-form__label">Starttijd</label>
						<input class="e-form__input e-form__input--time" id="starttime" type="text" value="07:30" /> {{-- DEV Note: current time --}}
						<input class="e-form__input e-form__input--date" id="startdate" type="text" value="05-08-2022"/> {{-- DEV Note: current date --}}
					</div>
					<div class="e-form__field-wrap e-form__field-wrap--multiple-inputs">
						<label class="e-form__label">Eindtijd</label>
						<input class="e-form__input e-form__input--time" id="starttime" type="text" value="07:30" /> {{-- DEV Note: current time --}}
						<input class="e-form__input e-form__input--date" id="startdate" type="text" value="05-08-2022"/> {{-- DEV Note: current date --}}
					</div>
					@include('partials.elements.search-contacts')
					<textarea class=" e-form__textarea" placeholder="Notitie..."></textarea>
					<button class="e-form__submit e-button e-button--full-width">Toevoegen</button>
				</div>

			</div>

		</div>

		<div class="e-modal__after-modal">
			<p class="e-modal__close-link js-close-modal">Annuleren</p>
		</div>

	</div>

	<div class="e-modal__bg js-close-modal"></div>
</div>