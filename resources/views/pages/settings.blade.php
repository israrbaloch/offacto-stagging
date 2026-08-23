@extends('app')

@section('title', 'Settings')

@section('content')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">
				Account instellingen
			</h1>
		</div>
	</div>

	<div class="l-page-content">

		@include('partials.settings.data')

		@include('partials.settings.notifications')

	</div>

@endsection