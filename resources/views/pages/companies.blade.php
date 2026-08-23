@extends('app')

@section('title', 'Companies')

@section('content')

	@include('partials.modals.add-company')
	@include('partials.modals.delete-company')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">Bedrijven</h1>
			<a class="e-button" open-modal-id="add-company">@svg('plus') Bedrijf toevoegen</a>
		</div>

		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
			</div>

			<div class="l-page-header__selection-actions">
				<button class="e-button e-button--bordered e-button--purple-dark" open-modal-id="delete-company">Verwijder</button>
			</div>

		</div>
	</div>

	<div class="l-page-content l-page-content--inline-spacing">

		<div class="e-note mb-40 mb-10--m">
			<div class="e-note__icon">
				@svg('info')
			</div>
			<p class="e-note__text">Heeft u meerdere bedrijven? Verzorg de administratie van al uw bedrijven eenvoudig met Offacto. Stel per bedrijf de huisstijl in zodat de offertes en facturen aansluiten op de identiteit van elk bedrijf.</p>
		</div>

		<div class="c-table">
			<div class="c-table__wrap">

				<div class="c-table__thead">
					<div class="c-table__thead-tr">

						<div class="c-table__thead-td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox js-select-all-checkboxes" type="checkbox" />
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>

						<div class="c-table__thead-td">
							Bedrijfsnaam
						</div>
						<div class="c-table__thead-td">
							Adresgegevens
						</div>
						<div class="c-table__thead-td">
							BTW
						</div>
						<div class="c-table__thead-td">
							Kleurcodes
						</div>
					</div>
				</div>

				<div class="c-table__tbody">

					@foreach(range(1, 2) as $i)
					<a href="/bedrijf" class="c-table__tr">
						<div class="c-table__td c-table__td--checkbox">
							<label class="e-form__checkbox-wrap">
								<input class="e-form__checkbox" type="checkbox"/>
								<span class="e-form__checkbox-label"></span>
							</label>
						</div>
						<div class="c-table__td c-table__td--company-name">
							<img class="c-table__company-image" src="/images/revaio.png" />
							<p class="c-table__company-name">Revaio B.V.</p>
						</div>
						<div class="c-table__td c-table__td--note">
							Huidevettersstraat 13/3, 2300 Turnhout (BE)
						</div>
						<div class="c-table__td">
							BE 0772.796.426
						</div>
						<div class="c-table__td c-table__td--company-colors">
							<p class="c-table__company-color"><span style="background-color:#FE835C;"></span> #FE835C</p>
							<p class="c-table__company-color"><span style="background-color:#474747;"></span> #474747</p>
						</div>
					</a>
					@endforeach

				</div>

			</div>

		</div>
	</div>

@endsection