@extends('app')

@section('title', 'Dashboard')

@section('content')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">
				Welcome {{ $user->name ?? 'User' }}
			</h1>
		</div>

		<div class="l-page-header__right-wrap">

			<div class="l-page-header__right-content">

				<a href="{{ route('offers.create') }}" class="e-button">@svg('plus') Add Offer</a>
				<a href="/invoices/create" class="e-button">@svg('plus') Add Invoice</a>

			</div>

		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		<div class="l-widget-grid">
			<div class="l-widget-grid__left">

				@include('partials.widgets.net-summary', ['stats' => $stats])

				@include('partials.widgets.open-offers', ['openOffers' => $openOffers, 'stats' => $stats])

			</div>
			<div class="l-widget-grid__right">

				@include('partials.widgets.best-clients', ['topCustomers' => $topCustomers])

			</div>
		</div>

	</div>

@endsection
