@extends('layouts.app')

@section('title', 'Edit Service: ' . $service->name)

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Edit Service: {{ $service->name }}</h1>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<a href="{{ route('admin.services.show', $service) }}" class="e-button e-button--bordered">Cancel</a>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		@if($errors->any())
			<div class="e-note e-note--error mb-20">
				<ul>
					@foreach($errors->all() as $error)
						<li>{{ $error }}</li>
					@endforeach
				</ul>
			</div>
		@endif

		<div class="e-widget">
			<div class="e-widget__head">
				<h2 class="e-widget__title">Service Information</h2>
			</div>
			<div class="e-widget__content e-widget__content--inline-spacing">
				<div class="e-note e-note--info mb-20">
					<p class="e-note__text">
						<strong>Company:</strong> {{ $service->company->company_name }} 
						(<a href="{{ route('admin.companies.show', $service->company) }}">View Company</a>)
					</p>
				</div>

				<form action="{{ route('admin.services.update', $service) }}" method="POST" class="e-form">
					@csrf
					@method('PATCH')

					<div class="l-grid l-grid--colx2">
						<div class="e-form__field-wrap {{ $errors->has('name') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Service Name</span>
								<span class="e-form__label-required">*</span>
							</label>
							<input type="text" name="name" class="e-form__input" value="{{ old('name', $service->name) }}" required>
							@error('name')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('price') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Price (€)</span>
								<span class="e-form__label-required">*</span>
							</label>
							<input type="number" step="0.01" name="price" class="e-form__input" value="{{ old('price', $service->price) }}" required>
							@error('price')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('unit') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Unit</span>
							</label>
							<input type="text" name="unit" class="e-form__input" value="{{ old('unit', $service->unit) }}" placeholder="e.g., hour, piece, day">
							@error('unit')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('status') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Status</span>
								<span class="e-form__label-required">*</span>
							</label>
							<select name="status" class="e-form__select" required>
								@foreach($statuses as $status)
									<option value="{{ $status->id }}" {{ old('status', $service->status) == $status->id ? 'selected' : '' }}>
										{{ $status->name }}
									</option>
								@endforeach
							</select>
							@error('status')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>
					</div>

					<div class="e-form__field-wrap {{ $errors->has('description') ? 'e-form__field-wrap--error' : '' }}">
						<label class="e-form__label">
							<span class="e-form__label-text">Description</span>
						</label>
						<textarea name="description" class="e-form__textarea" rows="4">{{ old('description', $service->description) }}</textarea>
						@error('description')
							<span class="e-form__error">{{ $message }}</span>
						@enderror
					</div>

					<div class="e-form__actions mt-20">
						<button type="submit" class="e-button">Save Changes</button>
						<a href="{{ route('admin.services.show', $service) }}" class="e-button e-button--bordered">Cancel</a>
					</div>
				</form>
			</div>
		</div>

	</div>

@endsection
