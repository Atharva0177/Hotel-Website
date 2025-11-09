// Booking Form JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const checkInInput = document.getElementById('check_in');
    const checkOutInput = document.getElementById('check_out');
    const guestsInput = document.getElementById('guests');
    
    // Set minimum dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (checkInInput) {
        checkInInput.min = today.toISOString().split('T')[0];
        
        checkInInput.addEventListener('change', function() {
            const checkInDate = new Date(this.value);
            const minCheckOut = new Date(checkInDate);
            minCheckOut.setDate(minCheckOut.getDate() + 1);
            
            if (checkOutInput) {
                checkOutInput.min = minCheckOut.toISOString().split('T')[0];
                
                // Reset check-out if it's before new minimum
                if (checkOutInput.value) {
                    const checkOutDate = new Date(checkOutInput.value);
                    if (checkOutDate <= checkInDate) {
                        checkOutInput.value = '';
                    }
                }
            }
            
            updateSummary();
        });
    }
    
    if (checkOutInput) {
        checkOutInput.addEventListener('change', updateSummary);
    }
    
    if (guestsInput) {
        guestsInput.addEventListener('change', updateSummary);
    }
    
    // Form validation
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            let isValid = true;
            const errors = [];
            
            // Validate guest name
            const guestName = document.getElementById('guest_name');
            if (guestName && guestName.value.trim().length < 2) {
                errors.push('Please enter a valid name');
                guestName.style.borderColor = '#ff4d4f';
                isValid = false;
            } else if (guestName) {
                guestName.style.borderColor = '';
            }
            
            // Validate email
            const guestEmail = document.getElementById('guest_email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (guestEmail && !emailRegex.test(guestEmail.value)) {
                errors.push('Please enter a valid email address');
                guestEmail.style.borderColor = '#ff4d4f';
                isValid = false;
            } else if (guestEmail) {
                guestEmail.style.borderColor = '';
            }
            
            // Validate phone
            const guestPhone = document.getElementById('guest_phone');
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (guestPhone && (!phoneRegex.test(guestPhone.value) || guestPhone.value.replace(/\D/g, '').length < 10)) {
                errors.push('Please enter a valid phone number');
                guestPhone.style.borderColor = '#ff4d4f';
                isValid = false;
            } else if (guestPhone) {
                guestPhone.style.borderColor = '';
            }
            
            // Validate dates
            if (checkInInput && checkOutInput) {
                const checkIn = new Date(checkInInput.value);
                const checkOut = new Date(checkOutInput.value);
                
                if (checkOut <= checkIn) {
                    errors.push('Check-out date must be after check-in date');
                    checkOutInput.style.borderColor = '#ff4d4f';
                    isValid = false;
                } else {
                    checkOutInput.style.borderColor = '';
                }
            }
            
            if (!isValid) {
                e.preventDefault();
                alert('Please correct the following errors:\n\n' + errors.join('\n'));
            } else {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                }
            }
        });
    }
});

function updateSummary() {
    const checkIn = document.getElementById('check_in')?.value;
    const checkOut = document.getElementById('check_out')?.value;
    const guests = document.getElementById('guests')?.value || 1;
    
    // Update display values
    const displayCheckIn = document.getElementById('displayCheckIn');
    const displayCheckOut = document.getElementById('displayCheckOut');
    const displayGuests = document.getElementById('displayGuests');
    const displayNights = document.getElementById('displayNights');
    
    if (displayCheckIn) displayCheckIn.textContent = checkIn || '-';
    if (displayCheckOut) displayCheckOut.textContent = checkOut || '-';
    if (displayGuests) displayGuests.textContent = guests;
    
    if (checkIn && checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        if (nights > 0 && displayNights) {
            displayNights.textContent = nights;
            
            // Update price if roomPrice is defined
            if (typeof roomPrice !== 'undefined') {
                updatePriceBreakdown(nights, roomPrice);
            }
        }
    }
}

function updatePriceBreakdown(nights, pricePerNight) {
    const priceNights = document.getElementById('priceNights');
    const priceSubtotal = document.getElementById('priceSubtotal');
    const priceServiceFee = document.getElementById('priceServiceFee');
    const priceTax = document.getElementById('priceTax');
    const priceTotal = document.getElementById('priceTotal');
    
    const subtotal = nights * pricePerNight;
    const serviceFee = subtotal * 0.1;
    const tax = subtotal * 0.08;
    const total = subtotal + serviceFee + tax;
    
    if (priceNights) priceNights.textContent = nights;
    if (priceSubtotal) priceSubtotal.textContent = formatCurrency(subtotal);
    if (priceServiceFee) priceServiceFee.textContent = formatCurrency(serviceFee);
    if (priceTax) priceTax.textContent = formatCurrency(tax);
    if (priceTotal) priceTotal.textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

// Auto-format phone number
const phoneInput = document.getElementById('guest_phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 6) {
                value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
            } else {
                value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6, 10);
            }
        }
        e.target.value = value;
    });
}

// Add visual feedback for required fields
document.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
    field.addEventListener('invalid', function() {
        this.style.borderColor = '#ff4d4f';
    });
    
    field.addEventListener('input', function() {
        if (this.validity.valid) {
            this.style.borderColor = '';
        }
    });
});