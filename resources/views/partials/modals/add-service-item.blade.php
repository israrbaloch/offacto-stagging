<div class="e-modal e-modal--overflow" modal-id="add-service-item">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<h2 class="e-modal__title">Add Service</h2>
			</div>

			<div class="e-modal__section">
				<form id="add-service-item-form" class="e-form">
					<div class="e-form__labels-inside">
						<x-form.select 
							name="service_id" 
							label="Service"
							:options="$services->mapWithKeys(function($service) {
								return [$service->id => $service->name . ' (€' . number_format($service->price, 2, ',', '.') . ')'];
							})"
							id="add-item-service-id"
							required
						/>

						<x-form.textarea 
							name="description" 
							label="Description" 
							id="add-item-description"
							rows="2"
						/>

						<x-form.input 
							name="quantity" 
							label="Quantity" 
							type="number"
							min="1"
							step="1"
							value="1"
							id="add-item-quantity"
							required
						/>

						<x-form.input 
							name="price" 
							label="Price" 
							type="number"
							step="0.01"
							min="0"
							id="add-item-price"
							required
						/>
					</div>

					<div class="e-form__submit-wrap mt-20">
						<button type="button" class="e-form__submit e-button" id="add-item-submit-btn">Add Item</button>
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
