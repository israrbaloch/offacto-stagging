<div class="c-drop-element" element-id="price-table">

    @include('partials.drop-elements.add-element')

    <div class="c-drop-element__head js-sort-handle">
        <p class="c-drop-element__title">Prijstabel (standaard)<p>
        <div class="c-drop-element__sort-button">
            @svg('move')
        </div>
        <div class="c-drop-element__delete-button js-remove-element">
            @svg('delete')
        </div>
    </div>
    <div class="c-drop-element__content">

        <div class="c-drop-element__price-table-wrap">

            <div class="c-drop-element__price-table">

                <div class="c-drop-element__price-table-head">
                    <div class="c-drop-element__price-table-cell">
                    </div>
                    <div class="c-drop-element__price-table-cell">
                        Omschrijving
                    </div>
                    <div class="c-drop-element__price-table-cell">
                        Bedrag
                    </div>
                    <div class="c-drop-element__price-table-cell">
                        Totaal
                    </div>
                    <div class="c-drop-element__price-table-cell">
                        BTW
                    </div>
                </div>

                <div class="c-drop-element__price-table-body">

                    <div class="c-drop-element__price-table-row">
                        <div class="c-drop-element__price-table-cell c-drop-element__price-table-cell--amount">
                            <input class="e-form__input e-form__input--small" type="text" value="1 x"/>
                        </div>
                        <div class="c-drop-element__price-table-cell">
                            <textarea class="e-form__textarea e-form__textarea--small" placeholder="..."></textarea>
                        </div>
                        <div class="c-drop-element__price-table-cell c-drop-element__price-table-cell--price">
                            <input class="e-form__input e-form__input--small" type="text" value="€ 0"/>
                        </div>
                        <div class="c-drop-element__price-table-cell">
                            € 0
                        </div>
                        <div class="c-drop-element__price-table-cell c-drop-element__price-table-cell--tax">
                            <div class="e-form__select-wrap">
                                <select class="e-form__select e-form__select--w100 e-form__select--small">
                                    <option>Excl. 21%</option>
                                    <option>Excl. 9%</option>
                                    <option>Excl. 0%</option>
                                    <option>Incl. 21%</option>
                                    <option>Incl. 9%</option>
                                    <option>Incl. 0%</option>
                                </select>
                            </div>
                            <div class="c-drop-element__price-table-cell-delete js-delete-price-table-row">@svg('delete')</div>
                        </div>
                    </div>

                </div>

            </div>

            <div class="c-drop-element__price-table-foot">
                <div class="c-drop-element__price-table-foot-left">
                    <div class="e-button e-button--purple-light js-add-price-table-row">@svg('plus') Item toevoegen</div>
                    {{-- DEV Note: Timesheet selection is only avaible if it's an invoice --}}
                    <div class="e-link e-link--purple-light e-link--iconx16" open-modal-id="add-hours-to-invoice">@svg('clock') Werkuren toevoegen</div>
                </div>
                <div class="c-drop-element__price-table-foot-right">
                    <div class="c-drop-element__price-table-summary">
                        <div class="c-drop-element__price-table-summary-item"><span>Subtotaal</span> € 0</div>
                        <div class="c-drop-element__price-table-summary-item"><span>21% BTW</span> € 0 </div>
                        <div class="c-drop-element__price-table-summary-item c-drop-element__price-table-summary-item-total"><span>Totaal</span> € 0</div>
                    </div>
                </div>
            </div>

        </div>

    </div>
</div>