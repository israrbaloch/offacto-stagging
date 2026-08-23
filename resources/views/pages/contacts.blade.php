@extends('app')

@section('title', 'Contacts')

@section('content')

	@include('partials.modals.add-contact')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Contacten</h1>
			<a class="e-button" open-modal-id="add-contact">@svg('plus') Contact</a>
		</div>

		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
				@include('partials.elements.search-contacts-small')
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
							Bedrijfsnaam
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Contact
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Facturen
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Offertes
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Totale omzet
						</div>
					</div>
				</div>

				<div class="c-table__tbody">

					@foreach(range(1, 10) as $i)
					<a href="/contact" class="c-table__tr">
						<div class="c-table__td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox"/>
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>
						<div class="c-table__td">
							Revaio B.V.
						</div>
						<div class="c-table__td">
							Stijn Belmans
						</div>
						<div class="c-table__td">
							12
						</div>
						<div class="c-table__td">
							3
						</div>
						<div class="c-table__td">
							€ 1900,-
						</div>
					</a>
					@endforeach

				</div>

			</div>
		</div>

		@include('partials.elements.pagination')

	</div>

@endsection