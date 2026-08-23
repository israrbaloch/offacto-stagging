<div class="c-drop-element" element-id="image">

    @include('partials.drop-elements.add-element')

    <div class="c-drop-element__head js-sort-handle">
        <p class="c-drop-element__title">Afbeelding<p>
        <div class="c-drop-element__sort-button">
            @svg('move')
        </div>
        <div class="c-drop-element__delete-button js-remove-element">
            @svg('delete')
        </div>
    </div>
    <div class="c-drop-element__content c-drop-element__content--inline-spacing-small">
        
        <div class="e-form__upload-area">
            <input class="e-form__upload-area-input" type="file" name="incoming-pdf" id="incoming-pdf" required="required" multiple="multiple"/>
            <div class="e-form__upload-area-text">
                <div class="e-form__upload-area-text-uploading">Uploading...</div>
                <div class="e-form__upload-area-text-default">Upload .png of .jpg bestand</div>
            </div>
        </div>

    </div>
</div>