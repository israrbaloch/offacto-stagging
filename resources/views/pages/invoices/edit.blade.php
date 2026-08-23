@extends('app')

@section('title', 'Edit Invoice')

@section('content')

	{{-- Services List Modal --}}
	<div class="e-modal" modal-id="select-service">
		<div class="e-modal__bg js-close-modal"></div>
		<div class="e-modal__content e-modal__content--large" style="z-index: 9;">
			<div class="e-modal__header">
				<h2 class="e-modal__title">Select Services</h2>
				<button type="button" class="e-modal__close js-close-modal">@svg('close')</button>
			</div>
			<div class="e-modal__body">
				<div class="c-services-list">
					<div class="c-services-list__items">
						@forelse($services as $service)
							<div class="c-services-list__item" data-service-id="{{ $service->id }}" data-service-name="{{ $service->name }}" data-service-price="{{ $service->price }}" data-service-description="{{ $service->description ?? '' }}">
								<div class="c-services-list__item-info">
									<span class="c-services-list__item-name">{{ $service->name }}</span>
									<span class="c-services-list__item-price">€ {{ number_format($service->price, 2, ',', '.') }}</span>
								</div>
								<div class="c-services-list__item-actions">
									<span class="c-services-list__added-badge" style="display: none;">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
										Added
									</span>
									<input type="number" class="c-services-list__quantity" value="1" min="1" placeholder="Qty">
									<button type="button" class="c-services-list__add-btn" title="Add to invoice">
										@svg('plus')
									</button>
								</div>
							</div>
						@empty
							<div class="c-services-list__empty">
								No services available. <a href="{{ route('services.index') }}">Create services</a> first.
							</div>
						@endforelse
					</div>
					<div class="c-services-list__footer">
						<button type="button" class="e-button js-close-modal">Done</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Edit Invoice #{{ $invoice->invoice_number }}</h1>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<a href="{{ route('invoices.show', $invoice->id) }}" class="e-button e-button--bordered">Cancel</a>
				<button type="submit" form="edit-invoice-form" class="e-button">Save Changes</button>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">
		<form id="edit-invoice-form" class="e-form" method="POST" action="{{ route('invoices.update', $invoice->id) }}">
			@csrf
			@method('PATCH')

			{{-- Section 1: Basic Information --}}
			<x-form.harmonica title="Basic information" subtitle="All basic information about your invoice." class="c-harmonica--is-open">
				<div class="l-grid l-grid--colx2">
					<div class="l-grid__col">
						<div class="e-form__labels-inside">
							<x-form.select 
								name="customer_id" 
								label="Customer"
								:options="$customers"
								:value="old('customer_id', $invoice->customer_id)"
								placeholder="Select a customer"
								required
							/>

							<x-form.select 
								name="status" 
								label="Status"
								:options="$statuses"
								:value="old('status', $invoice->status)"
								required
							/>
						</div>
					</div>

					<div class="l-grid__col">
						<div class="e-form__labels-inside">
							<x-form.input 
								name="invoice_date" 
								label="Invoice Date" 
								type="date"
								:value="old('invoice_date', $invoice->invoice_date ? $invoice->invoice_date->format('Y-m-d') : '')"
							/>

							<x-form.input 
								name="due_date" 
								label="Due Date" 
								type="date"
								:value="old('due_date', $invoice->due_date ? $invoice->due_date->format('Y-m-d') : '')"
							/>
						</div>
					</div>
				</div>
			</x-form.harmonica>

			{{-- Section 2: Assignment/Description --}}
			<x-form.harmonica title="Assignment" subtitle="Briefly describe what your assignment entails.">
				
				<div class="e-form__labels-inside">
					<x-form.textarea 
						name="intro" 
						label="Introduction" 
						:value="old('intro', $invoice->intro)"
						placeholder="Enter the invoice introduction here."
						rows="4"
						required
					/>

					<x-form.textarea 
						name="desc" 
						label="Description" 
						:value="old('desc', $invoice->desc)"
						placeholder="Enter the invoice description here."
						rows="4"
						required
					/>
				</div>
			</x-form.harmonica>

			{{-- Section 3: Invoice Lines/Items --}}
			<x-form.harmonica title="Invoice lines" subtitle="List the products and/or services you are invoicing." class="c-harmonica--is-open">
				
				<div class="c-offer-items">
					{{-- Add Service Button --}}
					<div class="c-offer-items__header">
						<button type="button" class="e-button e-button--bordered e-button--purple-dark" id="open-services-modal-btn">
							@svg('plus') Add Service
						</button>
					</div>

					{{-- Selected Items Table --}}
					<div class="c-offer-items__table-wrap">
						<h4 class="c-offer-items__table-title">Invoice Items</h4>
						<table class="c-offer-items__table" id="items-table">
							<thead>
								<tr>
									<th>Description</th>
									<th>Quantity</th>
									<th>Price (excl. VAT)</th>
									<th>Total</th>
								</tr>
							</thead>
							<tbody id="items-tbody">
								<tr class="c-offer-items__empty-row" id="empty-row">
									<td colspan="4" style="text-align: center; padding: 2rem; color: #999;">
										No items added. Click <strong>"Add Service"</strong> to select services.
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					{{-- Summary Bar --}}
					<div class="c-offer-items__summary">
						<div class="c-offer-items__summary-row c-offer-items__summary-row--subtotal">
							<span class="c-offer-items__summary-label">Subtotal</span>
							<span class="c-offer-items__summary-value" id="subtotal-display">€ 0,00</span>
						</div>
						<div class="c-offer-items__summary-row c-offer-items__summary-row--tax">
							<span class="c-offer-items__summary-label">VAT ({{ $vatRate ?? 21 }}%)</span>
							<span class="c-offer-items__summary-value" id="tax-display">€ 0,00</span>
						</div>
						<div class="c-offer-items__summary-row c-offer-items__summary-row--total">
							<span class="c-offer-items__summary-label">Total</span>
							<span class="c-offer-items__summary-value" id="total-display">€ 0,00</span>
						</div>
					</div>
				</div>
			</x-form.harmonica>

			{{-- Section 4: IP/Copyright Transfer --}}
			<x-form.harmonica title="Intellectual Property" subtitle="Define intellectual property transfer terms for this invoice.">
				<div class="e-form__labels-inside">
					<x-form.select 
						name="ip_transfer_type" 
						label="IP/Copyright Transfer"
						:options="['' => 'No IP terms (standard invoice)'] + $ipTransferTypes"
						:value="old('ip_transfer_type', $invoice->ip_transfer_type)"
					/>
					<p class="e-form__help-text" style="margin-top: 1rem; color: #999; font-size: 1.3rem;">
						Select how intellectual property rights are transferred upon payment.
					</p>
					<div class="ip-terms-preview" id="ip-terms-preview" style="{{ $invoice->ip_transfer_type ? '' : 'display: none;' }}">
						<div class="ip-terms-preview__title">Preview:</div>
						<div class="ip-terms-preview__content" id="ip-terms-content">{{ $invoice->ip_transfer_text }}</div>
					</div>
				</div>
			</x-form.harmonica>

			{{-- Section 5: Notes/Comments --}}
			<x-form.harmonica title="Notes" subtitle="Additional notes for internal use or to show on the invoice.">
				
				<div class="e-form__labels-inside">
					<x-form.textarea 
						name="notes" 
						label="Notes (optional)" 
						:value="old('notes', $invoice->notes)"
						placeholder="Any additional notes about this invoice?"
						rows="4"
					/>
				</div>
			</x-form.harmonica>

		</form>
	</div>

	@push('styles')
	<style>
		/* Same styles as create page */
		.c-harmonica__subtitle {
			color: #666;
			font-size: 1.4rem;
			margin-bottom: 2rem;
			margin-top: -0.5rem;
		}

		.c-offer-items__header {
			margin-bottom: 1.5rem;
		}

		.c-services-list {
			background: #f8f9fa;
			border-radius: 0.8rem;
			padding: 1.5rem;
		}

		.c-services-list__items {
			display: flex;
			flex-direction: column;
			gap: 0.8rem;
			max-height: 400px;
			overflow-y: auto;
		}

		.e-modal__content--large {
			max-width: 600px;
			width: 90%;
		}

		.c-services-list__item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 1rem 1.2rem;
			background: white;
			border-radius: 0.6rem;
			border: 1px solid #E2E2E2;
			transition: all 0.2s ease;
		}

		.c-services-list__item:hover {
			border-color: #4054B2;
			box-shadow: 0 2px 8px rgba(64, 84, 178, 0.1);
		}

		.c-services-list__item-info {
			display: flex;
			flex-direction: column;
			gap: 0.3rem;
		}

		.c-services-list__item-name {
			font-size: 1.4rem;
			font-weight: 500;
			color: #11134E;
		}

		.c-services-list__item-price {
			font-size: 1.3rem;
			color: #666;
		}

		.c-services-list__item-actions {
			display: flex;
			align-items: center;
			gap: 0.8rem;
		}

		.c-services-list__added-badge {
			display: inline-flex;
			align-items: center;
			gap: 0.4rem;
			padding: 0.4rem 0.8rem;
			background: #28a745;
			color: white;
			border-radius: 2rem;
			font-size: 1.2rem;
			font-weight: 500;
			animation: fadeInOut 2s ease-in-out;
		}

		.c-services-list__added-badge svg {
			width: 1.4rem;
			height: 1.4rem;
		}

		@keyframes fadeInOut {
			0% { opacity: 0; transform: scale(0.8); }
			15% { opacity: 1; transform: scale(1); }
			85% { opacity: 1; transform: scale(1); }
			100% { opacity: 0; transform: scale(0.8); }
		}

		.c-services-list__footer {
			display: flex;
			justify-content: flex-end;
			margin-top: 1.5rem;
			padding-top: 1.5rem;
			border-top: 1px solid #E2E2E2;
		}

		.c-services-list__quantity {
			width: 6rem;
			padding: 0.6rem 0.8rem;
			border: 1px solid #E2E2E2;
			border-radius: 0.4rem;
			font-size: 1.4rem;
			text-align: center;
			color: #11134E;
		}

		.c-services-list__quantity:focus {
			outline: none;
			border-color: #4054B2;
		}

		.c-services-list__add-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 3.6rem;
			height: 3.6rem;
			padding: 0;
			background: #4054B2;
			color: white;
			border: none;
			border-radius: 50%;
			cursor: pointer;
			transition: all 0.2s ease;
		}

		.c-services-list__add-btn:hover {
			background: #303f9f;
			transform: scale(1.1);
		}

		.c-services-list__add-btn svg {
			width: 1.6rem;
			height: 1.6rem;
			fill: currentColor;
		}

		.c-services-list__empty {
			padding: 2rem;
			text-align: center;
			color: #666;
			font-size: 1.4rem;
		}

		.c-services-list__empty a {
			color: #4054B2;
			text-decoration: underline;
		}

		.c-offer-items {
			margin-top: 1rem;
		}

		.c-offer-items__table-wrap {
			overflow-x: auto;
			margin-bottom: 2rem;
		}

		.c-offer-items__table-title {
			font-size: 1.5rem;
			font-weight: 600;
			color: #11134E;
			margin-bottom: 1rem;
		}

		.c-offer-items__table {
			width: 100%;
			border-collapse: collapse;
			background: white;
			border-radius: 0.8rem;
			overflow: hidden;
		}

		.c-offer-items__table thead {
			background-color: #f5f5f5;
		}

		.c-offer-items__table th {
			padding: 1.5rem;
			text-align: left;
			font-weight: 500;
			color: #474747;
			font-size: 1.4rem;
			border-bottom: 2px solid #E2E2E2;
		}

		.c-offer-items__table td {
			padding: 1.5rem;
			border-bottom: 1px solid #E2E2E2;
			color: #11134E;
			font-size: 1.4rem;
		}

		.c-offer-items__table tbody tr:hover {
			background-color: #f9f9f9;
		}

		.c-offer-items__empty-row td {
			text-align: center;
			padding: 3rem;
			color: #999;
		}

		.c-offer-items__item-info {
			display: flex;
			flex-direction: column;
			gap: 0.3rem;
		}

		.c-offer-items__item-name {
			font-weight: 500;
			color: #11134E;
		}

		.c-offer-items__item-desc {
			font-size: 1.3rem;
			color: #666;
		}

		.c-offer-items__remove-btn {
			display: inline-flex;
			align-items: center;
			gap: 0.4rem;
			margin-top: 0.5rem;
			padding: 0.4rem 0.8rem;
			background: transparent;
			color: #dc3545;
			border: 1px solid #dc3545;
			border-radius: 0.4rem;
			font-size: 1.2rem;
			cursor: pointer;
			transition: all 0.2s ease;
		}

		.c-offer-items__remove-btn:hover {
			background: #dc3545;
			color: white;
		}

		.c-offer-items__remove-btn svg {
			width: 1.2rem;
			height: 1.2rem;
		}

		.c-offer-items__summary {
			display: flex;
			flex-direction: column;
			gap: 0;
			margin-top: 1rem;
		}

		.c-offer-items__summary-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 1.5rem 2rem;
			font-weight: 500;
			font-size: 1.5rem;
		}

		.c-offer-items__summary-row--subtotal {
			background-color: #f5f5f5;
			color: #474747;
		}

		.c-offer-items__summary-row--tax {
			background-color: #e8f5e9;
			color: #2e7d32;
		}

		.c-offer-items__summary-row--total {
			background-color: #4054B2;
			color: white;
			font-weight: 600;
			font-size: 1.6rem;
		}

		.c-offer-items__summary-label {
			font-weight: inherit;
		}

		.c-offer-items__summary-value {
			font-weight: inherit;
		}

		.l-page-header__right-content {
			display: flex;
			gap: 1rem;
			align-items: center;
		}

		.ip-terms-preview {
			margin-top: 1.5rem;
			padding: 1.5rem;
			background: #fff8e1;
			border: 1px solid #ffc107;
			border-radius: 0.6rem;
		}

		.ip-terms-preview__title {
			font-size: 1.3rem;
			font-weight: 600;
			color: #ff8f00;
			margin-bottom: 0.8rem;
		}

		.ip-terms-preview__content {
			font-size: 1.2rem;
			color: #666;
			line-height: 1.6;
		}
	</style>
	@endpush

	@push('scripts')
	<script>
		// Services data for JavaScript
		const servicesData = @json($servicesData);

		// Existing items for edit form
		var existingItems = @json($existingItems);

		// IP Transfer texts
		const ipTransferTexts = {
			'full_transfer': "All intellectual property rights, including but not limited to copyrights, patents, and trademarks, for the deliverables described in this invoice are hereby irrevocably transferred to the customer upon receipt of full payment. The customer shall have exclusive ownership and may use, modify, reproduce, and distribute the deliverables without restriction.",
			'license_to_use': "The customer is granted a non-exclusive, non-transferable license to use the deliverables described in this invoice for their intended purpose. All intellectual property rights, including copyrights, remain the exclusive property of the company. The customer may not sublicense, sell, or transfer these rights without prior written consent."
		};

		// VAT rate from site settings (decimal, e.g. 0.21 for 21%)
		window.__DEFAULT_VAT_RATE = {{ ($vatRate ?? 21) / 100 }};
	</script>
	<script src="{{ asset('js/invoices.js') }}?v={{ uniqid() }}"></script>
	<script>
		// Initialize harmonica sections
		(function() {
			function initHarmonica() {
				var harmonicaSections = document.querySelectorAll('.js-harmonica');
				
				harmonicaSections.forEach(function (section) {
					var heading = section.querySelector('.c-harmonica__heading');
					var content = section.querySelector('.c-harmonica__content');
					
					if (!heading || !content) return;
					
					var shouldStartOpen = section.classList.contains('c-harmonica--is-open');
					if (shouldStartOpen && content.style.display === 'none') {
						content.style.display = 'block';
					}
					
					var newHeading = heading.cloneNode(true);
					heading.parentNode.replaceChild(newHeading, heading);
					heading = section.querySelector('.c-harmonica__heading');
					
					heading.addEventListener('click', function(e) {
						e.preventDefault();
						e.stopPropagation();
						
						var isOpen = section.classList.contains('c-harmonica--is-open');
						
						if (isOpen) {
							section.classList.remove('c-harmonica--is-open');
							content.style.display = 'none';
							content.style.height = '0';
							content.style.overflow = 'hidden';
						} else {
							section.classList.add('c-harmonica--is-open');
							content.style.display = 'block';
							content.style.height = 'auto';
							content.style.overflow = 'visible';
						}
					});
					
					heading.style.cursor = 'pointer';
				});
			}
			
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', initHarmonica);
			} else {
				initHarmonica();
			}
			
			setTimeout(initHarmonica, 500);
		})();

		// IP Transfer preview handler
		(function() {
			function initIpTransferPreview() {
				const select = document.querySelector('[name="ip_transfer_type"]');
				const preview = document.getElementById('ip-terms-preview');
				const content = document.getElementById('ip-terms-content');

				if (select && preview && content) {
					select.addEventListener('change', function() {
						const value = this.value;
						if (value && ipTransferTexts[value]) {
							content.textContent = ipTransferTexts[value];
							preview.style.display = 'block';
						} else {
							preview.style.display = 'none';
						}
					});
				}
			}

			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', initIpTransferPreview);
			} else {
				initIpTransferPreview();
			}
		})();
	</script>
	@endpush

@endsection
