<section class="c-harmonica js-harmonica">

	<div class="c-harmonica__heading">
		<div class="c-harmonica__heading-icon">
			@svg('arrow-down')
		</div>
		<h2 class="c-harmonica__heading-title">Offertes (4)</h2>
	</div>

	<div class="c-harmonica__content">

		<div class="c-table">
			<div class="c-table__wrap">
				<div class="c-table__thead">
					<div class="c-table__thead-tr">

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
							Bedrag
						</div>
						<div class="c-table__thead-td c-table__thead-td--sortable">
							Status
						</div>
					</div>
				</div>

				<div class="c-table__tbody">

					@foreach(range(1, 4) as $i)
					<a href="/offerte" class="c-table__tr">
						<div class="c-table__td c-table__td--number">
							1231313213
						</div>
						<div class="c-table__td c-table__td--note">
							Geen kenmerk
						</div>
						<div class="c-table__td c-table__td--date">
							05-08-2022
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

	</div>
</section>