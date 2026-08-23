@extends('app-add')

@section('content')

{{-- DEV Note: If invoice, change text "Offerte" to "Factuur" --}}
<h1 class="c-add-frame__title">Inhoud van de offerte</h1>

<a href="/offerte" class="c-add-frame__fixed-button e-button e-button--purple">@svg('eye') Voorbeeld</a>
                
<div class="e-center-frame__frame">

    <div class="c-drag-drop">
        
        <div class="c-drag-drop__drop-area-wrap">

            {{-- All elements hidden to get the HTML of each element with javascript--}}
            <div class="c-drag-drop__hidden-elements">
                @include('partials.drop-elements.textarea')
                @include('partials.drop-elements.price-table')
                @include('partials.drop-elements.video')
                @include('partials.drop-elements.image')
                @include('partials.drop-elements.signature')
            </div>

            {{-- The area with added elements --}}
            <div class="c-drag-drop__drop-area">
            
                @include('partials.drop-elements.textarea')

                @include('partials.drop-elements.price-table')

                @include('partials.drop-elements.signature')

            </div>

        </div>
    </div>

</div>

<div class="e-center-frame__after-frame e-center-frame__after-frame--spacing-top">
    <a href="/offerte" class="e-button e-button--white e-button--bordered">Voorbeeld</a>
    <a href="/offerte-toevoegen/stap-3" class="e-button e-button--white e-button--bordered e-button--icon-after">Volgende @svg('arrow-right')</a>
</div>

	
@endsection