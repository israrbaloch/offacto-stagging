@extends('app')

@section('title', 'Services')

@section('content')

	@include('partials.modals.add-service')
	@include('partials.modals.edit-service')
	@include('partials.modals.delete-service')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Services</h1>
			<a class="e-button" href="#" open-modal-id="add-service">@svg('plus') Add Service</a>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		@if(session('status'))
			<div class="e-note e-note--success mb-20">
				<p class="e-note__text">
					@if(session('status') === 'service-created')
						Service created successfully.
					@elseif(session('status') === 'service-updated')
						Service updated successfully.
					@elseif(session('status') === 'service-deleted')
						Service deleted successfully.
					@endif
				</p>
			</div>
		@endif

		@if(session('error'))
			<div class="e-note e-note--error mb-20">
				<p class="e-note__text">{{ session('error') }}</p>
			</div>
		@endif

		@if($services->count() > 0)
		<div class="c-table">
			<div class="c-table__wrap">
				<div class="c-table__thead">
					<div class="c-table__thead-tr">
						<div class="c-table__thead-td">Name</div>
						<div class="c-table__thead-td">Description</div>
						<div class="c-table__thead-td">Price</div>
						<div class="c-table__thead-td">Unit</div>
						<div class="c-table__thead-td">Status</div>
						<div class="c-table__thead-td">Actions</div>
					</div>
				</div>

				<div class="c-table__tbody">
					@foreach($services as $service)
					<div class="c-table__tr">
						<div class="c-table__td">
							<p class="c-table__text">{{ $service->name }}</p>
						</div>
						<div class="c-table__td">
							<p class="c-table__text">{{ $service->description ?? '-' }}</p>
						</div>
						<div class="c-table__td">
							<p class="c-table__text">€ {{ number_format($service->price, 2, ',', '.') }}</p>
						</div>
						<div class="c-table__td">
							<p class="c-table__text">{{ $service->unit ?? '-' }}</p>
						</div>
						<div class="c-table__td">
							<span class="c-table__badge">{{ $service->statusRelation->name ?? '-' }}</span>
						</div>
						<div class="c-table__td">
							<button class="e-button e-button--bordered e-button--purple-dark edit-service-btn" 
									data-service-id="{{ $service->id }}"
									data-service-name="{{ $service->name }}"
									data-service-description="{{ $service->description ?? '' }}"
									data-service-price="{{ $service->price }}"
									data-service-unit="{{ $service->unit ?? '' }}"
									data-service-status="{{ $service->status }}"
									open-modal-id="edit-service">Edit</button>
							<button class="e-button e-button--bordered e-button--red delete-service-btn" 
									data-service-id="{{ $service->id }}"
									data-service-name="{{ $service->name }}"
									open-modal-id="delete-service">Delete</button>
						</div>
					</div>
					@endforeach
				</div>
			</div>
		</div>
		@else
		<div class="e-note">
			<p class="e-note__text">No services found. Create your first service to get started.</p>
		</div>
		@endif

	</div>

	@push('scripts')
	<script src="{{ asset('js/services.js') }}?v={{ uniqid() }}"></script>
	<script>
		// Ensure add service modal opens properly
		(function() {
			function initAddServiceModal() {
				const addButton = document.querySelector('[open-modal-id="add-service"]');
				if (addButton) {
					addButton.addEventListener('click', function(e) {
						e.preventDefault();
						e.stopPropagation();
						const modal = document.querySelector('[modal-id="add-service"]');
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
				document.addEventListener('DOMContentLoaded', initAddServiceModal);
			} else {
				initAddServiceModal();
			}
		})();
	</script>
	@endpush

@endsection
