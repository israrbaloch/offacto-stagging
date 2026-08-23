@props([
    'name',
    'label' => null,
    'accept' => null,
    'required' => false,
    'id' => null,
    'class' => '',
])

@php
    $id = $id ?? $name;
    $hasError = $errors->has($name);
@endphp

<div class="e-form__field-wrap e-form__field-wrap--file {{ $hasError ? 'e-form__field-wrap--error' : '' }} {{ $class }}">
    @if($label)
        <label class="e-form__label e-form__label--file" for="{{ $id }}">
            <span class="e-form__label-text">{{ $label }}</span>
            @if($required)
                <span class="e-form__label-required">*</span>
            @endif
        </label>
    @endif
    <div class="e-form__file-input-wrap">
        <input 
            class="e-form__file-input @error($name) e-form__input--error @enderror" 
            type="file"
            name="{{ $name }}"
            id="{{ $id }}"
            @if($accept) accept="{{ $accept }}" @endif
            @if($required) required @endif
            {{ $attributes->except(['class']) }}
        />
        <div class="e-form__file-display">
            <span class="e-form__file-button">Choose file</span>
            <span class="e-form__file-name">No file chosen</span>
        </div>
    </div>
    @error($name)
        <span class="e-form__error">{{ $message }}</span>
    @enderror
</div>

<style>
    .e-form__field-wrap--file {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
    }
    
    .e-form__label--file {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    
    .e-form__file-input-wrap {
        position: relative;
        width: 100%;
    }
    
    .e-form__file-input {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
    }
    
    .e-form__file-display {
        display: flex;
        align-items: center;
        border: 1px solid #E2E2E2;
        border-radius: 0.6rem;
        overflow: hidden;
        background: white;
    }
    
    .e-form__file-button {
        padding: 1.2rem 2rem;
        background: #f5f5f5;
        border-right: 1px solid #E2E2E2;
        color: #474747;
        font-size: 1.4rem;
        font-weight: 500;
        white-space: nowrap;
        cursor: pointer;
        transition: background 0.2s ease;
    }
    
    .e-form__file-input-wrap:hover .e-form__file-button {
        background: #e8e8e8;
    }
    
    .e-form__file-name {
        padding: 1.2rem 1.5rem;
        color: #999;
        font-size: 1.4rem;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .e-form__file-name--has-file {
        color: #11134E;
    }
    
    /* Override labels-inside styling for file inputs */
    .e-form__labels-inside .e-form__field-wrap--file {
        flex-direction: row;
        align-items: center;
    }
    
    .e-form__labels-inside .e-form__label--file {
        min-width: 13rem;
        max-width: 13rem;
        padding-right: 2rem;
    }
    
    .e-form__labels-inside .e-form__file-input-wrap {
        flex: 1;
    }
    
    @media (max-width: 767px) {
        .e-form__labels-inside .e-form__field-wrap--file {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .e-form__labels-inside .e-form__label--file {
            min-width: auto;
            max-width: none;
            padding-right: 0;
            margin-bottom: 0.5rem;
        }
    }
</style>

<script>
    (function() {
        var fileInput = document.getElementById('{{ $id }}');
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                var fileName = this.files.length > 0 ? this.files[0].name : 'No file chosen';
                var fileNameSpan = this.parentElement.querySelector('.e-form__file-name');
                if (fileNameSpan) {
                    fileNameSpan.textContent = fileName;
                    if (this.files.length > 0) {
                        fileNameSpan.classList.add('e-form__file-name--has-file');
                    } else {
                        fileNameSpan.classList.remove('e-form__file-name--has-file');
                    }
                }
            });
        }
    })();
</script>
