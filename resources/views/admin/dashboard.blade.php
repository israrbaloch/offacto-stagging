@extends('layouts.app')

@section('title', 'Admin Dashboard')

@section('content')

	<div class="l-page-header">
		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Admin Dashboard</h1>
		</div>
		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				<a href="{{ route('admin.users.index') }}" class="e-button">Manage Users</a>
				<a href="{{ route('admin.companies.index') }}" class="e-button">Manage Companies</a>
			</div>
		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		{{-- Stats Overview --}}
		<div class="l-widget-grid">
			<div class="l-widget-grid__left">

				{{-- User Stats Widget --}}
				<div class="c-widget-stats e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Users Overview</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						<div class="c-widget-stats__result">
							<p class="c-widget-stats__result-number">{{ number_format($userStats['total']) }}</p>
							<p class="c-widget-stats__result-note">Total Users</p>
						</div>
						<ul class="c-widget-stats__list">
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Active Users</span>
								<span class="c-widget-stats__item-data">{{ number_format($userStats['active']) }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Inactive Users</span>
								<span class="c-widget-stats__item-data">{{ number_format($userStats['inactive']) }}</span>
							</li>
						</ul>
					</div>
				</div>

				{{-- Company Stats Widget --}}
				<div class="c-widget-stats e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Companies Overview</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						<div class="c-widget-stats__result">
							<p class="c-widget-stats__result-number">{{ number_format($companyStats['total']) }}</p>
							<p class="c-widget-stats__result-note">Total Companies</p>
						</div>
						<ul class="c-widget-stats__list">
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Active Companies</span>
								<span class="c-widget-stats__item-data">{{ number_format($companyStats['active']) }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Pending Approval</span>
								<span class="c-widget-stats__item-data">{{ number_format($companyStats['pending']) }}</span>
							</li>
						</ul>
					</div>
				</div>

				{{-- Invoice Stats Widget --}}
				<div class="c-widget-stats e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Invoices Overview</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						<div class="c-widget-stats__result">
							<p class="c-widget-stats__result-number">€ {{ number_format($invoiceStats['total_revenue'], 2, ',', '.') }}</p>
							<p class="c-widget-stats__result-note">Total Revenue (Paid)</p>
						</div>
						<ul class="c-widget-stats__list">
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Total Invoices</span>
								<span class="c-widget-stats__item-data">{{ number_format($invoiceStats['total']) }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Pending Payment</span>
								<span class="c-widget-stats__item-data">{{ number_format($invoiceStats['pending_payment']) }}</span>
							</li>
						</ul>
					</div>
				</div>

			</div>
			<div class="l-widget-grid__right">

				{{-- Service Stats Widget --}}
				<div class="c-widget-stats e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Services Overview</h2>
					</div>
					<div class="e-widget__content e-widget__content--inline-spacing">
						<div class="c-widget-stats__result">
							<p class="c-widget-stats__result-number">{{ number_format($serviceStats['total']) }}</p>
							<p class="c-widget-stats__result-note">Total Services</p>
						</div>
						<ul class="c-widget-stats__list">
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Active Services</span>
								<span class="c-widget-stats__item-data">{{ number_format($serviceStats['active']) }}</span>
							</li>
							<li class="c-widget-stats__item">
								<span class="c-widget-stats__item-subject">Pending Review</span>
								<span class="c-widget-stats__item-data">{{ number_format($serviceStats['pending']) }}</span>
							</li>
						</ul>
					</div>
				</div>

				{{-- Recent Users Widget --}}
				<div class="c-widget-list e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Recent Users</h2>
						<a href="{{ route('admin.users.index') }}" class="e-widget__link">View All</a>
					</div>
					<div class="e-widget__content">
						@if($recentUsers->count() > 0)
						<table class="c-table-compact">
							<tbody class="c-table-compact__tbody">
								@foreach($recentUsers as $user)
								<tr class="c-table-compact__tr">
									<td class="c-table-compact__td">
										<a href="{{ route('admin.users.show', $user) }}" class="c-table-compact__link">{{ $user->name }}</a>
									</td>
									<td class="c-table-compact__td">{{ $user->email }}</td>
									<td class="c-table-compact__td">
										<span class="e-label e-label--{{ $user->is_active ? 'active' : 'inactive' }}">
											{{ $user->is_active ? 'Active' : 'Inactive' }}
										</span>
									</td>
								</tr>
								@endforeach
							</tbody>
						</table>
						@else
						<div class="e-widget__empty">
							<p>No users found.</p>
						</div>
						@endif
					</div>
				</div>

				{{-- Pending Companies Widget --}}
				@if($pendingCompanies->count() > 0)
				<div class="c-widget-list e-widget">
					<div class="e-widget__head">
						<h2 class="e-widget__title">Pending Company Approvals</h2>
						<a href="{{ route('admin.companies.index', ['status' => 'pending']) }}" class="e-widget__link">View All</a>
					</div>
					<div class="e-widget__content">
						<table class="c-table-compact">
							<tbody class="c-table-compact__tbody">
								@foreach($pendingCompanies as $company)
								<tr class="c-table-compact__tr">
									<td class="c-table-compact__td">
										<a href="{{ route('admin.companies.show', $company) }}" class="c-table-compact__link">{{ $company->company_name }}</a>
									</td>
									<td class="c-table-compact__td">{{ $company->user->name }}</td>
									<td class="c-table-compact__td">
										<form action="{{ route('admin.companies.approve', $company) }}" method="POST" style="display: inline;">
											@csrf
											<button type="submit" class="e-button e-button--small e-button--bordered">Approve</button>
										</form>
									</td>
								</tr>
								@endforeach
							</tbody>
						</table>
					</div>
				</div>
				@endif

			</div>
		</div>

	</div>

@endsection
