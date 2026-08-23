<div class="e-modal e-modal--overflow" modal-id="add-service">

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
				<form id="add-service-form" class="e-form" method="POST" action="{{ route('services.store') }}">
					@csrf
					
					<div class="e-form__labels-inside">
						<x-form.input 
							name="name" 
							label="Service Name" 
							:value="old('name')" 
							required 
						/>

						<x-form.textarea 
							name="description" 
							label="Description" 
							:value="old('description')"
							rows="3"
						/>

						<x-form.input 
							name="price" 
							label="Price" 
							type="number"
							step="0.01"
							min="0"
							:value="old('price')" 
							required 
						/>

						<x-form.input 
							name="unit" 
							label="Unit" 
							:value="old('unit')"
							placeholder="e.g., hour, item, kg"
						/>
					</div>

					<div class="e-form__submit-wrap mt-20">
						<button type="submit" class="e-form__submit e-button">Add Service</button>
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
