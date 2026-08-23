<div class="e-modal e-modal--overflow" modal-id="edit-customer" style="z-index: 10;">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal e-modal__content--large">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<h2 class="e-modal__title">Edit Customer</h2>
				<p class="e-modal__subtitle">Update the customer details below</p>
			</div>

			<div class="e-modal__section">
				<form id="edit-customer-form" class="e-form" method="POST">
					@csrf
					@method('PATCH')
					
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
											id="edit-customer-first-name"
											placeholder="John"
											required 
										/>
									</div>
									<div class="c-customer-form__field">
										<x-form.input 
											name="surname" 
											label="Surname" 
											id="edit-customer-surname"
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
											id="edit-customer-type"
											required
										/>
									</div>
									<div class="c-customer-form__field">
										<x-form.select 
											name="status" 
											label="Status"
											:options="$statuses"
											id="edit-customer-status"
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
											id="edit-customer-org-name"
											placeholder="Company Ltd."
										/>
									</div>
									<div class="c-customer-form__field">
										<x-form.input 
											name="vat_number" 
											label="VAT Number" 
											id="edit-customer-vat-number"
											placeholder="NL123456789B01"
										/>
									</div>
								</div>
								<div class="c-customer-form__row">
									<div class="c-customer-form__field c-customer-form__field--full">
										<x-form.textarea 
											name="office_address" 
											label="Office Address" 
											id="edit-customer-office-address"
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
											id="edit-customer-country-id"
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
											id="edit-customer-email"
											placeholder="john@example.com"
											required 
										/>
									</div>
									<div class="c-customer-form__field">
										<x-form.input 
											name="phone" 
											label="Phone Number" 
											id="edit-customer-phone"
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
											id="edit-customer-notes"
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
						<button type="submit" class="e-button">Update Customer</button>
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
/* Edit customer modal specific width */
[modal-id="edit-customer"] .e-modal__content--large {
	max-width: 680px;
	width: 100%;
}
</style>
@endpush
