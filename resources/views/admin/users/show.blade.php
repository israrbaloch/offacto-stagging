@extends('layouts.app')

@section('title', 'View User: ' . $user->name)

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">{{ $user->name }}</h1>
			<span class="c-table__badge c-table__badge--{{ $user->is_active ? 'active' : 'inactive' }}">
				{{ $user->is_active ? 'Active' : 'Inactive' }}
			</span>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<a href="{{ route('admin.users.index') }}" class="e-button e-button--bordered">Back to Users</a>
				<a href="{{ route('admin.users.edit', $user) }}" class="e-button">Edit User</a>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		@if(session('status'))
			<div class="e-note e-note--success mb-20">
				<p class="e-note__text">
					@if(session('status') === 'user-updated')
						User updated successfully.
					@elseif(session('status') === 'user-activated')
						User activated successfully.
					@elseif(session('status') === 'user-deactivated')
						User deactivated successfully.
					@elseif(session('status') === 'role-updated')
						User role updated successfully.
					@endif
				</p>
			</div>
		@endif

		@if(session('error'))
			<div class="e-note e-note--error mb-20">
				<p class="e-note__text">{{ session('error') }}</p>
			</div>
		@endif

		<div class="l-widget-grid">
			<div class="l-widget-grid__left">

				{{-- User Details --}}
				<div class="e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">User Details</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						<ul class="c-widget-stats__list">
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Email</span>
								<span class="c-widget-stats__item-data">{{ $user->email }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Role</span>
								<span class="c-widget-stats__item-data">{{ $user->roles->pluck('name')->map(fn($r) => ucfirst($r))->join(', ') ?: 'No role' }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Email Verified</span>
								<span class="c-widget-stats__item-data">{{ $user->email_verified_at ? $user->email_verified_at->format('d M Y') : 'Not verified' }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Registered</span>
								<span class="c-widget-stats__item-data">{{ $user->created_at->format('d M Y H:i') }}</span>
							</li>
						</ul>
					</div>
				</div>

				{{-- Quick Actions --}}
				<div class="e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Quick Actions</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						@if($user->id !== auth()->id())
						<form action="{{ route('admin.users.toggle-active', $user) }}" method="POST" style="display: inline;">
							@csrf
							<button type="submit" class="e-button {{ $user->is_active ? 'e-button--red' : '' }}">
								{{ $user->is_active ? 'Deactivate User' : 'Activate User' }}
							</button>
						</form>
						@endif

						<form action="{{ route('admin.users.assign-role', $user) }}" method="POST" class="e-form e-form--inline mt-20">
							@csrf
							<div class="e-form__field-wrap">
								<label class="e-form__label">Assign Role</label>
								<select name="role" class="e-form__select">
									@foreach(\App\Models\Role::all() as $role)
										<option value="{{ $role->id }}" {{ $user->roles->contains($role) ? 'selected' : '' }}>{{ ucfirst($role->name) }}</option>
									@endforeach
								</select>
							</div>
							<button type="submit" class="e-button e-button--bordered">Update Role</button>
						</form>
					</div>
				</div>

			</div>
			<div class="l-widget-grid__right">

				{{-- Statistics --}}
				<div class="c-widget-stats e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Statistics</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						<ul class="c-widget-stats__list">
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Companies</span>
								<span class="c-widget-stats__item-data">{{ $user->companies->count() }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Services</span>
								<span class="c-widget-stats__item-data">{{ $user->companies->sum(fn($c) => $c->services->count()) }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Offers</span>
								<span class="c-widget-stats__item-data">{{ $user->companies->sum(fn($c) => $c->offers->count()) }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Invoices</span>
								<span class="c-widget-stats__item-data">{{ $user->companies->sum(fn($c) => $c->invoices->count()) }}</span>
							</li>
						</ul>
					</div>
				</div>

			</div>
		</div>

		{{-- User's Companies --}}
		<div class="e-widget mt-30">
			<div class="e-widget__head">
				<h2 class="e-widget__title">Companies ({{ $user->companies->count() }})</h2>
			</div>
			<div class="e-widget__content">
				@if($user->companies->count() > 0)
				<div class="c-table">
					<div class="c-table__wrap">
						<div class="c-table__thead">
							<div class="c-table__thead-tr">
								<div class="c-table__thead-td">Company Name</div>
								<div class="c-table__thead-td">Email</div>
								<div class="c-table__thead-td">Services</div>
								<div class="c-table__thead-td">Invoices</div>
								<div class="c-table__thead-td">Status</div>
								<div class="c-table__thead-td">Actions</div>
							</div>
						</div>
						<div class="c-table__tbody">
							@foreach($user->companies as $company)
							<div class="c-table__tr">
								<div class="c-table__td">
									<a href="{{ route('admin.companies.show', $company) }}" class="c-table__link">{{ $company->company_name }}</a>
								</div>
								<div class="c-table__td">
									<p class="c-table__text">{{ $company->email }}</p>
								</div>
								<div class="c-table__td">
									<p class="c-table__text">{{ $company->services->count() }}</p>
								</div>
								<div class="c-table__td">
									<p class="c-table__text">{{ $company->invoices->count() }}</p>
								</div>
								<div class="c-table__td">
									<span class="c-table__badge c-table__badge--{{ $company->is_active ? 'active' : 'inactive' }}">
										{{ $company->is_active ? 'Active' : 'Inactive' }}
									</span>
								</div>
								<div class="c-table__td">
									<a href="{{ route('admin.companies.show', $company) }}" class="e-button e-button--bordered e-button--small">View</a>
									<a href="{{ route('admin.companies.edit', $company) }}" class="e-button e-button--bordered e-button--small">Edit</a>
								</div>
							</div>
							@endforeach
						</div>
					</div>
				</div>
				@else
				<div class="e-widget__empty">
					<p>This user has no companies.</p>
				</div>
				@endif
			</div>
		</div>

	</div>

@endsection
