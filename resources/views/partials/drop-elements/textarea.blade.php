<div class="c-drop-element" element-id="textarea">

    @include('partials.drop-elements.add-element')

    <div class="c-drop-element__head js-sort-handle">
        <p class="c-drop-element__title">Tekstveld<p>
        <div class="c-drop-element__sort-button">
            @svg('move')
        </div>
        <div class="c-drop-element__delete-button js-remove-element">
            @svg('delete')
        </div>
    </div>
    <div class="c-drop-element__content">
        {{-- DEV Note: This textarea needs to be a TinyMCE wysiwyg editor --}}
        <textarea class="c-drop-element__textarea js-textarea--auto-height">
Geachte Stijn Belmans,

Hierbij ontvangt u van mij de prijsopgave {document.estimate_id} voor de onderstaande diensten.</textarea>
    </div>
</div>