<section class="c-harmonica js-harmonica">

	<div class="c-harmonica__heading">
		<div class="c-harmonica__heading-icon">
			@svg('arrow-down')
		</div>
		<h2 class="c-harmonica__heading-title">Uren</h2>
	</div>

	<div class="c-harmonica__content">

		<div class="c-table">
			<div class="c-table__wrap">

				<div class="c-table__thead">
					<div class="c-table__thead-tr">

						<div class="c-table__thead-td c-table__thead-td--sortable c-table__thead-td--sorted">
							Uren
						</div>
						<div class="c-table__thead-td">
							Van/Tot
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

					@foreach(range(1, 8) as $i)
					<a href="#" class="c-table__tr">
						<div class="c-table__td c-table__td--clocked-hours">
							@svg('clock')
							04:30
						</div>
						<div class="c-table__td c-table__td--clocked-time">
							<p class="c-table__clocked-time-text">10:30 <span>| 12-07-2022</span></p>
							<p class="c-table__clocked-time-text">14:30 <span>| 12-07-2022</span></p>
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
					</a>
					@endforeach

				</div>
				
			</div>
		</div>

	</div>
</section>