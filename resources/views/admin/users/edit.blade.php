@extends('layouts.app')

@section('title', 'Edit User: ' . $user->name)

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Edit User: {{ $user->name }}</h1>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<a href="{{ route('admin.users.show', $user) }}" class="e-button e-button--bordered">Cancel</a>
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
				<h2 class="e-widget__title">User Information</h2>
			</div>
			<div class="e-widget__content e-widget__content--inline-spacing">
				<form action="{{ route('admin.users.update', $user) }}" method="POST" class="e-form">
					@csrf
					@method('PATCH')

					<div class="l-grid l-grid--colx2">
						<div class="e-form__field-wrap {{ $errors->has('name') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Name</span>
								<span class="e-form__label-required">*</span>
							</label>
							<input type="text" name="name" class="e-form__input" value="{{ old('name', $user->name) }}" required>
							@error('name')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>

						<div class="e-form__field-wrap {{ $errors->has('email') ? 'e-form__field-wrap--error' : '' }}">
							<label class="e-form__label">
								<span class="e-form__label-text">Email</span>
								<span class="e-form__label-required">*</span>
							</label>
							<input type="email" name="email" class="e-form__input" value="{{ old('email', $user->email) }}" required>
							@error('email')
								<span class="e-form__error">{{ $message }}</span>
							@enderror
						</div>
					</div>

					<div class="e-form__actions mt-20">
						<button type="submit" class="e-button">Save Changes</button>
						<a href="{{ route('admin.users.show', $user) }}" class="e-button e-button--bordered">Cancel</a>
					</div>
				</form>
			</div>
		</div>

	</div>

@endsection
