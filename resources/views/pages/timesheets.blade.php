@extends('app')

@section('title', 'Timesheets')

@section('content')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Uren</h1>
			<a class="e-button" href="/offerte-toevoegen">@svg('plus') Uren toevoegen</a>
		</div>

		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">

				@include('partials.elements.search-contacts-small')

				@include('partials.elements.filter-date')

				<div class="c-stats-summary">
					<div class="c-stats-summary__icon">
						@svg('stats')
					</div>
					<ul class="c-stats-summary__list">
						<li class="c-stats-summary__list-item">
							<span>230</span> openstaand
						</li>
						<li class="c-stats-summary__list-item">
							<span>321</span> gefactureerd
						</li>
					</ul>
				</div>
			</div>

			<div class="l-page-header__selection-actions">
				<button class="e-button e-button--bordered e-button--purple-dark">Factureer</button>
				<button class="e-button e-button--bordered e-button--purple-dark">Verwijder</button>
			</div>

		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		<div class="c-table">
			<div class="c-table__wrap">

				<div class="c-table__thead">
					<div class="c-table__thead-tr">

						{{-- 
							DEV NOTE:
								- If thead-td is sortable, add class 'c-table__thead-td--sortable'
								- If thead-td is sorted, add class 'c-table__thead-td--sorted'
								- If thead-td sorted DESC, add class 'c-table__thead-td--sorted--desc'
								Example: class="c-table__thead-td c-table__thead-td--sortable c-table__thead-td--sorted c-table__thead-td--sorted--desc"
						--}}

						<div class="c-table__thead-td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox js-select-all-checkboxes" type="checkbox" />
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>

						<div class="c-table__thead-td c-table__thead-td--sortable c-table__thead-td--sorted">
							Uren
						</div>
						<div class="c-table__thead-td">
							Van/Tot
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Contact
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Gebruiker
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Notitie
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Status
						</div>
					</div>
				</div>

				<div class="c-table__tbody">

					@foreach(range(1, 10) as $i)
					<div class="c-table__tr">
						<div class="c-table__td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox"/>
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>
						<div class="c-table__td c-table__td--clocked-hours">
							@svg('clock')
							04:30
						</div>
						<div class="c-table__td c-table__td--clocked-time">
							<p class="c-table__clocked-time-text">10:30 <span>| 12-07-2022</span></p>
							<p class="c-table__clocked-time-text">14:30 <span>| 12-07-2022</span></p>
						</div>
						<div class="c-table__td">
							Revaio B.V.
						</div>
						<div class="c-table__td">
							Stijn Belmans
						</div>
						<div class="c-table__td">
							Linkbuilding Revaio website
						</div>
						<div class="c-table__td c-table__td--status">
							<div class="e-label e-label--billed">Gefactureerd</div>
						</div>
					</div>
					@endforeach

				</div>
				
			</div>
		</div>

		@include('partials.elements.pagination')

	</div>

@endsection