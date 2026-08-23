@props([
    'name' => 'color_scheme',
    'label' => 'Color Scheme',
    'value' => null,
    'required' => false,
    'id' => null,
    'class' => '',
    'companySettings' => null,
])

@php
    $id = $id ?? $name;
    $value = old($name, $value);
    $hasError = $errors->has($name);
    
    // Define predefined color schemes (high contrast for better visibility)
    $colorSchemes = [
        [
            'id' => 'scheme_default',
            'primary' => null,
            'secondary' => null,
            'name' => 'Default',
            'is_default' => true
        ],
        [
            'id' => 'scheme_1',
            'primary' => '#000000',
            'secondary' => '#FFFFFF',
            'name' => 'Black & White',
            'is_default' => false
        ],
        [
            'id' => 'scheme_2',
            'primary' => '#003366',
            'secondary' => '#FFD700',
            'name' => 'Navy & Gold',
            'is_default' => false
        ],
        [
            'id' => 'scheme_3',
            'primary' => '#8B0000',
            'secondary' => '#00CED1',
            'name' => 'Dark Red & Cyan',
            'is_default' => false
        ],
        [
            'id' => 'scheme_4',
            'primary' => '#006400',
            'secondary' => '#FF00FF',
            'name' => 'Dark Green & Magenta',
            'is_default' => false
        ],
        [
            'id' => 'scheme_5',
            'primary' => '#4B0082',
            'secondary' => '#00FF00',
            'name' => 'Indigo & Lime',
            'is_default' => false
        ],
        [
            'id' => 'scheme_6',
            'primary' => '#1C1C1C',
            'secondary' => '#FF4500',
            'name' => 'Charcoal & Orange',
            'is_default' => false
        ],
    ];
    
    // Determine selected scheme based on current theme colors
    $selectedSchemeId = $value;
    
    // If no value provided, try to match current theme colors to a scheme
    if (!$selectedSchemeId && $companySettings) {
        $theme = is_string($companySettings->theme) ? json_decode($companySettings->theme, true) : $companySettings->theme;
        
        // If theme is empty or null, it means default is selected
        if (empty($theme) || empty($theme['primary']) || empty($theme['secondary'])) {
            $selectedSchemeId = 'scheme_default';
        } else {
            // Try to match to a color scheme
            foreach ($colorSchemes as $scheme) {
                if (!$scheme['is_default'] && 
                    strtoupper($scheme['primary']) === strtoupper($theme['primary']) && 
                    strtoupper($scheme['secondary']) === strtoupper($theme['secondary'])) {
                    $selectedSchemeId = $scheme['id'];
                    break;
                }
            }
            // If no match found, it's a custom color, so keep default selected
            if (!$selectedSchemeId) {
                $selectedSchemeId = 'scheme_default';
            }
        }
    }
    
    // If still no selection, default to default scheme
    if (!$selectedSchemeId) {
        $selectedSchemeId = 'scheme_default';
    }
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
    
    <div class="e-form__color-scheme-list" id="color-scheme-list-{{ $id }}">
        @foreach($colorSchemes as $scheme)
            <div class="e-form__color-scheme-item {{ $selectedSchemeId === $scheme['id'] ? 'e-form__color-scheme-item--selected' : '' }} {{ $scheme['is_default'] ? 'e-form__color-scheme-item--default' : '' }}" 
                 data-scheme-id="{{ $scheme['id'] }}"
                 data-primary="{{ $scheme['primary'] ?? '' }}"
                 data-secondary="{{ $scheme['secondary'] ?? '' }}"
                 data-scheme-name="{{ $scheme['name'] }}"
                 data-is-default="{{ $scheme['is_default'] ? 'true' : 'false' }}">
                @if($scheme['is_default'])
                    <div class="e-form__color-scheme-swatch e-form__color-scheme-swatch--default">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="#EF6B6B" stroke-width="2"/>
                            <path d="M8 8L16 16M16 8L8 16" stroke="#EF6B6B" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                @else
                    <div class="e-form__color-scheme-swatch">
                        <div class="e-form__color-scheme-swatch-top" style="background-color: {{ $scheme['primary'] }};"></div>
                        <div class="e-form__color-scheme-swatch-bottom" style="background-color: {{ $scheme['secondary'] }};"></div>
                    </div>
                @endif
                <span class="e-form__color-scheme-name">{{ $scheme['name'] }}</span>
            </div>
        @endforeach
    </div>
    
    <!-- Hidden inputs to store the selected scheme and colors -->
    <input type="hidden" name="{{ $name }}" id="{{ $id }}" value="{{ $selectedSchemeId ?? '' }}">
    <input type="hidden" name="theme[primary]" id="{{ $id }}_primary" value="">
    <input type="hidden" name="theme[secondary]" id="{{ $id }}_secondary" value="">
    
    @error($name)
        <span class="e-form__error">{{ $message }}</span>
    @enderror
</div>

