@props([
    'name',
    'label' => null,
    'value' => null,
    'placeholder' => null,
    'required' => false,
    'rows' => 4,
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
    <textarea 
        class="e-form__textarea @error($name) e-form__textarea--error @enderror" 
        name="{{ $name }}"
        id="{{ $id }}"
        rows="{{ $rows }}"
        @if($placeholder) placeholder="{{ $placeholder }}" @endif
        @if($required) required @endif
        {{ $attributes->except(['class']) }}
    >{{ $value }}</textarea>
    @error($name)
        <span class="e-form__error">{{ $message }}</span>
    @enderror
</div>
