@props([
    'name',
    'label' => null,
    'value' => '#000000',
    'required' => false,
    'id' => null,
    'class' => '',
])

@php
    $id = $id ?? $name;
    $colorId = $id . '_color';
    $textId = $id . '_text';
    $value = old($name, $value);
    $hasError = $errors->has($name);
@endphp

<div class="e-form__field-wrap {{ $hasError ? 'e-form__field-wrap--error' : '' }} {{ $class }}">
    @if($label)
        <label class="e-form__label" for="{{ $colorId }}">
            <span class="e-form__label-text">{{ $label }}</span>
            @if($required)
                <span class="e-form__label-required" style="color: #ff0000;">*</span>
            @endif
        </label>
    @endif
    <div class="e-form__input-color-wrap">
        <input 
            type="color"
            id="{{ $colorId }}"
            value="{{ $value }}"
            class="e-form__input-color-picker"
            title="Click to pick a color"
        />
        <span class="e-form__input-color-sample" style="background-color: {{ $value }};"></span>
        <input 
            class="e-form__input e-form__input--color @error($name) e-form__input--error @enderror" 
            type="text"
            name="{{ $name }}"
            id="{{ $textId }}"
            value="{{ $value }}"
            placeholder="#000000"
            pattern="^#[0-9A-Fa-f]{6}$"
            @if($required) required @endif
            {{ $attributes->except(['class']) }}
        />
    </div>
    @error($name)
        <span class="e-form__error">{{ $message }}</span>
    @enderror
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('{{ $colorId }}');
    const textInput = document.getElementById('{{ $textId }}');
    const colorSample = document.querySelector('#{{ $textId }}').previousElementSibling;
    
    if (colorPicker && textInput) {
        // Update text input when color picker changes
        colorPicker.addEventListener('input', function() {
            textInput.value = this.value;
            if (colorSample) {
                colorSample.style.backgroundColor = this.value;
            }
        });
        
        // Update color picker when text input changes
        textInput.addEventListener('input', function() {
            if (/^#[0-9A-Fa-f]{6}$/i.test(this.value)) {
                colorPicker.value = this.value;
                if (colorSample) {
                    colorSample.style.backgroundColor = this.value;
                }
            }
        });
    }
});
</script>
