<header class="l-header">
	
	<div class="l-header__left">

		<a class="l-header__logo" href="/">
			@svg('logo.offacto-full-white')
		</a>

		@include('partials.header.shortcuts')

	</div>

	<div class="l-header__right">

		@include('partials.header.timer')

		@include('partials.header.notifications')

		@include('partials.header.user-menu')

		@include('partials.header.mobile-menu-button')

	</div>

</header>