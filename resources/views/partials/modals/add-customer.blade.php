<div class="e-modal e-modal--overflow" modal-id="add-customer" style="z-index: 10;">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal e-modal__content--large">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<h2 class="e-modal__title">Add New Customer</h2>
				<p class="e-modal__subtitle">Fill in the customer details below</p>
			</div>

			<div class="e-modal__section">
				<form id="add-customer-form" class="e-form" method="POST" action="{{ route('customers.store') }}">
					@csrf
					
					<div class="c-customer-form">
						{{-- Personal Information Section --}}
						<div class="c-customer-form__section">
							<h3 class="c-customer-form__section-title">
								<span class="c-customer-form__section-icon">@svg('user', 'w-4 h-4')</span>
								Personal Information
							</h3>
							<div class="c-customer-form__grid">
								<div class="c-customer-form__row c-customer-form__row--two-cols">
									<div class="c-customer-form__field">
										<x-form.input 
											name="first_name" 
											label="First Name" 
											:value="old('first_name')"
											placeholder="John"
											required 
										/>
									</div>
									<div class="c-customer-form__field">
										<x-form.input 
											name="surname" 
											label="Surname" 
											:value="old('surname')"
											placeholder="Doe"
											required 
										/>
									</div>
								</div>
								<div class="c-customer-form__row c-customer-form__row--two-cols">
									<div class="c-customer-form__field">
										<x-form.select 
											name="type" 
											label="Customer Type"
											:options="['individual' => 'Individual', 'organization' => 'Organization']"
											:value="old('type', 'individual')"
											required
										/>
									</div>
									<div class="c-customer-form__field">
										<x-form.select 
											name="status" 
											label="Status"
											:options="$statuses"
											:value="old('status')"
											required
										/>
									</div>
								</div>
							</div>
						</div>

						{{-- Organization Details Section --}}
						<div class="c-customer-form__section">
							<h3 class="c-customer-form__section-title">
								<span class="c-customer-form__section-icon">@svg('stats', 'w-4 h-4')</span>
								Organization Details
							</h3>
							<div class="c-customer-form__grid">
								<div class="c-customer-form__row c-customer-form__row--two-cols">
									<div class="c-customer-form__field">
										<x-form.input 
											name="org_name" 
											label="Organization Name" 
											:value="old('org_name')"
											placeholder="Company Ltd."
										/>
									</div>
									<div class="c-customer-form__field">
										<x-form.input 
											name="vat_number" 
											label="VAT Number" 
											:value="old('vat_number')"
											placeholder="NL123456789B01"
										/>
									</div>
								</div>
								<div class="c-customer-form__row">
									<div class="c-customer-form__field c-customer-form__field--full">
										<x-form.textarea 
											name="office_address" 
											label="Office Address" 
											:value="old('office_address')"
											placeholder="Street, City, Postal Code"
											rows="2"
										/>
									</div>
								</div>
								<div class="c-customer-form__row c-customer-form__row--single">
									<div class="c-customer-form__field">
										<x-form.select 
											name="country_id" 
											label="Country"
											:options="$countries"
											:value="old('country_id', 12)"
											required
										/>
									</div>
								</div>
							</div>
						</div>

						{{-- Contact Information Section --}}
						<div class="c-customer-form__section">
							<h3 class="c-customer-form__section-title">
								<span class="c-customer-form__section-icon">@svg('send', 'w-4 h-4')</span>
								Contact Information
							</h3>
							<div class="c-customer-form__grid">
								<div class="c-customer-form__row c-customer-form__row--two-cols">
									<div class="c-customer-form__field">
										<x-form.input 
											name="email" 
											label="Email Address" 
											type="email"
											:value="old('email')"
											placeholder="john@example.com"
											required 
										/>
									</div>
									<div class="c-customer-form__field">
										<x-form.input 
											name="phone" 
											label="Phone Number" 
											:value="old('phone')"
											placeholder="+31 6 12345678"
										/>
									</div>
								</div>
							</div>
						</div>

						{{-- Additional Notes Section --}}
						<div class="c-customer-form__section c-customer-form__section--no-border">
							<h3 class="c-customer-form__section-title">
								<span class="c-customer-form__section-icon">@svg('text', 'w-4 h-4')</span>
								Additional Notes
							</h3>
							<div class="c-customer-form__grid">
								<div class="c-customer-form__row">
									<div class="c-customer-form__field c-customer-form__field--full">
										<x-form.textarea 
											name="notes" 
											label="Notes" 
											:value="old('notes')"
											placeholder="Any additional information about this customer..."
											rows="3"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="c-customer-form__actions">
						<button type="button" class="e-button e-button--bordered js-close-modal">Cancel</button>
						<button type="submit" class="e-button">Create Customer</button>
					</div>
				</form>
			</div>

		</div>

		<div class="e-modal__after-modal">
		</div>

	</div>

	<div class="e-modal__bg js-close-modal"></div>
</div>

@push('styles')
<style>
.c-customer-form {
	display: flex;
	flex-direction: column;
	gap: 0;
}

.c-customer-form__section {
	padding: 20px 0;
	border-bottom: 1px solid #eee;
}

.c-customer-form__section--no-border {
	border-bottom: none;
}

.c-customer-form__section:first-child {
	padding-top: 0;
}

.c-customer-form__section-title {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 14px;
	font-weight: 600;
	color: var(--company-secondary, #333);
	margin-bottom: 16px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.c-customer-form__section-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	background: var(--company-primary, #6366f1);
	border-radius: 6px;
	color: white;
}

.c-customer-form__section-icon svg {
	width: 14px;
	height: 14px;
	fill: white;
}

.c-customer-form__grid {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.c-customer-form__row {
	display: flex;
	gap: 16px;
}

.c-customer-form__row--two-cols {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
}

.c-customer-form__row--single {
	max-width: 50%;
}

.c-customer-form__field {
	flex: 1;
}

.c-customer-form__field--full {
	width: 100%;
}

.c-customer-form__field .e-form__field {
	margin-bottom: 0;
}

.c-customer-form__actions {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding-top: 24px;
	margin-top: 8px;
	border-top: 1px solid #eee;
}

/* Modal subtitle */
.e-modal__subtitle {
	font-size: 14px;
	color: #666;
	margin-top: 4px;
}

/* Ensure modal is wide enough */
[modal-id="add-customer"] .e-modal__content--large {
	max-width: 680px;
	width: 100%;
}

@media (max-width: 640px) {
	.c-customer-form__row--two-cols {
		grid-template-columns: 1fr;
	}
	
	.c-customer-form__row--single {
		max-width: 100%;
	}
}
</style>
@endpush
