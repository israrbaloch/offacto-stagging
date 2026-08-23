<div class="e-modal e-modal--overflow" modal-id="delete-service">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<h2 class="e-modal__title">Delete Service</h2>
			</div>

			<div class="e-modal__section">
				<div class="e-note e-note--error mb-20">
					<p class="e-note__text">
						Are you sure you want to delete the service "<strong id="delete-service-name"></strong>"? 
						This action cannot be undone.
					</p>
				</div>

				<form id="delete-service-form" class="e-form" method="POST">
					@csrf
					@method('DELETE')

					<div class="e-form__submit-wrap mt-20">
						<button type="submit" class="e-form__submit e-button e-button--red">Delete Service</button>
					</div>
				</form>
			</div>

		</div>

		<div class="e-modal__after-modal">
			<p class="e-modal__close-link js-close-modal">Cancel</p>
		</div>

	</div>

	<div class="e-modal__bg js-close-modal"></div>
</div>
