@extends('app')

@section('title', 'Subscription')

@section('content')

	@include('partials.modals.add-contact')

	<div class="l-page-header">

		<div class="l-page-header__left-wrap">
			<h1 class="l-page-header__title">
				Abonnement
			</h1>
		</div>

		<div class="l-page-header__right-wrap">
			<div class="l-page-header__right-content">
			</div>

			<div class="l-page-header__selection-actions">
				<button class="e-button e-button--bordered e-button--purple-dark">Automatisch verlengen stopzetten</button>
			</div>

		</div>

	</div>

	<div class="l-page-content">

		<div class="l-page-content--inline-spacing mb-40">

			{{-- DEV NOTE: Show message if payment is not activated --}}
			<div class="e-note e-note--vertical-align e-note--alert mb-40 mb-10--m">
				<div class="e-note__icon">
					@svg('attention')
				</div>
				<p class="e-note__text">Je hebt Mollie automatisch incasso nog niet geactiveerd voor Offacto. Ga naar de instellingen van het bedrijf om automatisch incasso te activeren.</p>
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
								Bedrijf
							</div>
							<div class="c-table__thead-td">
								Afgesloten op
							</div>
							<div class="c-table__thead-td">
								Verlenging
							</div>
							<div class="c-table__thead-td">
								Subtotaal p/mnd
							</div>
							<div class="c-table__thead-td">
								21% BTW
							</div>
							<div class="c-table__thead-td">
								Totaal p/mnd
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
								{{-- DEV NOTE: Show icon if payment is not activated --}}
								<p class="c-table__company-name">Revaio B.V. @svg('attention')</p>
							</div>
							<div class="c-table__td">
								12-08-2022
							</div>
							<div class="c-table__td">
								Verloopt op 12-08-2023
							</div>
							<div class="c-table__td c-table__td--company-colors">
								€ 9,95
							</div>
							<div class="c-table__td c-table__td--company-colors">
								€ 2,09
							</div>
							<div class="c-table__td c-table__td--company-colors">
								€ 12,04
							</div>
						</a>
						@endforeach

					</div>

				</div>
			</div>
		</div>

		<section class="c-harmonica c-harmonica--always-open c-harmonica--border-top">

			<div class="c-harmonica__heading">
				<div class="c-harmonica__heading-icon">
					@svg('arrow-down')
				</div>
				<h2 class="c-harmonica__heading-title">Facturen (3)</h2>
			</div>

			<div class="c-harmonica__content">

				<div class="c-table">
					<div class="c-table__wrap">

						<div class="c-table__thead">
							<div class="c-table__thead-tr">
								<div class="c-table__thead-td">
									Factuurnummer
								</div>
								<div class="c-table__thead-td">
									Factuurdatum
								</div>
								<div class="c-table__thead-td">
									Bedrijf
								</div>
								<div class="c-table__thead-td">
									Periode
								</div>
								<div class="c-table__thead-td">
									Bedrag
								</div>
								<div class="c-table__thead-td">
									
								</div>
							</div>
						</div>

						<div class="c-table__tbody">

							@foreach(range(1, 3) as $i)
							<div class="c-table__tr">
								<div class="c-table__td c-table__td--number">
									1231313213
								</div>
								<div class="c-table__td c-table__td--note">
									05-08-2022
								</div>
								<div class="c-table__td c-table__td--date">
									Revaio B.V.
								</div>
								<div class="c-table__td c-table__td--costs">
									12-08-2022 t/m 12-09-2022
								</div>
								<div class="c-table__td c-table__td--costs">
									€ 12,04
								</div>
								<div class="c-table__td c-table__td--status">
									<a class="e-button e-button--bordered href="">Download PDF</a>
								</div>
							</div>
							@endforeach

						</div>

					</div>
				</div>

			</div>
		</section>

	</div>

@endsection