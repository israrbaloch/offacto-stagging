@extends('layouts.app')

@section('title', 'Edit Company: ' . $company->company_name)

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Edit Company: {{ $company->company_name }}</h1>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<a href="{{ route('admin.companies.show', $company) }}" class="e-button e-button--bordered">Cancel</a>
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
				<h2 class="e-widget__title">Company Information</h2>
			</div>
			<div class="e-widget__content e-widget__content--inline-spacing">
				<form action="{{ route('admin.companies.update', $company) }}" method="POST" class="e-form">
					@csrf
					@method('PATCH')

					<div class="l-grid l-grid--colx2">
						<div class="e-form__field-wrap {{ $errors->has('company_name') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Company Name</span>
								<span class="e-form__label-required">*</span>
							</label>
							<input type="text" name="company_name" class="e-form__input" value="{{ old('company_name', $company->company_name) }}" required>
							@error('company_name')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('email') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Email</span>
								<span class="e-form__label-required">*</span>
							</label>
							<input type="email" name="email" class="e-form__input" value="{{ old('email', $company->email) }}" required>
							@error('email')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('phone') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Phone</span>
							</label>
							<input type="text" name="phone" class="e-form__input" value="{{ old('phone', $company->phone) }}">
							@error('phone')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('vat_number') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">VAT Number</span>
							</label>
							<input type="text" name="vat_number" class="e-form__input" value="{{ old('vat_number', $company->vat_number) }}">
							@error('vat_number')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('street') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Street</span>
							</label>
							<input type="text" name="street" class="e-form__input" value="{{ old('street', $company->street) }}">
							@error('street')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('house') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">House Number</span>
							</label>
							<input type="text" name="house" class="e-form__input" value="{{ old('house', $company->house) }}">
							@error('house')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('postal_code') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Postal Code</span>
							</label>
							<input type="text" name="postal_code" class="e-form__input" value="{{ old('postal_code', $company->postal_code) }}">
							@error('postal_code')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('city') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">City</span>
							</label>
							<input type="text" name="city" class="e-form__input" value="{{ old('city', $company->city) }}">
							@error('city')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>
					</div>

					<div class="e-form__actions mt-20">
						<button type="submit" class="e-button">Save Changes</button>
						<a href="{{ route('admin.companies.show', $company) }}" class="e-button e-button--bordered">Cancel</a>
					</div>
				</form>
			</div>
		</div>

	</div>

@endsection
