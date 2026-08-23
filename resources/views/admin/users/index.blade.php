@extends('layouts.app')

@section('title', 'Manage Users')

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Manage Users</h1>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<div class="c-stats-summary">
					<ul class="c-stats-summary__list">
						<li class="c-stats-summary__list-item">{{ $users->total() }} users</li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing l-page-content--has-table">

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

		@if($users->count() > 0)
		<div class="c-table">
			<div class="c-table__wrap">
				<div class="c-table__thead">
					<div class="c-table__thead-tr">
						<div class="c-table__thead-td">Name</div>
						<div class="c-table__thead-td">Email</div>
						<div class="c-table__thead-td">Role</div>
						<div class="c-table__thead-td">Companies</div>
						<div class="c-table__thead-td">Status</div>
						<div class="c-table__thead-td">Actions</div>
					</div>
				</div>

				<div class="c-table__tbody">
					@foreach($users as $user)
					<div class="c-table__tr">
						<div class="c-table__td">
							<a href="{{ route('admin.users.show', $user) }}" class="c-table__link">{{ $user->name }}</a>
						</div>
						<div class="c-table__td">
							<p class="c-table__text">{{ $user->email }}</p>
						</div>
						<div class="c-table__td">
							<span class="c-table__badge">{{ $user->roles->pluck('name')->map(fn($r) => ucfirst($r))->join(', ') ?: 'No role' }}</span>
						</div>
						<div class="c-table__td">
							<p class="c-table__text">{{ $user->companies->count() }}</p>
						</div>
						<div class="c-table__td">
							<span class="c-table__badge c-table__badge--{{ $user->is_active ? 'active' : 'inactive' }}">
								{{ $user->is_active ? 'Active' : 'Inactive' }}
							</span>
						</div>
						<div class="c-table__td">
							<a href="{{ route('admin.users.show', $user) }}" class="e-button e-button--bordered e-button--small">View</a>
							<a href="{{ route('admin.users.edit', $user) }}" class="e-button e-button--bordered e-button--small">Edit</a>
							@if($user->id !== auth()->id())
							<form action="{{ route('admin.users.toggle-active', $user) }}" method="POST" style="display: inline;">
								@csrf
								<button type="submit" class="e-button e-button--bordered e-button--small {{ $user->is_active ? 'e-button--red' : '' }}">
									{{ $user->is_active ? 'Deactivate' : 'Activate' }}
								</button>
							</form>
							@endif
						</div>
					</div>
					@endforeach
				</div>
			</div>
		</div>

		{{-- Pagination --}}
		<div class="c-pagination">
			{{ $users->links() }}
		</div>
		@else
		<div class="e-note">
			<p class="e-note__text">No users found matching your criteria.</p>
		</div>
		@endif

	</div>

@endsection
