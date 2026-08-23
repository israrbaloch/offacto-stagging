@if($company && $companySettings)
    <form method="POST" action="{{ route('profile.company-settings.update') }}" enctype="multipart/form-data" class="e-form">
        @csrf
        @method('patch')

        <div class="l-grid l-grid--colx2">
            <div class="l-grid__col e-form">
                <h3 class="e-form__title">Invoice Logo</h3>
                <div class="c-logo-upload">
                    <div class="c-logo-upload__image" id="logo_preview_container">
                        @if($companySettings->invoice_logo)
                            <img src="{{ asset('storage/' . $companySettings->invoice_logo) }}" alt="Logo" id="logo_preview" />
                        @else
                            <img src="/images/no-image.svg" alt="No logo" id="logo_preview" />
                        @endif
                    </div>
                    <div class="c-logo-upload__content">
                        <h3 class="c-logo-upload__title e-form__title">Logo</h3>
                        <h3 class="c-logo-upload__desc e-form__desc">Recommended format 300x300 pixels, .jpg or .png</h3>
                        <div class="c-logo-upload__button-area">
                            <input class="c-logo-upload__button-input" type="file" name="invoice_logo" id="invoice_logo" accept="image/jpeg,image/png,image/jpg,image/gif" style="display: none;"/>
                            <label for="invoice_logo" class="c-logo-upload__button e-button e-button--bordered e-button--purple-dark" style="cursor: pointer; display: inline-block;">
                                <div class="c-logo-upload__button-text-selected">Upload file</div>
                                <div class="c-logo-upload__button-text-default">Select a file</div>
                            </label>
                        </div>
                        @error('invoice_logo')
                            <span class="e-form__error">{{ $message }}</span>
                        @enderror
                    </div>
                    
                    <script>
                    (function() {
                        'use strict';
                        
                        function initLogoPreview() {
                            const fileInput = document.getElementById('invoice_logo');
                            const logoPreview = document.getElementById('logo_preview');
                            
                            if (!fileInput || !logoPreview) {
                                return;
                            }
                            
                            fileInput.addEventListener('change', function(e) {
                                const file = e.target.files[0];
                                
                                if (file) {
                                    // Validate file type
                                    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
                                    if (!validTypes.includes(file.type)) {
                                        alert('Please select a valid image file (JPEG, PNG, or GIF)');
                                        fileInput.value = '';
                                        return;
                                    }
                                    
                                    // Validate file size (max 2MB)
                                    if (file.size > 2 * 1024 * 1024) {
                                        alert('File size must be less than 2MB');
                                        fileInput.value = '';
                                        return;
                                    }
                                    
                                    // Create FileReader to preview image
                                    const reader = new FileReader();
                                    
                                    reader.onload = function(e) {
                                        logoPreview.src = e.target.result;
                                        logoPreview.alt = 'Logo preview';
                                    };
                                    
                                    reader.onerror = function() {
                                        alert('Error reading file. Please try again.');
                                    };
                                    
                                    reader.readAsDataURL(file);
                                }
                            });
                        }
                        
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', initLogoPreview);
                        } else {
                            initLogoPreview();
                        }
                    })();
                    </script>
                </div>

                <h3 class="e-form__title mt-20">Theme Colors</h3>
                <p class="e-form__desc">Choose a color scheme for your invoices and documents.</p>
                @php
                    $theme = is_string($companySettings->theme) ? json_decode($companySettings->theme, true) : $companySettings->theme;
                    $selectedScheme = null;
                    
                    // If theme is empty or null, default is selected
                    if (empty($theme) || empty($theme['primary']) || empty($theme['secondary'])) {
                        $selectedScheme = 'scheme_default';
                    } else {
                        // Try to match to a predefined scheme (matching color-scheme component)
                        $schemes = [
                            ['id' => 'scheme_1', 'primary' => '#000000', 'secondary' => '#FFFFFF'],
                            ['id' => 'scheme_2', 'primary' => '#003366', 'secondary' => '#FFD700'],
                            ['id' => 'scheme_3', 'primary' => '#8B0000', 'secondary' => '#00CED1'],
                            ['id' => 'scheme_4', 'primary' => '#006400', 'secondary' => '#FF00FF'],
                            ['id' => 'scheme_5', 'primary' => '#4B0082', 'secondary' => '#00FF00'],
                            ['id' => 'scheme_6', 'primary' => '#1C1C1C', 'secondary' => '#FF4500'],
                        ];
                        foreach ($schemes as $scheme) {
                            if (strtoupper($scheme['primary']) === strtoupper($theme['primary']) && 
                                strtoupper($scheme['secondary']) === strtoupper($theme['secondary'])) {
                                $selectedScheme = $scheme['id'];
                                break;
                            }
                        }
                        // If no match found, it's a custom color, so default is selected
                        if (!$selectedScheme) {
                            $selectedScheme = 'scheme_default';
                        }
                    }
                    // Default to default if no selection
                    if (!$selectedScheme) {
                        $selectedScheme = 'scheme_default';
                    }
                @endphp
                <x-form.color-scheme 
                    name="color_scheme" 
                    label="Color Scheme"
                    :value="old('color_scheme', $selectedScheme)"
                    :companySettings="$companySettings"
                />
            </div>

            <div class="l-grid__col e-form">
                <h3 class="e-form__title">Numbering Series</h3>
                <div class="e-form__labels-inside">
                    <x-form.select 
                        name="numbering_series" 
                        label="Numbering Series"
                        :options="$numberingSeries"
                        :value="old('numbering_series', $companySettings->numbering_series)"
                        required
                    />
                </div>
            </div>
        </div>

        <div class="e-form__submit-wrap mt-20">
            <button type="submit" class="e-form__submit e-button">Save Company Settings</button>
        </div>
    </form>
@else
    <div class="e-note">
        <p class="e-note__text">Company settings not available. Please create a company first.</p>
    </div>
@endif
