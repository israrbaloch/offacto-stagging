@extends('app')

@section('title', 'Customers')

@section('content')

	@include('partials.modals.add-customer', ['statuses' => $statuses, 'countries' => $countries])
	@include('partials.modals.edit-customer', ['statuses' => $statuses, 'countries' => $countries])
	@include('partials.modals.delete-customer')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Customers</h1>
			<a class="e-button" href="#" open-modal-id="add-customer">@svg('plus') Add Customer</a>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		@if(session('status'))
			<div class="e-note e-note--success mb-20">
				<p class="e-note__text">
					@if(session('status') === 'customer-created')
						Customer created successfully.
					@elseif(session('status') === 'customer-updated')
						Customer updated successfully.
					@elseif(session('status') === 'customer-deleted')
						Customer deleted successfully.
					@endif
				</p>
			</div>
		@endif

		@if(session('error'))
			<div class="e-note e-note--error mb-20">
				<p class="e-note__text">{{ session('error') }}</p>
			</div>
		@endif

		@if($customers->count() > 0)
		<div class="c-table">
			<div class="c-table__wrap">
				<div class="c-table__thead">
					<div class="c-table__thead-tr">
						<div class="c-table__thead-td">Name</div>
						<div class="c-table__thead-td">Type</div>
						<div class="c-table__thead-td">Email</div>
						<div class="c-table__thead-td">Phone</div>
						<div class="c-table__thead-td">Status</div>
						<div class="c-table__thead-td">Actions</div>
					</div>
				</div>
				<div class="c-table__tbody">
					@foreach($customers as $customer)
					<div class="c-table__tr">
						<div class="c-table__td">
							<p class="c-table__text">{{ $customer->first_name }} {{ $customer->surname }}</p>
							@if($customer->org_name)
								<p class="c-table__text" style="color: #999; font-size: 1.2rem; margin-top: 0.5rem;">{{ $customer->org_name }}</p>
							@endif
						</div>
						<div class="c-table__td">
							<span class="c-table__badge">{{ ucfirst($customer->type) }}</span>
						</div>
						<div class="c-table__td">
							<p class="c-table__text">{{ $customer->email }}</p>
						</div>
						<div class="c-table__td">
							<p class="c-table__text">{{ $customer->phone ?? '-' }}</p>
						</div>
						<div class="c-table__td">
							@if($customer->statusRelation)
								<span class="c-table__badge">{{ $customer->statusRelation->name }}</span>
							@else
								<span class="c-table__badge">-</span>
							@endif
						</div>
						<div class="c-table__td">
							<button 
								class="e-button e-button--bordered e-button--purple-dark edit-customer-btn" 
								data-customer-id="{{ $customer->id }}"
								data-customer-first-name="{{ $customer->first_name }}"
								data-customer-surname="{{ $customer->surname }}"
								data-customer-type="{{ $customer->type }}"
								data-customer-country-id="{{ $customer->country_id }}"
								data-customer-vat-number="{{ $customer->vat_number ?? '' }}"
								data-customer-org-name="{{ $customer->org_name ?? '' }}"
								data-customer-office-address="{{ $customer->office_address ?? '' }}"
								data-customer-email="{{ $customer->email }}"
								data-customer-phone="{{ $customer->phone ?? '' }}"
								data-customer-notes="{{ $customer->notes ?? '' }}"
								data-customer-status="{{ $customer->status }}">
								Edit
							</button>
							<button 
								class="e-button e-button--bordered e-button--red delete-customer-btn" 
								data-customer-id="{{ $customer->id }}"
								data-customer-name="{{ $customer->first_name }} {{ $customer->surname }}">
								Delete
							</button>
						</div>
					</div>
					@endforeach
				</div>
			</div>
		</div>
		@else
		<div class="e-note e-note--info">
			<p class="e-note__text">No customers found. Click "Add Customer" to create your first customer.</p>
		</div>
		@endif

	</div>

	@push('scripts')
	<script src="{{ asset('js/customers.js') }}?v={{ uniqid() }}"></script>
	<script>
		// Ensure add customer modal opens properly
		(function() {
			function initAddCustomerModal() {
				const addButton = document.querySelector('[open-modal-id="add-customer"]');
				if (addButton) {
					addButton.addEventListener('click', function(e) {
						e.preventDefault();
						e.stopPropagation();
						const modal = document.querySelector('[modal-id="add-customer"]');
						if (modal) {
							modal.classList.add('e-modal--open');
							document.body.classList.add('body--no-scroll');
							
							// Focus on first input
							const firstInput = modal.querySelector('.e-form__input');
							if (firstInput) {
								setTimeout(() => {
									firstInput.focus();
								}, 100);
							}
						}
					});
				}
			}
			
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', initAddCustomerModal);
			} else {
				initAddCustomerModal();
			}
		})();
	</script>
	@endpush

@endsection
