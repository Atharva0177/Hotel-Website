// Main JavaScript for Hotel Website

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        const icon = this.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    if (navLinks && navLinks.classList.contains('active')) {
        if (!event.target.closest('.nav-wrapper')) {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });
});

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        if (email) {
            alert('Thank you for subscribing! You will receive our latest updates at ' + email);
            this.reset();
        }
    });
}

// Improved image loading - Ensure all images load properly
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Ensure images are visible immediately
        img.style.opacity = '1';
        img.style.transition = 'opacity 0.3s ease';
        
        // Add error handler for failed images
        img.addEventListener('error', function() {
            console.warn('Failed to load image:', this.src);
            // Set a placeholder background
            this.style.backgroundColor = '#f0f0f0';
            this.style.minHeight = '200px';
            this.alt = 'Image temporarily unavailable';
            
            // Try to reload the image once
            if (!this.dataset.retried) {
                this.dataset.retried = 'true';
                setTimeout(() => {
                    const originalSrc = this.src;
                    this.src = '';
                    this.src = originalSrc;
                }, 1000);
            }
        });
        
        // Add load handler for successful images
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.classList.add('loaded');
        });
    });
});

// Optimized parallax effect for hero section
let ticking = false;
let lastScrollY = 0;

window.addEventListener('scroll', function() {
    lastScrollY = window.pageYOffset;
    
    if (!ticking) {
        window.requestAnimationFrame(function() {
            const parallax = document.querySelector('.hero');
            if (parallax && lastScrollY < window.innerHeight) {
                parallax.style.transform = 'translateY(' + lastScrollY * 0.5 + 'px)';
            }
            ticking = false;
        });
        ticking = true;
    }
});

// Auto-dismiss flash messages
setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        alert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(400px)';
        setTimeout(() => {
            alert.remove();
        }, 500);
    });
}, 5000);

// Reveal elements on scroll animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Unobserve after revealing to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with 'reveal' class
document.querySelectorAll('.reveal').forEach(element => {
    observer.observe(element);
});

// Form validation helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Add real-time input validation feedback
document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            this.style.borderColor = '#ff4d4f';
            showValidationMessage(this, 'Please enter a valid email address');
        } else {
            this.style.borderColor = '';
            hideValidationMessage(this);
        }
    });
    
    input.addEventListener('focus', function() {
        hideValidationMessage(this);
    });
});

document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value && !validatePhone(this.value)) {
            this.style.borderColor = '#ff4d4f';
            showValidationMessage(this, 'Please enter a valid phone number');
        } else {
            this.style.borderColor = '';
            hideValidationMessage(this);
        }
    });
    
    input.addEventListener('focus', function() {
        hideValidationMessage(this);
    });
});

function showValidationMessage(input, message) {
    hideValidationMessage(input);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ff4d4f;
        font-size: 14px;
        margin-top: 5px;
        animation: slideDown 0.3s ease;
    `;
    input.parentNode.appendChild(errorDiv);
}

function hideValidationMessage(input) {
    const error = input.parentNode.querySelector('.validation-error');
    if (error) {
        error.remove();
    }
}

// Price formatting utility
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Date formatting utility
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Loading spinner helper functions
function showLoading(element) {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    spinner.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 2rem;
        color: #667eea;
        z-index: 10;
    `;
    element.style.position = 'relative';
    element.appendChild(spinner);
}

function hideLoading(element) {
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

// Scroll to top button
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
    border: none;
    font-size: 20px;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 999;
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
`;

document.body.appendChild(scrollTopBtn);

// Show/hide scroll to top button based on scroll position
let scrollBtnTicking = false;
window.addEventListener('scroll', function() {
    if (!scrollBtnTicking) {
        window.requestAnimationFrame(function() {
            if (window.pageYOffset > 300) {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.visibility = 'visible';
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.visibility = 'hidden';
            }
            scrollBtnTicking = false;
        });
        scrollBtnTicking = true;
    }
});

// Scroll to top when button is clicked
scrollTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Scroll to top button hover effects
scrollTopBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px)';
    this.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)';
});

scrollTopBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
});

// Add CSS animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .loaded {
        animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Preload critical images for better performance
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Preload hero images on page load
if (document.querySelector('.hero-slide')) {
    const heroImages = [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920'
    ];
    preloadImages(heroImages);
}

// Detect slow network and show message
if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        console.log('Slow network detected. Optimizing image loading...');
    }
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }
});

// Add touch swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            if (typeof changeSlide === 'function') {
                changeSlide(1);
            }
        } else {
            // Swipe right - previous slide
            if (typeof changeSlide === 'function') {
                changeSlide(-1);
            }
        }
    }
}

// Performance monitoring (development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`%c⚡ Page Load Time: ${pageLoadTime}ms`, 'color: #52c41a; font-weight: bold;');
        }
    });
}

// Console welcome message with hotel branding
console.log('%c🏨 Grand Luxury Hotel', 'color: #e74c3c; font-size: 28px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);');
console.log('%c✨ Experience luxury like never before!', 'color: #2c3e50; font-size: 16px; font-weight: 500;');
console.log('%c📅 Date: 2025-11-06', 'color: #7f8c8d; font-size: 12px;');
console.log('%c👨‍💻 Developer: Atharva0177', 'color: #3498db; font-size: 12px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ecf0f1;');

// Initialize tooltips for better UX
function initTooltips() {
    const elementsWithTitle = document.querySelectorAll('[title]');
    elementsWithTitle.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const title = this.getAttribute('title');
            if (title) {
                this.setAttribute('data-title', title);
                this.removeAttribute('title');
                
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = title;
                tooltip.style.cssText = `
                    position: absolute;
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
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + window.scrollY + 'px';
                
                this._tooltip = tooltip;
            }
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                this._tooltip = null;
            }
            if (this.getAttribute('data-title')) {
                this.setAttribute('title', this.getAttribute('data-title'));
            }
        });
    });
}

// Initialize tooltips after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltips);
} else {
    initTooltips();
}

// Accessibility improvements
document.addEventListener('DOMContentLoaded', function() {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: #000;
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 10000;
    `;
    skipLink.addEventListener('focus', function() {
        this.style.top = '0';
    });
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content ID if not exists
    const mainContent = document.querySelector('main');
    if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
    }
});

// Service Worker registration for PWA support (optional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registered:', registration);
        }).catch(function(err) {
            console.log('ServiceWorker registration failed:', err);
        });
    });
}

// Export functions for use in other scripts
window.hotelUtils = {
    formatPrice,
    formatDate,
    validateEmail,
    validatePhone,
    showLoading,
    hideLoading,
    showValidationMessage,
    hideValidationMessage
};