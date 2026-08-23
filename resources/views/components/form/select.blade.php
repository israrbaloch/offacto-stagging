@props([
    'name',
    'label' => null,
    'options' => [],
    'value' => null,
    'required' => false,
    'id' => null,
    'placeholder' => null,
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
    <div class="e-form__select-wrap">
        <select 
            class="e-form__select @error($name) e-form__select--error @enderror" 
            name="{{ $name }}"
            id="{{ $id }}"
            @if($required) required @endif
            {{ $attributes->except(['class']) }}
        >
            @if($placeholder)
                <option value="">{{ $placeholder }}</option>
            @endif
            @if(count($options) > 0)
                @foreach($options as $optionValue => $optionLabel)
                    @if(is_array($optionLabel))
                        <optgroup label="{{ $optionValue }}">
                            @foreach($optionLabel as $subValue => $subLabel)
                                <option value="{{ $subValue }}" {{ $value == $subValue ? 'selected' : '' }}>
                                    {{ $subLabel }}
                                </option>
                            @endforeach
                        </optgroup>
                    @else
                        <option value="{{ $optionValue }}" {{ $value == $optionValue ? 'selected' : '' }}>
                            {{ $optionLabel }}
                        </option>
                    @endif
                @endforeach
            @else
                <option value="">No options available</option>
            @endif
        </select>
    </div>
    @error($name)
        <span class="e-form__error">{{ $message }}</span>
    @enderror
</div>
