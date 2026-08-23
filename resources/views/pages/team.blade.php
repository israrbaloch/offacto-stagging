@extends('app')

@section('title', 'Team')

@section('content')

	@include('partials.modals.add-team-member')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Team</h1>
			<a class="e-button" open-modal-id="add-team-member">@svg('plus') Teamlid toevoegen</a>
		</div>

		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
			</div>

			<div class="l-page-header__selection-actions">
				<button class="e-button e-button--bordered e-button--purple-dark" open-modal-id="add-team-member">Wijzigen</button>
				<button class="e-button e-button--bordered e-button--purple-dark">Wachtwoord wijzigen e-mail</button>
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
							Naam
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Toegang tot bedrijven
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							E-mail
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Rol
						</div>
					</div>
				</div>

				<div class="c-table__tbody">

					@foreach(range(1, 5) as $i)
					<a class="c-table__tr">
						<div class="c-table__td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox"/>
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>
						<div class="c-table__td c-table__td--number">
							Stijn Belmans
						</div>
						<div class="c-table__td c-table__td--note">
							Revaio B.V., Offacto
						</div>
						<div class="c-table__td c-table__td--date">
							stijn@revaio.com
						</div>
						<div class="c-table__td c-table__td--contact">
							Admin
						</div>
					</a>
					@endforeach

				</div>

			</div>
		</div>

	</div>

@endsection