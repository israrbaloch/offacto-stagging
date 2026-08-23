@extends('layouts.app')

@section('title', 'Site Settings')

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Site Settings</h1>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		@if(session('status'))
			<div class="e-note e-note--success mb-20">
				<p class="e-note__text">
					@if(session('status') === 'settings-updated')
						Settings updated successfully.
					@endif
				</p>
			</div>
		@endif

		@if(session('error'))
			<div class="e-note e-note--error mb-20">
				<p class="e-note__text">{{ session('error') }}</p>
			</div>
		@endif

		<form action="{{ route('admin.settings.update') }}" method="POST" class="e-form">
			@csrf
			@method('PATCH')

			{{-- General Settings --}}
			@if($settings->has('general'))
			<div class="e-widget mb-30">
				<div class="e-widget__head">
					<h2 class="e-widget__title">General Settings</h2>
				</div>
				<div class="e-widget__content e-widget__content--inline-spacing">
					<div class="l-grid l-grid--colx2">
						@foreach($settings->get('general') as $setting)
						<div class="e-form__field-wrap">
							@if($setting->type === 'boolean')
							<input type="hidden" name="{{ $setting->key }}" value="0">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox" name="{{ $setting->key }}" value="1" {{ $setting->value ? 'checked' : '' }} />
								<span class="e-form__checkbox-label"></span>
								<span class="e-form__checkbox-text">{{ $setting->label ?? ucwords(str_replace('_', ' ', $setting->key)) }}</span>
							</label>
							@else
							<label class="e-form__label">
								<span class="e-form__label-text">{{ $setting->label ?? ucwords(str_replace('_', ' ', $setting->key)) }}</span>
							</label>
							<input 
								type="{{ $setting->type === 'integer' ? 'number' : 'text' }}" 
								name="{{ $setting->key }}" 
								class="e-form__input" 
								value="{{ $setting->value }}"
							>
							@endif
						</div>
						@endforeach
					</div>
				</div>
			</div>
			@endif

			{{-- Branding Settings --}}
			@if($settings->has('branding'))
			<div class="e-widget mb-30">
				<div class="e-widget__head">
					<h2 class="e-widget__title">Branding Settings</h2>
				</div>
				<div class="e-widget__content e-widget__content--inline-spacing">
					<div class="l-grid l-grid--colx2">
						@foreach($settings->get('branding') as $setting)
						<div class="e-form__field-wrap">
							@if($setting->type === 'boolean')
							<input type="hidden" name="{{ $setting->key }}" value="0">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox" name="{{ $setting->key }}" value="1" {{ $setting->value ? 'checked' : '' }} />
								<span class="e-form__checkbox-label"></span>
								<span class="e-form__checkbox-text">{{ $setting->label ?? ucwords(str_replace('_', ' ', $setting->key)) }}</span>
							</label>
							@else
							<label class="e-form__label">
								<span class="e-form__label-text">{{ $setting->label ?? ucwords(str_replace('_', ' ', $setting->key)) }}</span>
							</label>
							<input 
								type="{{ $setting->type === 'integer' ? 'number' : 'text' }}" 
								name="{{ $setting->key }}" 
								class="e-form__input" 
								value="{{ $setting->value }}"
							>
							@endif
						</div>
						@endforeach
					</div>
				</div>
			</div>
			@endif

			{{-- Feature Toggles --}}
			@if($settings->has('features'))
			<div class="e-widget mb-30">
				<div class="e-widget__head">
					<h2 class="e-widget__title">Feature Toggles</h2>
				</div>
				<div class="e-widget__content e-widget__content--inline-spacing">
					<div class="l-grid l-grid--colx2">
						@foreach($settings->get('features') as $setting)
						<div class="e-form__field-wrap">
							@if($setting->type === 'boolean')
							<input type="hidden" name="{{ $setting->key }}" value="0">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox" name="{{ $setting->key }}" value="1" {{ $setting->value ? 'checked' : '' }} />
								<span class="e-form__checkbox-label"></span>
								<span class="e-form__checkbox-text">{{ $setting->label ?? ucwords(str_replace('_', ' ', $setting->key)) }}</span>
							</label>
							@else
							<label class="e-form__label">
								<span class="e-form__label-text">{{ $setting->label ?? ucwords(str_replace('_', ' ', $setting->key)) }}</span>
							</label>
							<input 
								type="{{ $setting->type === 'integer' ? 'number' : 'text' }}" 
								name="{{ $setting->key }}" 
								class="e-form__input" 
								value="{{ $setting->value }}"
							>
							@endif
						</div>
						@endforeach
					</div>
				</div>
			</div>
			@endif

			<div class="e-form__actions">
				<button type="submit" class="e-button">Save Settings</button>
			</div>
		</form>

	</div>

@endsection
