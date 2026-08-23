<div class="e-modal e-modal--overflow" modal-id="record-payment">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<h2 class="e-modal__title">Record Payment</h2>
			</div>

			<div class="e-modal__section">
				<div class="c-payment-summary">
					<div class="c-payment-summary__row">
						<span>Invoice Total:</span>
						<span>€ {{ number_format($invoice->total, 2, ',', '.') }}</span>
					</div>
					<div class="c-payment-summary__row">
						<span>Already Paid:</span>
						<span>€ {{ number_format($invoice->amount_paid, 2, ',', '.') }}</span>
					</div>
					<div class="c-payment-summary__row c-payment-summary__row--due">
						<span>Amount Due:</span>
						<span>€ {{ number_format($invoice->amount_due, 2, ',', '.') }}</span>
					</div>
				</div>

				<form id="record-payment-form" class="e-form" method="POST" action="{{ route('invoices.payment', $invoice->id) }}">
					@csrf
					
					<div class="e-form__labels-inside">
						<x-form.input 
							name="amount" 
							label="Payment Amount (€)" 
							type="number"
							step="0.01"
							min="0.01"
							:value="old('amount', $invoice->amount_due)"
							required
						/>

						<x-form.input 
							name="payment_date" 
							label="Payment Date" 
							type="date"
							:value="old('payment_date', now()->format('Y-m-d'))"
							required
						/>

						<x-form.select 
							name="payment_method" 
							label="Payment Method"
							:options="$paymentMethods"
							:value="old('payment_method', 'bank_transfer')"
							placeholder="Select payment method"
						/>

						<x-form.input 
							name="reference" 
							label="Reference / Transaction ID" 
							type="text"
							:value="old('reference')"
							placeholder="e.g., Bank transaction reference"
						/>

						<x-form.textarea 
							name="notes" 
							label="Notes (optional)" 
							:value="old('notes')"
							placeholder="Any additional notes about this payment"
							rows="3"
						/>
					</div>

					<div class="e-form__submit-wrap mt-20">
						<button type="submit" class="e-form__submit e-button e-button--green">Record Payment</button>
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

<style>
	.c-payment-summary {
		background: #f5f5f5;
		border-radius: 0.6rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.c-payment-summary__row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		font-size: 1.4rem;
	}

	.c-payment-summary__row--due {
		border-top: 1px solid #E2E2E2;
		margin-top: 0.5rem;
		padding-top: 1rem;
		font-weight: 600;
		font-size: 1.5rem;
		color: #7b0033;
	}

	.e-button--green {
		background-color: #2e7d32 !important;
		border-color: #2e7d32 !important;
		color: white !important;
	}

	.e-button--green:hover {
		background-color: #1b5e20 !important;
		border-color: #1b5e20 !important;
	}
</style>
