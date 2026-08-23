@extends('layouts.app')

@section('title', 'Manage Companies')

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Manage Companies</h1>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<div class="c-stats-summary">
					<ul class="c-stats-summary__list">
						<li class="c-stats-summary__list-item">{{ $companies->total() }} companies</li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing l-page-content--has-table">

		@if(session('status'))
			<div class="e-note e-note--success mb-20">
				<p class="e-note__text">
					@if(session('status') === 'company-updated')
						Company updated successfully.
					@elseif(session('status') === 'company-approved')
						Company approved successfully.
					@elseif(session('status') === 'company-rejected')
						Company rejected successfully.
					@elseif(session('status') === 'company-activated')
						Company activated successfully.
					@elseif(session('status') === 'company-deactivated')
						Company deactivated successfully.
					@endif
				</p>
			</div>
		@endif

		@if(session('error'))
			<div class="e-note e-note--error mb-20">
				<p class="e-note__text">{{ session('error') }}</p>
			</div>
		@endif

		@if($companies->count() > 0)
		<div class="c-table">
			<div class="c-table__wrap">
				<div class="c-table__thead">
					<div class="c-table__thead-tr">
						<div class="c-table__thead-td">Company Name</div>
						<div class="c-table__thead-td">Owner</div>
						<div class="c-table__thead-td">Email</div>
						<div class="c-table__thead-td">Approval Status</div>
						<div class="c-table__thead-td">Active</div>
						<div class="c-table__thead-td">Actions</div>
					</div>
				</div>

				<div class="c-table__tbody">
					@foreach($companies as $company)
					<div class="c-table__tr">
						<div class="c-table__td">
							<a href="{{ route('admin.companies.show', $company) }}" class="c-table__link">{{ $company->company_name }}</a>
						</div>
						<div class="c-table__td">
							<a href="{{ route('admin.users.show', $company->user) }}" class="c-table__link">{{ $company->user->name }}</a>
						</div>
						<div class="c-table__td">
							<p class="c-table__text">{{ $company->email }}</p>
						</div>
						<div class="c-table__td">
							<span class="c-table__badge c-table__badge--{{ strtolower(str_replace(' ', '-', $company->statusRelation->name ?? 'none')) }}">
								{{ $company->statusRelation->name ?? 'N/A' }}
							</span>
						</div>
						<div class="c-table__td">
							<span class="c-table__badge c-table__badge--{{ $company->is_active ? 'active' : 'inactive' }}">
								{{ $company->is_active ? 'Active' : 'Inactive' }}
							</span>
						</div>
						<div class="c-table__td">
							<a href="{{ route('admin.companies.show', $company) }}" class="e-button e-button--bordered e-button--small">View</a>
							<a href="{{ route('admin.companies.edit', $company) }}" class="e-button e-button--bordered e-button--small">Edit</a>
							@if($company->isPendingApproval())
							<form action="{{ route('admin.companies.approve', $company) }}" method="POST" style="display: inline;">
								@csrf
								<button type="submit" class="e-button e-button--bordered e-button--small">Approve</button>
							</form>
							@endif
							@if($company->isApproved())
							<form action="{{ route('admin.companies.toggle-active', $company) }}" method="POST" style="display: inline;">
								@csrf
								<button type="submit" class="e-button e-button--bordered e-button--small {{ $company->is_active ? 'e-button--red' : '' }}">
									{{ $company->is_active ? 'Deactivate' : 'Activate' }}
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
			{{ $companies->links() }}
		</div>
		@else
		<div class="e-note">
			<p class="e-note__text">No companies found matching your criteria.</p>
		</div>
		@endif

	</div>

@endsection
