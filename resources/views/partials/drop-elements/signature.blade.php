<div class="c-drop-element" element-id="signature">

    @include('partials.drop-elements.add-element')
    
    <div class="c-drop-element__head js-sort-handle">
        <p class="c-drop-element__title">Handtekening<p>
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
Ik hoop u hiermee voldoende geïnformeerd te hebben.

Met vriendelijke groet,

Stijn Belmans

Revaio B.V.
www.revaio.com
E: stijn@revaio.com
T: 012345678</textarea>
    </div>
</div>