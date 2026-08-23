@extends('app')

@section('title', 'Contact')

@section('content')

	@include('partials.modals.add-contact')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<a class="e-button e-button--bordered e-button--purple-dark" href="/contacten">@svg('arrow-left') Contacten</a>
			<h1 class="l-page-header__title">
				Revaio B.V.
				<span class="l-page-header__below-title">Stijn Belmans</span>
			</h1>
		</div>

		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				
				<div class="c-stats-summary">
					<div class="c-stats-summary__icon">
						@svg('stats')
					</div>
					<ul class="c-stats-summary__list">
						<li class="c-stats-summary__list-item">
							<span>€ 0</span> openstaande facturen
						</li>
						<li class="c-stats-summary__list-item">
							<span>€ 12.000</span> omzet
						</li>
					</ul>
				</div>

			</div>

		</div>
	</div>

	<div class="l-page-content">

		@include('partials.contact.contact-data')

		@include('partials.contact.template-settings')

		@include('partials.contact.invoices')

		@include('partials.contact.quotes')

		@include('partials.contact.timesheet')

	</div>

@endsection