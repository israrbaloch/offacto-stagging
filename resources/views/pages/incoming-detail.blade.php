@extends('app')

@section('title', 'Incoming Detail')

@section('content')

	@include('partials.modals.add-contact')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<a class="e-button e-button--bordered e-button--purple-dark" href="/inkomend">@svg('arrow-left') Inkomend</a>
			<h1 class="l-page-header__title">
				CK98213981
			</h1>
		</div>

		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				
				<div class="e-filter-date e-form__select-wrap">
					<select class="e-form__select e-form__select--small">
						<option>Betaald</option>
						<option>Open</option>
						<option>Concept</option>
					</select>
				</div>

			</div>

		</div>
	</div>

	<div class="l-page-content">

		@include('partials.incoming.file')

		@include('partials.incoming.data')

	</div>

@endsection