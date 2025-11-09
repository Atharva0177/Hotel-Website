// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const adminSidebar = document.querySelector('.admin-sidebar');
    
    if (mobileMenuToggle && adminSidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            adminSidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 992) {
                if (!event.target.closest('.admin-sidebar') && 
                    !event.target.closest('#mobileMenuToggle') && 
                    adminSidebar.classList.contains('active')) {
                    adminSidebar.classList.remove('active');
                }
            }
        });
    }
    
    // Auto-dismiss alerts
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            const closeBtn = alert.querySelector('.alert-close');
            if (closeBtn) {
                closeBtn.click();
            } else {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            }
        });
    }, 5000);
    
    // Confirm delete actions
    document.querySelectorAll('[onclick*="delete"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    });
    
    // Table row hover effect
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.01)';
        });
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Form validation for JSON fields
    const jsonTextareas = document.querySelectorAll('textarea[name="amenities"], textarea[name="images"], textarea[name="videos"]');
    jsonTextareas.forEach(textarea => {
        textarea.addEventListener('blur', function() {
            try {
                const parsed = JSON.parse(this.value);
                if (!Array.isArray(parsed)) {
                    throw new Error('Must be an array');
                }
                this.style.borderColor = '#52c41a';
                hideError(this);
            } catch (e) {
                this.style.borderColor = '#ff4d4f';
                showError(this, 'Invalid JSON format. Must be an array like ["item1", "item2"]');
            }
        });
        
        textarea.addEventListener('focus', function() {
            this.style.borderColor = '';
            hideError(this);
        });
    });
    
    // Dashboard stats animation
    const statNumbers = document.querySelectorAll('.stat-content h3');
    statNumbers.forEach(stat => {
        const finalValue = parseFloat(stat.textContent.replace(/[^0-9.]/g, ''));
        if (!isNaN(finalValue)) {
            animateValue(stat, 0, finalValue, 1000);
        }
    });
    
    // Add tooltip functionality
    addTooltips();
});

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const prefix = element.textContent.match(/^\D*/)[0];
    const suffix = element.textContent.match(/\D*$/)[0];
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * easeOutCubic(progress);
        element.textContent = prefix + Math.floor(current) + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function showError(element, message) {
    hideError(element);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ff4d4f;
        font-size: 13px;
        margin-top: 5px;
        animation: slideDown 0.3s ease;
    `;
    element.parentNode.appendChild(errorDiv);
}

function hideError(element) {
    const error = element.parentNode.querySelector('.field-error');
    if (error) {
        error.remove();
    }
}

function addTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = this.getAttribute('title');
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                pointer-events: none;
                z-index: 10000;
                white-space: nowrap;
                animation: fadeIn 0.2s ease;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            
            this._tooltip = tooltip;
            this.removeAttribute('title');
            this._originalTitle = this.getAttribute('title');
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                this._tooltip = null;
                if (this._originalTitle) {
                    this.setAttribute('title', this._originalTitle);
                }
            }
        });
    });
}

// Export data to CSV
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId) || document.querySelector('.data-table');
    if (!table) return;
    
    const rows = Array.from(table.querySelectorAll('tr'));
    const csv = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => {
            let text = cell.textContent.trim();
            text = text.replace(/"/g, '""');
            return `"${text}"`;
        }).join(',');
    }).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Print functionality
function printPage() {
    window.print();
}

// Search functionality
function addSearchToTable() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.style.cssText = `
        padding: 10px 15px;
        border: 2px solid #e8e8e8;
        border-radius: 8px;
        font-size: 14px;
        width: 250px;
    `;
    
    const toolbar = document.querySelector('.admin-toolbar');
    if (toolbar) {
        toolbar.appendChild(searchInput);
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.data-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Initialize search if table exists
if (document.querySelector('.data-table')) {
    addSearchToTable();
}

// Chart initialization (if needed)
function initializeCharts() {
    // Placeholder for future chart implementation
    console.log('Charts initialized');
}

console.log('%c👨‍💼 Admin Panel Loaded', 'color: #667eea; font-size: 16px; font-weight: bold;');