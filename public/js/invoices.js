// Invoices Management with Dynamic Items
(function() {
    'use strict';
    
    let itemCounter = 0;
    let items = [];
    // VAT rate from site settings (set in blade before this script), fallback 21%
    const TAX_RATE = typeof window.__DEFAULT_VAT_RATE !== 'undefined' ? window.__DEFAULT_VAT_RATE : 0.21;

    function initInvoices() {
        // Initialize modal close handlers
        initModalCloseHandlers();
        
        // Initialize services list add buttons
        initServicesListButtons();

        // Open services modal button
        const openServicesModalBtn = document.getElementById('open-services-modal-btn');
        if (openServicesModalBtn) {
            openServicesModalBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const modal = document.querySelector('[modal-id="select-service"]');
                if (modal) {
                    modal.classList.add('e-modal--open');
                    document.body.classList.add('body--no-scroll');
                }
            });
        }

        // Main form submission (create)
        const createForm = document.getElementById('create-invoice-form');
        if (createForm) {
            createForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Validate items
                if (items.length === 0) {
                    if (window.showToast) {
                        window.showToast('Please add at least one item to the invoice', 'error');
                    }
                    return;
                }
                
                handleFormSubmit(this, 'POST', this.action, 'Invoice created successfully!');
            });
        }

        // Edit form submission
        const editForm = document.getElementById('edit-invoice-form');
        if (editForm) {
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Validate items
                if (items.length === 0) {
                    if (window.showToast) {
                        window.showToast('Please add at least one item to the invoice', 'error');
                    }
                    return;
                }
                
                handleFormSubmit(this, 'PATCH', this.action, 'Invoice updated successfully!');
            });
        }

        // Send invoice form
        const sendInvoiceForm = document.getElementById('send-invoice-form');
        if (sendInvoiceForm) {
            sendInvoiceForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleFormSubmit(this, 'POST', this.action, 'Invoice sent successfully!');
            });
        }

        // Record payment form
        const recordPaymentForm = document.getElementById('record-payment-form');
        if (recordPaymentForm) {
            recordPaymentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleFormSubmit(this, 'POST', this.action, 'Payment recorded successfully!');
            });
        }

        // Delete invoice button (on index page)
        const deleteButtons = document.querySelectorAll('.delete-invoice-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const invoiceId = this.dataset.invoiceId;
                const invoiceNumber = this.dataset.invoiceNumber;
                const form = document.getElementById('delete-invoice-form');
                
                if (form) {
                    form.action = `/invoices/${invoiceId}`;
                    const numberElement = document.getElementById('delete-invoice-number');
                    if (numberElement) {
                        numberElement.textContent = invoiceNumber || 'this invoice';
                    }
                    
                    // Open modal
                    const modal = document.querySelector('[modal-id="delete-invoice"]');
                    if (modal) {
                        modal.classList.add('e-modal--open');
                        document.body.classList.add('body--no-scroll');
                    }
                }
            });
        });

        // Delete invoice form submit
        const deleteForm = document.getElementById('delete-invoice-form');
        if (deleteForm) {
            deleteForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleFormSubmit(this, 'DELETE', this.action, 'Invoice deleted successfully!', true);
            });
        }
    }

    function initModalCloseHandlers() {
        document.addEventListener('click', function(e) {
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
            
            // Clear form if exists
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                form.querySelectorAll('.e-form__error').forEach(el => el.remove());
                form.querySelectorAll('.e-form__input--error, .e-form__select--error').forEach(el => {
                    el.classList.remove('e-form__input--error', 'e-form__select--error');
                });
            }
        }
    }

    function initServicesListButtons() {
        // Add click handlers to all service add buttons
        const addButtons = document.querySelectorAll('.c-services-list__add-btn');
        addButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const serviceItem = this.closest('.c-services-list__item');
                if (serviceItem) {
                    addServiceFromList(serviceItem);
                }
            });
        });
    }

    function addServiceFromList(serviceItem) {
        const serviceId = parseInt(serviceItem.dataset.serviceId);
        const serviceName = serviceItem.dataset.serviceName;
        const servicePrice = parseFloat(serviceItem.dataset.servicePrice);
        const serviceDescription = serviceItem.dataset.serviceDescription || '';
        
        // Get quantity from the input
        const quantityInput = serviceItem.querySelector('.c-services-list__quantity');
        const quantity = parseInt(quantityInput?.value || '1');

        if (quantity < 1) {
            if (window.showToast) {
                window.showToast('Quantity must be at least 1', 'error');
            }
            return;
        }

        // Add item to array
        const item = {
            id: itemCounter++,
            service_id: serviceId,
            service_name: serviceName,
            description: serviceDescription,
            quantity: quantity,
            price: servicePrice,
            total: quantity * servicePrice
        };

        items.push(item);
        renderItemsTable();
        updateTotals();

        // Reset quantity input to 1
        if (quantityInput) {
            quantityInput.value = 1;
        }

        // Show "Added" badge next to the service
        const addedBadge = serviceItem.querySelector('.c-services-list__added-badge');
        if (addedBadge) {
            // Reset animation by removing and re-adding the element
            addedBadge.style.display = 'none';
            addedBadge.offsetHeight; // Trigger reflow
            addedBadge.style.display = 'inline-flex';
            
            // Hide after animation completes
            setTimeout(() => {
                addedBadge.style.display = 'none';
            }, 2000);
        }
    }

    function removeItem(itemId) {
        const index = items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            items.splice(index, 1);
            renderItemsTable();
            updateTotals();
        }
    }

    function renderItemsTable() {
        const tbody = document.getElementById('items-tbody');
        if (!tbody) return;

        // Clear existing rows
        tbody.innerHTML = '';

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr class="c-offer-items__empty-row" id="empty-row">
                    <td colspan="4" style="text-align: center; padding: 2rem; color: #999;">
                        No items added. Click <strong>"Add Service"</strong> to select services.
                    </td>
                </tr>
            `;
            return;
        }

        items.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'c-offer-items__row';
            row.dataset.itemId = item.id;
            row.innerHTML = `
                <td>
                    <div class="c-offer-items__item-info">
                        <span class="c-offer-items__item-name">${escapeHtml(item.service_name)}</span>
                        ${item.description ? `<span class="c-offer-items__item-desc">${escapeHtml(item.description)}</span>` : ''}
                    </div>
                    <button type="button" class="c-offer-items__remove-btn remove-item-btn" data-item-id="${item.id}" title="Remove item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        Remove
                    </button>
                </td>
                <td>${item.quantity}</td>
                <td>€ ${formatNumber(item.price)}</td>
                <td>€ ${formatNumber(item.total)}</td>
            `;
            tbody.appendChild(row);
        });

        // Attach remove button handlers
        tbody.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.dataset.itemId);
                removeItem(itemId);
            });
        });
    }

    function updateTotals() {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = subtotal * TAX_RATE;
        const total = subtotal + taxAmount;

        const subtotalDisplay = document.getElementById('subtotal-display');
        const taxDisplay = document.getElementById('tax-display');
        const totalDisplay = document.getElementById('total-display');

        if (subtotalDisplay) subtotalDisplay.textContent = '€ ' + formatNumber(subtotal);
        if (taxDisplay) taxDisplay.textContent = '€ ' + formatNumber(taxAmount);
        if (totalDisplay) totalDisplay.textContent = '€ ' + formatNumber(total);
    }

    function formatNumber(num) {
        return num.toFixed(2).replace('.', ',');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function handleFormSubmit(form, method, url, successMessage, isDelete = false) {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.innerHTML : 'Submit';
        
        // Build FormData manually
        const formData = new FormData();
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                         form.querySelector('input[name="_token"]')?.value || '';
        if (csrfToken) {
            formData.append('_token', csrfToken);
        }

        if (isDelete) {
            formData.append('_method', 'DELETE');
        }

        // Collect all form fields
        const allInputs = form.querySelectorAll('input[name], select[name], textarea[name]');
        allInputs.forEach(input => {
            if (!input.name) return;
            if (input.type === 'submit' || input.type === 'button') return;
            if (input.name === '_token' || input.name === '_method') return;
            
            // Handle checkboxes
            if (input.type === 'checkbox') {
                if (input.checked) {
                    formData.append(input.name, input.value || '1');
                }
                return;
            }
            
            let value = '';
            if (input.tagName === 'SELECT') {
                value = input.options[input.selectedIndex]?.value || '';
            } else {
                value = input.value || '';
            }
            formData.append(input.name, value);
        });

        // Add items array (for create/edit forms)
        if (!isDelete && items.length > 0) {
            items.forEach((item, index) => {
                formData.append(`items[${index}][service_id]`, item.service_id);
                formData.append(`items[${index}][description]`, item.description || '');
                formData.append(`items[${index}][quantity]`, item.quantity);
                formData.append(`items[${index}][price]`, item.price);
            });
        }

        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = isDelete ? 'Deleting...' : 'Saving...';
        }

        const options = {
            method: method || form.method.toUpperCase(),
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: formData,
        };

        // For PATCH/DELETE, use POST with _method
        if (options.method === 'PATCH' || options.method === 'DELETE') {
            formData.append('_method', options.method);
            options.method = 'POST';
        }

        fetch(url || form.action, options)
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
                if (window.showToast) {
                    window.showToast(successMessage || 'Operation completed successfully!', 'success');
                }

                // Close modal if applicable
                const modal = form.closest('.e-modal');
                if (modal) {
                    closeModal(modal);
                }

                // Redirect or reload
                setTimeout(() => {
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    } else if (isDelete) {
                        window.location.reload();
                    } else {
                        // For create/update, redirect to invoices index or show page
                        window.location.href = '/invoices';
                    }
                }, 500);
            })
            .catch(error => {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }

                if (window.showToast) {
                    window.showToast(error.message || 'An error occurred. Please try again.', 'error');
                }

                // Display validation errors
                if (error.validation && Object.keys(error.validation).length > 0) {
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
    function initialize() {
        initInvoices();
        
        // Initialize existing items for edit form (if they exist)
        if (typeof existingItems !== 'undefined' && Array.isArray(existingItems) && existingItems.length > 0) {
            existingItems.forEach(item => {
                items.push(item);
                if (itemCounter <= item.id) {
                    itemCounter = item.id + 1;
                }
            });
            renderItemsTable();
            updateTotals();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Expose functions globally if needed
    window.invoiceModule = {
        addServiceFromList,
        removeItem,
        renderItemsTable,
        updateTotals
    };
})();
