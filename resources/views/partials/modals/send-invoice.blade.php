<div class="e-modal e-modal--overflow" modal-id="send-invoice">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<h2 class="e-modal__title">Send Invoice</h2>
			</div>

			<div class="e-modal__section">
				<form id="send-invoice-form" class="e-form" method="POST" action="{{ route('invoices.send', $invoice->id) }}">
					@csrf
					
					<div class="e-form__labels-inside">
						<x-form.input 
							name="email" 
							label="Email Address" 
							type="email"
							:value="old('email', $invoice->customer->email)"
							required
						/>

						<x-form.textarea 
							name="message" 
							label="Message" 
							:value="old('message', 'Dear ' . $invoice->customer->first_name . ',

Please find attached invoice #' . $invoice->invoice_number . ' for your review.

Amount Due: € ' . number_format($invoice->amount_due, 2, ',', '.') . '
Due Date: ' . ($invoice->due_date ? $invoice->due_date->format('d-m-Y') : 'Upon receipt') . '

Best regards,
' . $invoice->company->company_name)"
							rows="8"
						/>

						<div class="e-form__field" style="margin-top: 1.5rem;">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox" name="attach_ubl" value="1" />
								<span class="e-form__checkbox-label"></span>
								<span class="e-form__checkbox-text">Attach UBL/Peppol XML file</span>
							</label>
						</div>

						<div class="e-form__field" style="margin-top: 1rem;">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox" name="cc_company" value="1" />
								<span class="e-form__checkbox-label"></span>
								<span class="e-form__checkbox-text">Send copy to company email</span>
							</label>
						</div>
					</div>

					<div class="e-form__submit-wrap mt-20">
						<button type="submit" class="e-form__submit e-button">@svg('send') Send Invoice</button>
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
