<div class="c-bottom-bar">
    <a class="c-bottom-bar__left-button e-link e-link--white" href="/offertes">@svg('cross') Annuleren</a>
    <div class="c-bottom-bar__nav hide-to-viewport-t">
        {{-- DEV Note:
        - If item is finished, add class 'c-bottom-bar__item--finished'
        - If item is current, add class 'c-bottom-bar__item--active'
        --}}
        <a href="/offerte-toevoegen" class="c-bottom-bar__item c-bottom-bar__item--finished">
            <div class="c-bottom-bar__item-number">
                1
               <div class="c-bottom-bar__item-check">
                    @svg('check')
                </div>
            </div>
            <div class="c-bottom-bar__item-content">
                <p class="c-bottom-bar__item-title">De ontvanger</p>
                <p class="c-bottom-bar__item-desc" >Selecteer een contact</p> {{-- DEV Note: If contact is selected, change text to the name of selected contact --}}
            </div>
        </a>
        <a href="/offerte-toevoegen/stap-2" class="c-bottom-bar__item c-bottom-bar__item--active">
            <div class="c-bottom-bar__item-number">
                2
                <div class="c-bottom-bar__item-check">
                    @svg('check')
                </div>
            </div>
            <div class="c-bottom-bar__item-content">
                {{-- DEV Note: If invoice change "Offerte" to "Factuur" --}}
                <p class="c-bottom-bar__item-title">De offerte</p>
                <p class="c-bottom-bar__item-desc" >Inhoud van de offerte</p>
            </div>
        </a>
        <a href="/offerte-toevoegen/stap-3" class="c-bottom-bar__item">
            <div class="c-bottom-bar__item-number">
                3
                <div class="c-bottom-bar__item-check">
                    @svg('check')
                </div>
            </div>
            <div class="c-bottom-bar__item-content">
                <p class="c-bottom-bar__item-title">Verzenden</p>
                <p class="c-bottom-bar__item-desc" >Template en verzenden</p>
            </div>
        </a>
    </div>
    <a class="c-bottom-bar__right-button e-button e-button--white e-button--bordered e-button--icon-after" href="/offerte-toevoegen/stap-3" >Volgende @svg('arrow-right')</a>
    {{-- DEV Note: If last step, show 'send' button
        <a class="c-bottom-bar__right-button e-button e-button--blue" href="#" >@svg('send') Verzenden</a>
     --}}
     
 </div>