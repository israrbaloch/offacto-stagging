<div class="e-modal e-modal--overflow e-modal--900" modal-id="add-hours-to-invoice">

	<div class="e-modal__wrap">

		<div class="e-modal__before-modal">
		</div>

		<div class="e-modal__modal">

			<div class="e-modal__close js-close-modal">
				@svg('close')
			</div>

			<div class="e-modal__section">
				<div class="c-table">
					<div class="c-table__wrap c-table__wrap--auto-width">

						<div class="c-table__thead">
							<div class="c-table__thead-tr">

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

							@foreach(range(1, 3) as $i)
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
									Stijn Belmans
								</div>
								<div class="c-table__td">
									Linkbuilding Revaio website
								</div>
								<div class="c-table__td c-table__td--status">
									<div class="e-label e-label--open">Open</div>
								</div>
							</div>
							@endforeach

						</div>
						
					</div>
				</div>
			</div>

			<div class="e-modal__section">
				<a href="" class="e-button">Toevoegen</a>
			</div>

		</div>

		<div class="e-modal__after-modal">
			<p class="e-modal__close-link js-close-modal">Annuleren</p>
		</div>

	</div>

	<div class="e-modal__bg js-close-modal"></div>
</div>