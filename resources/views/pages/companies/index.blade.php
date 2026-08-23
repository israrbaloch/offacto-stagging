@extends('layouts.app')

@section('title', 'My Companies')

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">My Companies</h1>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<a href="{{ route('companies.create') }}" class="e-button">@svg('plus') Add Company</a>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		@if(session('status'))
			<div class="e-note e-note--success mb-20">
				<p class="e-note__text">{{ session('status') }}</p>
			</div>
		@endif

		@if(session('error'))
			<div class="e-note e-note--error mb-20">
				<p class="e-note__text">{{ session('error') }}</p>
			</div>
		@endif

		@if($requireCompanyApproval ?? false)
			<div class="e-note e-note--small-spacing mb-20">
				<p class="e-note__text">New companies require admin approval. You will receive an email when your company is approved.</p>
			</div>
		@endif

		<div class="e-widget">
			<div class="e-widget__content e-widget__content--inline-spacing">
				<div class="c-table">
					<div class="c-table__wrap">
						<div class="c-table__thead">
							<div class="c-table__thead-tr">
								<div class="c-table__thead-td">Company Name</div>
								<div class="c-table__thead-td">Email</div>
								<div class="c-table__thead-td">City</div>
								<div class="c-table__thead-td">Status</div>
								<div class="c-table__thead-td">Actions</div>
							</div>
						</div>
						<div class="c-table__tbody">
							@forelse($companies as $company)
								<div class="c-table__tr">
									<div class="c-table__td">
										<p class="c-table__text">{{ $company->company_name }}</p>
									</div>
									<div class="c-table__td">
										<p class="c-table__text">{{ $company->email }}</p>
									</div>
									<div class="c-table__td">
										<p class="c-table__text">{{ $company->city }}</p>
									</div>
									<div class="c-table__td">
										@php
											$statusName = $company->statusRelation->name ?? '-';
											$isActive = $company->is_active && $statusName === 'Approved';
										@endphp
										<span class="c-table__badge {{ $isActive ? 'c-table__badge--success' : 'c-table__badge--warning' }}">{{ $statusName }}</span>
									</div>
									<div class="c-table__td">
										@if($isActive)
											<form action="{{ route('company.switch', $company) }}" method="POST" style="display: inline;">
												@csrf
												<button type="submit" class="e-button e-button--bordered e-button--small">Switch</button>
											</form>
											<a href="{{ route('profile.edit') }}" class="e-button e-button--bordered e-button--small">Edit</a>
										@else
											<span class="e-form__help-text">Pending approval</span>
										@endif
									</div>
								</div>
							@empty
								<div class="c-table__tr">
									<div class="c-table__td" colspan="5" style="text-align: center; padding: 2rem;">
										<p class="c-table__text">No companies yet. <a href="{{ route('companies.create') }}">Add your first company</a>.</p>
									</div>
								</div>
							@endforelse
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>

@endsection
