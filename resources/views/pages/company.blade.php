@extends('app')

@section('title', 'Company')

@section('content')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<a class="e-button e-button--bordered e-button--purple-dark" href="/bedrijven">@svg('arrow-left') Bedrijven</a>
			<h1 class="l-page-header__title">
				Revaio B.V.
			</h1>
		</div>
	</div>

	<div class="l-page-content">

		@include('partials.company.data')

		@include('partials.company.templates')

		@include('partials.company.text')

		@include('partials.company.payment-methods')

		@include('partials.company.payment')

	</div>

@endsection