<style>
.e-form__color-scheme-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-top: 1rem;
}

.e-form__color-scheme-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    padding: 1rem;
    border-radius: 0.8rem;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    position: relative;
}

.e-form__color-scheme-item:hover {
    background-color: #f5f5f5;
    border-color: #E2E2E2;
}

.e-form__color-scheme-item--selected {
    border-color: #4054B2;
    background-color: #f0f4ff;
    box-shadow: 0 0 0 2px rgba(64, 84, 178, 0.1);
}

.e-form__color-scheme-item--selected::after {
    content: '✓';
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 2rem;
    height: 2rem;
    background-color: #4054B2;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
}

.e-form__color-scheme-swatch {
    width: 6rem;
    height: 6rem;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    border: 2px solid #E2E2E2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.e-form__color-scheme-swatch--default {
    background-color: #F5F5F5;
    display: flex;
    align-items: center;
    justify-content: center;
    border-color: #E2E2E2;
}

.e-form__color-scheme-item--default .e-form__color-scheme-swatch--default {
    background-color: #FFF5F5;
    border-color: #EF6B6B;
}

.e-form__color-scheme-item--selected.e-form__color-scheme-item--default .e-form__color-scheme-swatch--default {
    border-color: #EF6B6B;
    box-shadow: 0 2px 12px rgba(239, 107, 107, 0.3);
}

.e-form__color-scheme-item--selected .e-form__color-scheme-swatch {
    border-color: #4054B2;
    box-shadow: 0 2px 12px rgba(64, 84, 178, 0.3);
}

.e-form__color-scheme-swatch-top {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    clip-path: polygon(0 0, 100% 0, 0 100%);
}

.e-form__color-scheme-swatch-bottom {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 50%;
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
}

.e-form__color-scheme-name {
    font-size: 1.3rem;
    color: #474747;
    font-family: "LL Circular Book Sub", sans-serif;
    text-align: center;
}

.e-form__color-scheme-item--selected .e-form__color-scheme-name {
    color: #4054B2;
    font-weight: 500;
}

/* Labels inside mode support */
.e-form__labels-inside .e-form__color-scheme-list {
    padding-left: 15.5rem;
    margin-top: 0;
}

@media (max-width: 767px) {
    .e-form__labels-inside .e-form__color-scheme-list {
        padding-left: 12rem;
    }
}
</style>

<script>
(function() {
    'use strict';
    
    function initColorScheme() {
        const schemeList = document.getElementById('color-scheme-list-{{ $id }}');
        const hiddenInput = document.getElementById('{{ $id }}');
        const primaryInput = document.getElementById('{{ $id }}_primary');
        const secondaryInput = document.getElementById('{{ $id }}_secondary');
        
        if (!schemeList || !hiddenInput || !primaryInput || !secondaryInput) {
            return;
        }
        
        const schemeItems = schemeList.querySelectorAll('.e-form__color-scheme-item');
        
        // Initialize with current selection
        const currentSelected = schemeList.querySelector('.e-form__color-scheme-item--selected');
        if (currentSelected) {
            const isDefault = currentSelected.dataset.isDefault === 'true';
            hiddenInput.value = currentSelected.dataset.schemeId;
            if (isDefault) {
                // Clear colors for default
                primaryInput.value = '';
                secondaryInput.value = '';
            } else {
                primaryInput.value = currentSelected.dataset.primary || '';
                secondaryInput.value = currentSelected.dataset.secondary || '';
            }
        } else if (schemeItems.length > 0) {
            // If no selection, try to find "Default" scheme, otherwise select first
            let defaultItem = Array.from(schemeItems).find(item => item.dataset.schemeId === 'scheme_default');
            if (!defaultItem) {
                defaultItem = schemeItems[0];
            }
            defaultItem.classList.add('e-form__color-scheme-item--selected');
            const isDefault = defaultItem.dataset.isDefault === 'true';
            hiddenInput.value = defaultItem.dataset.schemeId;
            if (isDefault) {
                primaryInput.value = '';
                secondaryInput.value = '';
            } else {
                primaryInput.value = defaultItem.dataset.primary || '';
                secondaryInput.value = defaultItem.dataset.secondary || '';
            }
        }
        
        schemeItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remove selected class from all items
                schemeItems.forEach(i => i.classList.remove('e-form__color-scheme-item--selected'));
                
                // Add selected class to clicked item
                this.classList.add('e-form__color-scheme-item--selected');
                
                // Update hidden inputs
                const isDefault = this.dataset.isDefault === 'true';
                hiddenInput.value = this.dataset.schemeId;
                
                if (isDefault) {
                    // Clear colors for default scheme
                    primaryInput.value = '';
                    secondaryInput.value = '';
                } else {
                    primaryInput.value = this.dataset.primary || '';
                    secondaryInput.value = this.dataset.secondary || '';
                }
            });
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initColorScheme);
    } else {
        initColorScheme();
    }
})();
</script>
