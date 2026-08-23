// Company switching functionality
(function() {
    'use strict';
    
    function initCompanySwitch() {
        const companyLinks = document.querySelectorAll('.company-switch-link');
        
        companyLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const companyId = this.dataset.companyId;
                if (!companyId) {
                    return;
                }
                
                // Get current active company to avoid unnecessary switch
                const currentActive = document.querySelector('.c-company-switch__list-item--active');
                if (currentActive && currentActive.dataset.companyId === companyId) {
                    return; // Already active
                }
                
                // Disable all links temporarily
                companyLinks.forEach(l => {
                    l.style.pointerEvents = 'none';
                    l.style.opacity = '0.6';
                });
                
                // Show loading state
                const currentCompanyName = document.querySelector('.c-company-switch__current-company-name');
                const originalName = currentCompanyName ? currentCompanyName.textContent : '';
                if (currentCompanyName) {
                    currentCompanyName.textContent = 'Switching...';
                }
                
                fetch(`/company/switch/${companyId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw { message: data.message || 'Failed to switch company', errors: data.errors || {} };
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    // Update active company indicator
                    document.querySelectorAll('.c-company-switch__list-item').forEach(item => {
                        item.classList.remove('c-company-switch__list-item--active');
                        if (item.dataset.companyId === companyId) {
                            item.classList.add('c-company-switch__list-item--active');
                        }
                    });
                    
                    // Update current company display
                    const currentCompanyImage = document.querySelector('.c-company-switch__current-company-image');
                    const currentCompanyNameEl = document.querySelector('.c-company-switch__current-company-name');
                    
                    if (currentCompanyImage && data.data.logo_url) {
                        currentCompanyImage.src = data.data.logo_url;
                        currentCompanyImage.alt = data.data.company_name;
                    }
                    
                    if (currentCompanyNameEl) {
                        currentCompanyNameEl.textContent = data.data.company_name;
                    }
                    
                    // Apply theme colors dynamically
                    if (data.data.theme) {
                        applyTheme(data.data.theme);
                    }
                    
                    // Show success toast
                    if (window.showToast) {
                        window.showToast('Company switched successfully!', 'success');
                    }
                    
                    // Reload page to ensure all data reflects new company
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                })
                .catch(error => {
                    // Restore original name
                    if (currentCompanyName) {
                        currentCompanyName.textContent = originalName;
                    }
                    
                    // Show error toast
                    if (window.showToast) {
                        window.showToast(error.message || 'Failed to switch company. Please try again.', 'error');
                    }
                    
                    // Re-enable links
                    companyLinks.forEach(l => {
                        l.style.pointerEvents = '';
                        l.style.opacity = '1';
                    });
                });
            });
        });
    }
    
    function applyTheme(theme) {
        const primary = theme.primary || '#4054B2';
        const secondary = theme.secondary || '#454545';
        
        // Update CSS variables
        document.documentElement.style.setProperty('--company-primary', primary);
        document.documentElement.style.setProperty('--company-secondary', secondary);
        
        // Update body background gradient
        document.body.style.background = `linear-gradient(117deg, ${primary} 0%, ${secondary} 96%)`;
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCompanySwitch);
    } else {
        initCompanySwitch();
    }
})();
