<div class="c-drop-element" element-id="video">

    @include('partials.drop-elements.add-element')

    <div class="c-drop-element__head js-sort-handle">
        <p class="c-drop-element__title">Video<p>
        <div class="c-drop-element__sort-button">
            @svg('move')
        </div>
        <div class="c-drop-element__delete-button js-remove-element">
            @svg('delete')
        </div>
    </div>
    <div class="c-drop-element__content c-drop-element__content--inline-spacing">
        <div class="e-form__field-wrap">
            <label class="e-form__label" for="btw-id">Youtube/Vimeo link</label>
            <input class="e-form__input" id="btw-id" type="text" placeholder="https://www.youtube.com/{ID}" />
        </div>
    </div>
</div>