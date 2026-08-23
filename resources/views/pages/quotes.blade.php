@extends('app')

@section('title', 'Quotes')

@section('content')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Offertes</h1>
			<a class="e-button" href="/offerte-toevoegen">@svg('plus') Offerte toevoegen</a>
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
							<span>€ 0</span> open
						</li>
						<li class="c-stats-summary__list-item">
							<span>€ 13.000</span> geaccepteerd
						</li>
						<li class="c-stats-summary__list-item">
							<span>€ 2.000</span> gefactureerd
						</li>
					</ul>
				</div>
			</div>

			<div class="l-page-header__selection-actions">
				<button class="e-button e-button--bordered e-button--purple-dark">Factureer</button>
				<button class="e-button e-button--bordered e-button--purple-dark">Dupliceer</button>
				<button class="e-button e-button--bordered e-button--purple-dark">Archiveer</button>
				<button class="e-button e-button--bordered e-button--purple-dark">Verwijder</button>
			</div>

		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing l-page-content--has-table">

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
							Offertenummer
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Kenmerk
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Datum
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Contact
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Bedrag
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Status
						</div>
					</div>
				</div>

				<div class="c-table__tbody">

					@foreach(range(1, 10) as $i)
					<a href="/offerte" class="c-table__tr">
						<div class="c-table__td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox"/>
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>
						<div class="c-table__td c-table__td--number">
							1231313213
						</div>
						<div class="c-table__td c-table__td--note">
							Geen kenmerk
						</div>
						<div class="c-table__td c-table__td--date">
							05-08-2022
						</div>
						<div class="c-table__td c-table__td--contact">
							Revaio B.V.
						</div>
						<div class="c-table__td c-table__td--costs">
							€ 1900,-
						</div>
						<div class="c-table__td c-table__td--status">
							<div class="e-label e-label--open">Openstaand</div>
						</div>
					</a>
					@endforeach

				</div>
				
			</div>
		</div>

		@include('partials.elements.pagination')

	</div>

@endsection