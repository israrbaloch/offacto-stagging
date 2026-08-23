<div class="e-modal e-modal--overflow" modal-id="send-offer">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<h2 class="e-modal__title">Send Offer</h2>
			</div>

			<div class="e-modal__section">
				<form id="send-offer-form" class="e-form" method="POST" action="{{ route('offers.send', $offer->id) }}">
					@csrf
					
					<div class="e-form__labels-inside">
						<x-form.input 
							name="email" 
							label="Email Address" 
							type="email"
							:value="old('email', $offer->customer->email)"
							required
						/>

						<x-form.textarea 
							name="message" 
							label="Message" 
							:value="old('message', 'Dear ' . $offer->customer->first_name . ',

Please find attached our offer #' . $offer->offer_number . '.

Best regards,
' . $offer->company->company_name)"
							rows="6"
						/>
					</div>

					<div class="e-form__submit-wrap mt-20">
						<button type="submit" class="e-form__submit e-button">@svg('send') Send Offer</button>
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
