@extends('app-add')

@section('content')
            
<h1 class="c-add-frame__title">Kies de ontvanger</h1>

<div class="e-center-frame__frame e-center-frame__frame--560">

    <div class="e-modal__section">
        <h2 class="e-modal__title">Contact toevoegen</h2>
        <p class="e-modal__desc">We zoeken eerst door je contacten. Kunnen we niks vinden? Dan zoeken we in de KVK database.</p>
        @include('partials.elements.search-contacts')
        @include('partials.elements.search-contacts-results')
    </div>

</div>
	
@endsection