<div class="c-user-menu">
	<p class="c-user-menu__user-name">{{ Auth::user()->name }} @svg('arrow-down')</p>
	<p class="c-user-menu__user-icon">
		@svg('user')
	</p>
	<ul class="e-popover">
		<li class="e-popover__item">
			<a class="e-popover__link" href="{{ route('profile.edit') }}">Account Settings</a>
		</li>
		<li class="e-popover__item">
			<form method="POST" action="{{ route('logout') }}" style="margin: 0; padding: 0; width: 100%;">
				@csrf
				<button type="submit" class="e-popover__link" style="background: none; border: none; padding: 2rem; cursor: pointer; width: 100%; text-align: left; font-family: 'LL Circular Book Sub', sans-serif; font-size: 1.5rem; color: #474747; display: block;">
					Logout
				</button>
			</form>
		</li>
	</ul>
</div>