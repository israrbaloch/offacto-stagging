// AJAX form submission for profile forms
document.addEventListener('DOMContentLoaded', function() {
    // Handle all profile forms
    const forms = document.querySelectorAll('form[action*="profile"]');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.textContent : 'Save';
            
            // Disable submit button
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Saving...';
            }
            
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'e-note e-note--info';
            loadingIndicator.style.marginBottom = '20px';
            loadingIndicator.innerHTML = '<p class="e-note__text">Saving changes...</p>';
            form.parentNode.insertBefore(loadingIndicator, form);
            
            fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw { validation: data.errors || {}, message: data.message || 'An error occurred' };
                    });
                }
                return response.json();
            })
            .then(data => {
                // Remove loading indicator
                loadingIndicator.remove();
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'e-note e-note--success';
                successMessage.style.marginBottom = '20px';
                successMessage.innerHTML = '<p class="e-note__text">' + (data.message || 'Changes saved successfully!') + '</p>';
                form.parentNode.insertBefore(successMessage, form);
                
                // Remove success message after 3 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
                
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
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
                // Remove loading indicator
                loadingIndicator.remove();
                
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'e-note e-note--error';
                errorMessage.style.marginBottom = '20px';
                errorMessage.innerHTML = '<p class="e-note__text">' + (error.message || 'An error occurred while saving.') + '</p>';
                form.parentNode.insertBefore(errorMessage, form);
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorMessage.remove();
                }, 5000);
                
                // Display validation errors
                if (error.validation) {
                    Object.keys(error.validation).forEach(field => {
                        const input = form.querySelector(`[name="${field}"]`);
                        if (input) {
                            const errorSpan = document.createElement('span');
                            errorSpan.className = 'e-form__error';
                            errorSpan.textContent = error.validation[field][0];
                            
                            // Remove existing error
                            const existingError = input.parentNode.querySelector('.e-form__error');
                            if (existingError) {
                                existingError.remove();
                            }
                            
                            input.parentNode.appendChild(errorSpan);
                            input.classList.add('e-form__input--error');
                        }
                    });
                }
                
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            });
        });
    });
});
