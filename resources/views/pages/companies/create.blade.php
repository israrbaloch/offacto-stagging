@extends('layouts.app')

@section('title', 'Add Company')

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Add Company</h1>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<a href="{{ route('companies.index') }}" class="e-button e-button--bordered">Cancel</a>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		@if($errors->any())
			<div class="e-note e-note--error mb-20">
				<ul class="e-note__text">
					@foreach($errors->all() as $error)
						<li>{{ $error }}</li>
					@endforeach
				</ul>
			</div>
		@endif

		@if($requireCompanyApproval ?? false)
			<div class="e-note e-note--small-spacing mb-20">
				<p class="e-note__text">New companies require admin approval. You will receive an email when your company is approved.</p>
			</div>
		@endif

		<form action="{{ route('companies.store') }}" method="POST" class="e-form">
			@csrf

			<div class="e-widget mb-30">
				<div class="e-widget__head">
					<h2 class="e-widget__title">Company Information</h2>
				</div>
				<div class="e-widget__content e-widget__content--inline-spacing">
					<div class="l-grid l-grid--colx3">
						<div class="l-grid__col e-form">
							<div class="e-form__labels-inside">
								<x-form.input name="company_name" label="Company Name" :value="old('company_name')" required />
							</div>
						</div>
						<div class="l-grid__col e-form">
							<div class="e-form__labels-inside">
								<x-form.input name="vat_number" label="VAT Number" :value="old('vat_number')" />
							</div>
						</div>
						<div class="l-grid__col e-form">
							<div class="e-form__labels-inside">
								<x-form.input name="email" label="Email" type="email" :value="old('email')" required />
							</div>
						</div>
					</div>
					<div class="l-grid l-grid--colx3 mt-10">
						<div class="l-grid__col e-form">
							<div class="e-form__labels-inside">
								<x-form.input name="phone" label="Phone" :value="old('phone')" required />
							</div>
						</div>
						<div class="l-grid__col e-form">
							<div class="e-form__labels-inside">
								<x-form.input name="first_name" label="First Name" :value="old('first_name')" required />
							</div>
						</div>
						<div class="l-grid__col e-form">
							<div class="e-form__labels-inside">
								<x-form.input name="surname" label="Surname" :value="old('surname')" required />
							</div>
						</div>
					</div>
					<div class="l-grid l-grid--colx2 mt-10">
						<div class="l-grid__col e-form">
							<div class="e-form__labels-inside">
								<x-form.select name="language" label="Language" :options="$languages" :value="old('language')" required />
							</div>
						</div>
						<div class="l-grid__col e-form">
							<div class="e-form__labels-inside">
								<x-form.select name="self_employed_activity" label="Self Employed Activity" :options="['' => 'Select...', 'main_profession' => 'Main Profession', 'secondary_profession' => 'Secondary Profession']" :value="old('self_employed_activity')" />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="e-widget mb-30">
				<div class="e-widget__head">
					<h2 class="e-widget__title">Address</h2>
				</div>
				<div class="e-widget__content e-widget__content--inline-spacing">
					<div class="l-grid l-grid--colx2">
						<div class="l-grid__col e-form">
							<div class="e-form__labels-inside">
								<x-form.input name="street" label="Street" :value="old('street')" required />
								<x-form.input name="house" label="House Number" :value="old('house')" required />
							</div>
						</div>
						<div class="l-grid__col e-form">
							<div class="e-form__labels-inside">
								<x-form.input name="postal_code" label="Postal Code" :value="old('postal_code')" required />
								<x-form.input name="city" label="City" :value="old('city')" required />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="e-form__actions">
				<button type="submit" class="e-button">Add Company</button>
				<a href="{{ route('companies.index') }}" class="e-button e-button--bordered">Cancel</a>
			</div>
		</form>

	</div>

@endsection
