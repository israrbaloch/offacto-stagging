// Services CRUD with AJAX
(function() {
    'use strict';
    
    function initServices() {
        // Initialize modal close handlers
        initModalCloseHandlers();
        
        // Add Service Form
        const addForm = document.getElementById('add-service-form');
        if (addForm) {
            addForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleFormSubmit(this, 'POST', this.action, 'Service created successfully!');
            });
        }

        // Edit Service Form - populate on edit button click
        const editButtons = document.querySelectorAll('.edit-service-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const serviceId = this.dataset.serviceId;
                const modal = document.querySelector('[modal-id="edit-service"]');
                const form = document.getElementById('edit-service-form');
                
                if (!modal || !form) {
                    console.error('Edit modal or form not found');
                    return;
                }
                
                // Open modal first
                modal.classList.add('e-modal--open');
                document.body.classList.add('body--no-scroll');
                
                // Set form action
                form.action = `/services/${serviceId}`;
                
                // Wait a bit for modal to be visible, then populate fields
                setTimeout(() => {
                    // Get form inputs
                    const nameInput = document.getElementById('edit-service-name');
                    const descriptionInput = document.getElementById('edit-service-description');
                    const priceInput = document.getElementById('edit-service-price');
                    const unitInput = document.getElementById('edit-service-unit');
                    const statusSelect = document.getElementById('edit-service-status');
                    
                    // Populate form fields
                    if (nameInput) {
                        nameInput.value = this.dataset.serviceName || '';
                    }
                    if (descriptionInput) {
                        descriptionInput.value = this.dataset.serviceDescription || '';
                    }
                    if (priceInput) {
                        priceInput.value = this.dataset.servicePrice || '';
                    }
                    if (unitInput) {
                        unitInput.value = this.dataset.serviceUnit || '';
                    }
                    if (statusSelect) {
                        statusSelect.value = this.dataset.serviceStatus || '';
                    }
                    
                    // Focus on first input
                    if (nameInput) {
                        nameInput.focus();
                    }
                }, 150);
            });
        });

        // Edit Service Form Submit
        const editForm = document.getElementById('edit-service-form');
        if (editForm) {
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleFormSubmit(this, 'PATCH', this.action, 'Service updated successfully!');
            });
        }

        // Delete Service - populate on delete button click
        const deleteButtons = document.querySelectorAll('.delete-service-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const serviceId = this.dataset.serviceId;
                const serviceName = this.dataset.serviceName;
                const form = document.getElementById('delete-service-form');
                
                if (form) {
                    form.action = `/services/${serviceId}`;
                    const nameElement = document.getElementById('delete-service-name');
                    if (nameElement) {
                        nameElement.textContent = serviceName || 'this service';
                    }
                    
                    // Open modal
                    const modal = document.querySelector('[modal-id="delete-service"]');
                    if (modal) {
                        modal.classList.add('e-modal--open');
                        document.body.classList.add('body--no-scroll');
                    }
                }
            });
        });

        // Delete Service Form Submit
        const deleteForm = document.getElementById('delete-service-form');
        if (deleteForm) {
            deleteForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleFormSubmit(this, 'DELETE', this.action, 'Service deleted successfully!', true);
            });
        }
    }
    
    function initModalCloseHandlers() {
        // Use event delegation for close buttons to avoid duplicate listeners
        document.addEventListener('click', function(e) {
            // Check if clicked element is a close button
            if (e.target.closest('.js-close-modal')) {
                const modal = e.target.closest('.e-modal');
                if (modal) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal(modal);
                }
            }
        });
    }
    
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('e-modal--open');
            document.body.classList.remove('body--no-scroll');
            
            // Clear form errors
            const form = modal.querySelector('form');
            if (form) {
                form.querySelectorAll('.e-form__error').forEach(el => el.remove());
                form.querySelectorAll('.e-form__input--error, .e-form__select--error').forEach(el => {
                    el.classList.remove('e-form__input--error', 'e-form__select--error');
                });
            }
        }
    }

    function handleFormSubmit(form, method, url, successMessage, isDelete = false) {
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : 'Submit';
        
        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = isDelete ? 'Deleting...' : 'Saving...';
        }

        // For DELETE, we don't need form data
        const options = {
            method: method,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        };

        if (method !== 'DELETE') {
            options.body = formData;
        } else {
            // For DELETE, we need to add _method
            formData.append('_method', 'DELETE');
            options.body = formData;
        }

        fetch(url, options)
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok) {
                        throw { 
                            validation: data.errors || {}, 
                            message: data.message || 'An error occurred.', 
                            status: response.status 
                        };
                    }
                    return data;
                });
            })
            .then(data => {
                // Show success toast
                if (window.showToast) {
                    window.showToast(successMessage, 'success');
                }

                // Close modal
                const modal = form.closest('.e-modal');
                if (modal) {
                    closeModal(modal);
                }

                // Reload page after short delay
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            })
            .catch(error => {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }

                // Show error toast
                if (window.showToast) {
                    window.showToast(error.message || 'An error occurred. Please try again.', 'error');
                }

                // Display validation errors
                if (error.validation && Object.keys(error.validation).length > 0) {
                    // Clear previous errors
                    form.querySelectorAll('.e-form__error').forEach(el => el.remove());
                    form.querySelectorAll('.e-form__input--error, .e-form__select--error').forEach(el => {
                        el.classList.remove('e-form__input--error', 'e-form__select--error');
                    });

                    Object.keys(error.validation).forEach(field => {
                        const input = form.querySelector(`[name="${field}"]`);
                        if (input) {
                            const fieldWrap = input.closest('.e-form__field-wrap') || input.parentNode;
                            const errorSpan = document.createElement('span');
                            errorSpan.className = 'e-form__error';
                            errorSpan.style.color = '#EF6B6B';
                            errorSpan.style.fontSize = '1.3rem';
                            errorSpan.style.marginTop = '0.5rem';
                            errorSpan.style.display = 'block';
                            errorSpan.textContent = Array.isArray(error.validation[field]) 
                                ? error.validation[field][0] 
                                : error.validation[field];
                            
                            fieldWrap.appendChild(errorSpan);
                            input.classList.add(input.classList.contains('e-form__select') ? 'e-form__select--error' : 'e-form__input--error');
                        }
                    });
                }
            });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initServices);
    } else {
        initServices();
    }
})();
