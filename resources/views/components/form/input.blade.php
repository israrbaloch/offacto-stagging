@props([
    'name',
    'label' => null,
    'type' => 'text',
    'value' => null,
    'placeholder' => null,
    'required' => false,
    'id' => null,
    'class' => '',
])

@php
    $id = $id ?? $name;
    $value = old($name, $value);
    $hasError = $errors->has($name);
@endphp

<div class="e-form__field-wrap {{ $hasError ? 'e-form__field-wrap--error' : '' }} {{ $class }}">
    @if($label)
        <label class="e-form__label" for="{{ $id }}">
            <span class="e-form__label-text">{{ $label }}</span>
            @if($required)
                <span class="e-form__label-required" style="color: #ff0000;">*</span>
            @endif
        </label>
    @endif
    <input 
        class="e-form__input @error($name) e-form__input--error @enderror" 
        type="{{ $type }}"
        name="{{ $name }}"
        id="{{ $id }}"
        value="{{ $value }}"
        @if($placeholder) placeholder="{{ $placeholder }}" @endif
        @if($required) required @endif
        {{ $attributes->except(['class']) }}
    />
    @error($name)
        <span class="e-form__error">{{ $message }}</span>
    @enderror
</div>
