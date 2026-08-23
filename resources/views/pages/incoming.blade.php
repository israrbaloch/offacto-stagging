@extends('app')

@section('title', 'Incoming')

@section('content')

	@include('partials.modals.add-incoming')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Inkomend</h1>
			<a class="e-button" open-modal-id="add-incoming">@svg('plus') Inkomend toevoegen</a>
		</div>

		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">

				<div class="c-stats-summary">
					<div class="c-stats-summary__icon">
						@svg('stats')
					</div>
					<ul class="c-stats-summary__list">
						<li class="c-stats-summary__list-item">
							<span>€ 0</span> concept
						</li>
						<li class="c-stats-summary__list-item">
							<span>€ 13.000</span> betaald
						</li>
					</ul>
				</div>
			</div>

			<div class="l-page-header__selection-actions">
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
							Factuur kenmerk
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Type
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
					<a href="/inkoop-factuur" class="c-table__tr">
						<div class="c-table__td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox"/>
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>
						<div class="c-table__td c-table__td--number">
							CK98213981
						</div>
						<div class="c-table__td c-table__td--note">
							Factuur
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
							<div class="e-label e-label--payed">Betaald</div>
						</div>
					</a>
					@endforeach

				</div>

			</div>
		</div>

		@include('partials.elements.pagination')

	</div>

@endsection