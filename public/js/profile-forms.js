// Toast notification system
(function() {
    'use strict';
    
    // Create toast container if it doesn't exist
    function getToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; max-width: 400px;';
            document.body.appendChild(container);
        }
        return container;
    }
    
    // Show toast notification
    window.showToast = function(message, type = 'success') {
        const container = getToastContainer();
        const toast = document.createElement('div');
        
        const bgColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#EF6B6B' : '#2196F3';
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        
        toast.style.cssText = `
            background: ${bgColor};
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 0.8rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 1rem;
            font-family: "LL Circular Book Sub", sans-serif;
            font-size: 1.4rem;
            animation: slideInRight 0.3s ease-out;
            min-width: 250px;
            max-width: 400px;
        `;
        
        toast.innerHTML = `
            <span style="font-size: 1.8rem; font-weight: bold; flex-shrink: 0;">${icon}</span>
            <span style="flex: 1;">${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
        
        // Add click to dismiss
        toast.style.cursor = 'pointer';
        toast.addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    };
    
    // Add CSS animations
    if (!document.getElementById('toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
})();

// AJAX form submission for profile forms
(function() {
    'use strict';
    
    // Track which forms are currently submitting to prevent double submission
    const submittingForms = new WeakSet();
    
    function initializeForms() {
        // Remove any existing event listeners by cloning forms
        const forms = document.querySelectorAll('form[action*="profile"]');
        
        forms.forEach(function(form) {
            // Skip if already initialized
            if (form.dataset.ajaxInitialized === 'true') {
                return;
            }
            form.dataset.ajaxInitialized = 'true';
            
            // Clear previous errors on input
            form.querySelectorAll('input, select, textarea').forEach(input => {
                input.addEventListener('input', function() {
                    // Remove error styling when user starts typing
                    this.classList.remove('e-form__input--error', 'e-form__select--error');
                    const fieldWrap = this.closest('.e-form__field-wrap');
                    if (fieldWrap) {
                        fieldWrap.classList.remove('e-form__field-wrap--error');
                        const errorSpan = fieldWrap.querySelector('.e-form__error');
                        if (errorSpan) {
                            errorSpan.remove();
                        }
                    }
                });
            });
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Prevent double submission
                if (submittingForms.has(form)) {
                    return false;
                }
                
                // Clear previous error messages
                form.querySelectorAll('.e-form__error').forEach(el => el.remove());
                form.querySelectorAll('.e-form__input--error, .e-form__select--error').forEach(el => {
                    el.classList.remove('e-form__input--error', 'e-form__select--error');
                });
                form.querySelectorAll('.e-form__field-wrap--error').forEach(el => {
                    el.classList.remove('e-form__field-wrap--error');
                });
                
                // Basic client-side validation
                let hasErrors = false;
                const requiredFields = form.querySelectorAll('[required]');
                requiredFields.forEach(field => {
                    if (!field.value || (field.type === 'file' && !field.files.length)) {
                        hasErrors = true;
                        const fieldWrap = field.closest('.e-form__field-wrap') || field.parentNode;
                        const errorSpan = document.createElement('span');
                        errorSpan.className = 'e-form__error';
                        errorSpan.style.color = '#EF6B6B';
                        errorSpan.style.fontSize = '1.3rem';
                        errorSpan.style.marginTop = '0.5rem';
                        errorSpan.style.display = 'block';
                        errorSpan.textContent = 'This field is required.';
                        fieldWrap.appendChild(errorSpan);
                        field.classList.add(field.classList.contains('e-form__select') ? 'e-form__select--error' : 'e-form__input--error');
                        fieldWrap.classList.add('e-form__field-wrap--error');
                    }
                });
                
                if (hasErrors) {
                    window.showToast('Please fill in all required fields.', 'error');
                    return false;
                }
                
                // Mark form as submitting
                submittingForms.add(form);
                
                const formData = new FormData(form);
                const submitButton = form.querySelector('button[type="submit"]');
                const originalButtonText = submitButton ? submitButton.textContent.trim() : 'Save';
                const originalButtonHTML = submitButton ? submitButton.innerHTML : 'Save';
                
                // Disable submit button
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Saving...';
                    submitButton.style.opacity = '0.7';
                    submitButton.style.cursor = 'not-allowed';
                }
                
                fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || form.querySelector('input[name="_token"]')?.value,
                    },
                })
                .then(response => {
                    // Always try to parse as JSON first
                    return response.json().then(data => {
                        // If status is not OK, treat as error
                        if (!response.ok) {
                            // Laravel returns validation errors in 'errors' key for 422 status
                            const errors = data.errors || data.error || {};
                            const message = data.message || 'Validation failed';
                            throw { 
                                validation: errors, 
                                message: message, 
                                status: response.status 
                            };
                        }
                        return data;
                    }).catch(jsonError => {
                        // If JSON parsing fails, check if it's an error response
                        if (!response.ok) {
                            throw { 
                                validation: {}, 
                                message: 'An error occurred while saving.', 
                                status: response.status 
                            };
                        }
                        // If response is OK but not JSON, try to get text
                        return response.text().then(text => {
                            throw { 
                                validation: {}, 
                                message: 'Unexpected response format.', 
                                status: response.status 
                            };
                        });
                    });
                })
                .then(data => {
                    // Remove from submitting set
                    submittingForms.delete(form);
                    
                    // Show success toast
                    window.showToast(data.message || 'Changes saved successfully!', 'success');
                    
                    // Re-enable submit button
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                        submitButton.innerHTML = originalButtonHTML;
                        submitButton.style.opacity = '1';
                        submitButton.style.cursor = 'pointer';
                    }
                    
                    // Update logo preview if logo was uploaded
                    if (data.data && data.data.invoice_logo_url) {
                        const logoPreview = document.getElementById('logo_preview');
                        if (logoPreview) {
                            logoPreview.src = data.data.invoice_logo_url;
                            logoPreview.alt = 'Logo';
                        }
                    }
                    
                    // Update form values if data is returned
                    if (data.data) {
                        Object.keys(data.data).forEach(key => {
                            const input = form.querySelector(`[name="${key}"]`);
                            if (input && input.type !== 'file') {
                                input.value = data.data[key];
                            }
                        });
                    }
                })
                .catch(error => {
                    // Remove from submitting set
                    submittingForms.delete(form);
                    
                    // Show error toast only if there are no field-specific errors
                    const hasFieldErrors = error.validation && Object.keys(error.validation).length > 0;
                    
                    if (!hasFieldErrors) {
                        window.showToast(error.message || 'An error occurred while saving.', 'error');
                    } else {
                        window.showToast('Please correct the errors below.', 'error');
                    }
                    
                    // Display validation errors
                    if (error.validation && Object.keys(error.validation).length > 0) {
                        // Clear all previous errors first
                        form.querySelectorAll('.e-form__error').forEach(el => el.remove());
                        form.querySelectorAll('.e-form__input--error, .e-form__select--error').forEach(el => {
                            el.classList.remove('e-form__input--error', 'e-form__select--error');
                        });
                        form.querySelectorAll('.e-form__field-wrap--error').forEach(el => {
                            el.classList.remove('e-form__field-wrap--error');
                        });
                        
                        Object.keys(error.validation).forEach(field => {
                            // Handle nested field names like theme[primary] or theme.secondary
                            let input = form.querySelector(`[name="${field}"]`);
                            
                            // Try alternative selectors for nested fields
                            if (!input) {
                                // Try with brackets escaped
                                const escapedField = field.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
                                input = form.querySelector(`[name="${escapedField}"]`);
                            }
                            
                            if (!input) {
                                // Try partial match for nested fields like theme[primary]
                                const fieldParts = field.split(/[\[\]\.]/);
                                if (fieldParts.length > 1) {
                                    input = form.querySelector(`[name*="${fieldParts[0]}"][name*="${fieldParts[1]}"]`);
                                }
                            }
                            
                            if (input) {
                                const fieldWrap = input.closest('.e-form__field-wrap') || input.parentNode;
                                
                                // Remove existing error in this field
                                const existingError = fieldWrap.querySelector('.e-form__error');
                                if (existingError) {
                                    existingError.remove();
                                }
                                
                                // Get error message
                                const errorMessage = Array.isArray(error.validation[field]) 
                                    ? error.validation[field][0] 
                                    : (typeof error.validation[field] === 'string' 
                                        ? error.validation[field] 
                                        : 'Validation error');
                                
                                // Add error message
                                const errorSpan = document.createElement('span');
                                errorSpan.className = 'e-form__error';
                                errorSpan.style.color = '#EF6B6B';
                                errorSpan.style.fontSize = '1.3rem';
                                errorSpan.style.marginTop = '0.5rem';
                                errorSpan.style.display = 'block';
                                errorSpan.textContent = errorMessage;
                                
                                fieldWrap.appendChild(errorSpan);
                                
                                // Add error class to input
                                if (input.classList.contains('e-form__select')) {
                                    input.classList.add('e-form__select--error');
                                } else {
                                    input.classList.add('e-form__input--error');
                                }
                                
                                // Add error class to field wrap
                                fieldWrap.classList.add('e-form__field-wrap--error');
                                
                                // Scroll to first error
                                if (Object.keys(error.validation)[0] === field) {
                                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }
                        });
                    }
                    
                    // Always re-enable submit button
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                        submitButton.innerHTML = originalButtonHTML;
                        submitButton.style.opacity = '1';
                        submitButton.style.cursor = 'pointer';
                    }
                });
                
                return false;
            });
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeForms);
    } else {
        initializeForms();
    }
})();
