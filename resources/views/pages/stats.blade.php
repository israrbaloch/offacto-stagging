@extends('app')

@section('title', 'Statistics')

@section('content')

	@include('partials.modals.tax-report')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">
				Statistieken
			</h1>
		</div>

		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">

				@include('partials.elements.filter-date')

			</div>

		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		<div class="l-grid l-grid--colx2">
			<div class="l-grid__col">

				@include('partials.widgets.overview-quotes')

				@include('partials.widgets.overview-invoices')

			</div>
			<div class="l-grid__col">

				@include('partials.widgets.overview-tax')

				@include('partials.widgets.overview-net')

			</div>
		</div>

		@include('partials.widgets.overview-year')

	</div>

@endsection