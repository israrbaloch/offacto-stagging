<div class="c-timer">
	<div class="c-timer__icon">
		@svg('clock')
	</div>
	<div class="c-timer__time-wrap">
		<p class="c-timer__time">00:00:00</p>
		<p class="c-timer__contact">Select a contact</p>
	</div>
	<div class="c-timer__play">
		@svg('play')
	</div>
	<div class="c-timer__popover e-popover">
		<div class="c-timer__form e-form">
			<div class="c-timer__form-field-wrap e-form__field-wrap">
				<label class="e-form__label">Start time:</label>
				<input class="c-timer__time-input e-form__input e-form__input--small" type="text" value="09:14" placeholder="00:00"/>
			</div>
			<div class="c-timer__form-field-wrap">
				@include('partials.elements.search-contacts-small')
			</div>
			<div class="c-timer__form-field-wrap e-form__field-wrap e-form__field-wrap--with-icon e-form__field-wrap--small">
				<textarea class="c-timer__note-textarea e-form__textarea e-form__textarea--small" placeholder="Note"></textarea>
			</div>
			<div class="c-timer__form-field-wrap e-form__field-wrap">
				<button class="c-timer__start-submit e-form__submit"/>
					@svg('play') Start timer
				</button>
			</div>
		</div>
		<div class="c-timer__manual-link" open-modal-id="add-hours">Add hours manually</div>
	</div>
</div>