@extends('app-template')

@section('content')
                
<div class="e-center-frame__frame">

    <div class="c-quote">

        <div class="c-quote__header">
            <div class="c-quote__header__left">
                <h1 class="c-quote__title">
                    {{-- DEV Note: if invoice > change the quote data to the invoice data --}}
                    Offerte
                    <span class="c-quote__number">#233123321</span>
                </h1>
                <p class="c-quote__subtitle">Kenmerk <span class="c-quote__note">#233123321</span></p>
            </div>
            <div class="c-quote__header__right">
                <img class="c-quote__company-logo" src="/images/revaio-logo.png" />
                <ul class="c-quote__company-data">
                    <li class="c-quote__company-data__item">Revaio B.V.</li>
                    <li class="c-quote__company-data__item">Huidevetterstraat</li>
                    <li class="c-quote__company-data__item">2300 Turnhout</li>
                    <li class="c-quote__company-data__item">België</li>
                    <li class="c-quote__company-data__divider"></li>
                    <li class="c-quote__company-data__item"><span>KVK</span> 123123123</li>
                    <li class="c-quote__company-data__item"><span>KVK</span> 0123991230</li>
                    <li class="c-quote__company-data__item"><span>BANK</span> BE02393812</li>
                </ul>
            </div>
        </div>

        <div class="c-quote__sub-header">
            <ul class="c-quote__client-data">
                <li class="c-quote__client-data__item c-quote__client-data__item--company">Revaio B.V.</li>
                <li class="c-quote__client-data__item">T.a.v. Stijn Belmans</li>
                <li class="c-quote__client-data__item">Huidevetterstraat</li>
                <li class="c-quote__client-data__item">2300 Turnhout</li>
                <li class="c-quote__client-data__item">België</li>
            </ul>
            <ul class="c-quote__quote-dates">
                <li class="c-quote__quote-dates__item">
                    Offertedatum <span>12-11-2022</span>
                </li>
                <li class="c-quote__quote-dates__item">
                    Offertedatum <span>12-11-2022</span>
                </li>
            </ul>
        </div>

        <div class="c-quote__content-sections">

            <section class="c-quote__section c-quote__section--text">
                <p>Geachte Stijn Belmans,</p>
                <p>Hierbij ontvangt u van mij de prijsopgave 233123321 voor de onderstaande diensten.</p>
                <h3>Consectetur elit</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eu sapien cursus, bibendum ex nec, congue felis. Quisque eget magna nec metus fermentum finibus. Etiam in consectetur massa. Aenean sit amet porta ipsum. Maecenas placerat, eros quis tincidunt egestas, mauris augue facilisis turpis, vel interdum ipsum sem sed sem.</p>
                <ul>
                    <li>Donec eu sapien cursus, bibendum ex nec, congue felis.</li>
                    <li>Quisque eget magna nec metus fermentum finibus.</li>
                    <li>Etiam in consectetur massa.</li>
                    <li>Mauris augue facilisis turpis, vel interdum ipsum sem sed sem.</li>
                </ul>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eu sapien cursus, bibendum ex nec, congue felis. Quisque eget magna nec metus fermentum finibus. <a href="">Etiam</a> in consectetur massa. Aenean sit amet porta ipsum. Maecenas placerat, eros quis tincidunt egestas, mauris augue facilisis turpis, vel interdum ipsum sem sed sem.</p>
            </section>

            <section class="c-quote__section">
                <iframe class="c-quote__iframe" width="560" height="315" src="https://www.youtube.com/embed/WKMVC9fkFhI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </section>

            <section class="c-quote__section">
                <h2 class="c-quote__section-title">Prijsopgave</h2>
                <table class="c-quote__price-table">
                    <thead class="c-quote__price-table__thead">
                        <tr class="c-quote__price-table__tr">
                            <th class="c-quote__price-table__td"></th>
                            <th class="c-quote__price-table__td">Omschrijving</th>
                            <th class="c-quote__price-table__td">Bedrag</th>
                            <th class="c-quote__price-table__td">Totaal</th>
                            <th class="c-quote__price-table__td">BTW</th>
                        </tr>
                    </thead>
                    <tbody class="c-quote__price-table__tbody">
                        <tr class="c-quote__price-table__tr">
                            <td class="c-quote__price-table__td">20 x</td>
                            <td class="c-quote__price-table__td">Een link op een startpagina gedurende 30 maanden.</td>
                            <td class="c-quote__price-table__td">€ 49</td>
                            <td class="c-quote__price-table__td">€ 980</td>
                            <td class="c-quote__price-table__td">21%</td>
                        </tr>
                        <tr class="c-quote__price-table__tr">
                            <td class="c-quote__price-table__td">1 x</td>
                            <td class="c-quote__price-table__td">Artikel schrijven</td>
                            <td class="c-quote__price-table__td">€ 299</td>
                            <td class="c-quote__price-table__td">€ 290</td>
                            <td class="c-quote__price-table__td">21%</td>
                        </tr>
                    </tbody>
                    <tfoot class="c-quote__price-table__tfoot">
                        <tr class="c-quote__price-table__tr">
                            <td class="c-quote__price-table__td"></td>
                            <td class="c-quote__price-table__td"></td>
                            <td class="c-quote__price-table__td">Subtotaal</td>
                            <td class="c-quote__price-table__td">€ 1279</td>
                            <td class="c-quote__price-table__td"></td>
                        </tr>
                        <tr class="c-quote__price-table__tr">
                            <td class="c-quote__price-table__td"></td>
                            <td class="c-quote__price-table__td"></td>
                            <td class="c-quote__price-table__td">21% BTW</td>
                            <td class="c-quote__price-table__td">€ 268,90</td>
                            <td class="c-quote__price-table__td"></td>
                        </tr>
                        <tr class="c-quote__price-table__tr">
                            <td class="c-quote__price-table__td"></td>
                            <td class="c-quote__price-table__td"></td>
                            <td class="c-quote__price-table__td c-quote__price-table__td--bold">Totaal</td>
                            <td class="c-quote__price-table__td c-quote__price-table__td--bold">€ 1547,90</td>
                            <td class="c-quote__price-table__td"></td>
                        </tr>
                    </tfoot>
                </table>
            </section>

            <section class="c-quote__section c-quote__section--text">
                <p>Ik hoop u hiermee voldoende geïnformeerd te hebben.</p>
                <p>Met vriendelijke groet,</p>
                <p>Stijn Belmans</p>
                <p>Revaio B.V. <br />
                www.revaio.com <br />
                E: stijn@revaio.com <br />
                T: 012345678</p>
            </section>

        </div>

    </div>

</div>
	
@endsection