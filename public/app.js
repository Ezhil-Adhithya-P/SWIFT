// ============================================
// SWIFT OTP — Frontend Logic
// ============================================

const API_BASE = '';

// State
let currentPhone = '';
let currentOtp = ''; // stored only in demo mode
let resendTimerInterval = null;

// ============================================
// Background Particles
// ============================================
(function initParticles() {
    const container = document.getElementById('bgParticles');
    const PARTICLE_COUNT = 35;
    const colors = ['#6C63FF', '#3B82F6', '#818CF8', '#A78BFA', '#60A5FA'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 4 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const duration = Math.random() * 12 + 8;
        const delay = Math.random() * 10;

        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            background: ${color};
            box-shadow: 0 0 ${size * 3}px ${color};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;
        container.appendChild(p);
    }
})();

// ============================================
// Step Navigation
// ============================================
function showStep(stepId) {
    document.querySelectorAll('.step').forEach((el) => {
        el.classList.remove('active');
    });
    const target = document.getElementById(stepId);
    if (target) {
        // Small delay for nicer animation
        setTimeout(() => target.classList.add('active'), 50);
    }
}

// ============================================
// Phone Validation
// ============================================
function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) return 'Phone number is required.';
    if (cleaned.length < 10) return 'Enter a valid 10-digit phone number.';
    return null;
}

// ============================================
// Send OTP
// ============================================
async function handleSendOTP() {
    const phoneInput = document.getElementById('phoneInput');
    const phoneGroup = document.getElementById('phoneGroup');
    const phoneError = document.getElementById('phoneError');
    const btn = document.getElementById('sendOtpBtn');

    const phone = phoneInput.value.trim();
    const error = validatePhone(phone);

    // Clear previous errors
    phoneGroup.classList.remove('error');
    phoneError.textContent = '';

    if (error) {
        phoneGroup.classList.add('error');
        phoneError.textContent = error;
        phoneInput.focus();
        return;
    }

    // Format phone with country code
    const cleaned = phone.replace(/\D/g, '');
    const fullPhone = '+91' + cleaned;

    // Loading state
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/api/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: fullPhone }),
        });

        const data = await response.json();

        if (data.success) {
            currentPhone = fullPhone;

            // Set display phone
            document.getElementById('displayPhone').textContent = maskPhone(fullPhone);

            // Demo mode: show the OTP
            if (data.mode === 'demo' && data.otp) {
                currentOtp = data.otp;
                document.getElementById('demoBanner').style.display = 'flex';
                document.getElementById('demoOtp').innerHTML = `<strong>${data.otp}</strong>`;
            } else if (data.mode === 'lan') {
                document.getElementById('demoBanner').style.display = 'flex';
                document.getElementById('demoBanner').style.background = 'rgba(59, 130, 246, 0.1)';
                document.getElementById('demoBanner').style.borderColor = 'rgba(59, 130, 246, 0.3)';
                document.getElementById('demoBanner').style.color = '#3B82F6';
                document.getElementById('demoBanner').innerHTML = `
                    <span class="demo-label" style="background:#3B82F6">LAN MODE</span>
                    <span>Check your connected phone for the OTP!</span>
                `;
            } else {
                document.getElementById('demoBanner').style.display = 'none';
            }

            // Navigate to OTP step
            showStep('step-otp');
            startResendTimer();

            // Focus first OTP input
            setTimeout(() => {
                document.querySelector('.otp-digit[data-index="0"]').focus();
            }, 300);
        } else {
            phoneGroup.classList.add('error');
            phoneError.textContent = data.message || 'Failed to send OTP.';
        }
    } catch (err) {
        phoneGroup.classList.add('error');
        phoneError.textContent = 'Network error. Please check your connection.';
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ============================================
// Verify OTP
// ============================================
async function handleVerifyOTP() {
    const otpDigits = document.querySelectorAll('.otp-digit');
    const otpError = document.getElementById('otpError');
    const btn = document.getElementById('verifyOtpBtn');

    // Collect OTP
    let otp = '';
    otpDigits.forEach((input) => (otp += input.value));

    // Clear previous errors
    otpError.textContent = '';
    otpDigits.forEach((d) => d.classList.remove('error'));

    if (otp.length < 6) {
        otpError.textContent = 'Please enter all 6 digits.';
        otpDigits.forEach((d) => {
            if (!d.value) d.classList.add('error');
        });
        return;
    }

    // Loading state
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/api/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: currentPhone, otp }),
        });

        const data = await response.json();

        // Clear timer
        clearInterval(resendTimerInterval);

        if (data.success) {
            showResult('success');
        } else {
            showResult('failure', data.message);
        }
    } catch (err) {
        otpError.textContent = 'Network error. Please try again.';
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ============================================
// Show Result
// ============================================
function showResult(type, message) {
    const container = document.getElementById('resultContainer');

    if (type === 'success') {
        container.innerHTML = `
            <div class="result-icon success">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M10 20L17 27L30 13" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 class="result-title success">Verification Successful!</h2>
            <p class="result-message">
                Your phone number <strong>${maskPhone(currentPhone)}</strong> has been verified successfully.
                <br/>You're all set!
            </p>
        `;
        launchConfetti();
    } else {
        container.innerHTML = `
            <div class="result-icon failure">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M12 12L28 28M28 12L12 28" stroke="#EF4444" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 class="result-title failure">Verification Failed</h2>
            <p class="result-message">
                ${message || 'The OTP you entered is invalid or has expired.'}
                <br/>Please try again.
            </p>
        `;
    }

    showStep('step-result');
}

// ============================================
// Resend OTP Timer
// ============================================
function startResendTimer() {
    let seconds = 30;
    const timerEl = document.getElementById('resendTimer');
    const countEl = document.getElementById('timerCount');
    const resendBtn = document.getElementById('resendBtn');

    timerEl.style.display = 'inline';
    resendBtn.style.display = 'none';

    clearInterval(resendTimerInterval);

    resendTimerInterval = setInterval(() => {
        seconds--;
        countEl.textContent = seconds;

        if (seconds <= 0) {
            clearInterval(resendTimerInterval);
            timerEl.style.display = 'none';
            resendBtn.style.display = 'inline';
        }
    }, 1000);
}

async function handleResendOTP() {
    // Clear OTP inputs
    document.querySelectorAll('.otp-digit').forEach((d) => {
        d.value = '';
        d.classList.remove('filled', 'error');
    });
    document.getElementById('otpError').textContent = '';

    // Re-send
    const btn = document.getElementById('verifyOtpBtn');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/api/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: currentPhone }),
        });

        const data = await response.json();

        if (data.success) {
            if (data.mode === 'demo' && data.otp) {
                currentOtp = data.otp;
                // reset banner to demo mode if it was changed
                document.getElementById('demoBanner').style.background = 'var(--warning-bg)';
                document.getElementById('demoBanner').style.borderColor = 'var(--warning-border)';
                document.getElementById('demoBanner').style.color = 'var(--warning)';
                document.getElementById('demoBanner').innerHTML = `
                    <span class="demo-label">DEMO MODE</span>
                    <span>Your OTP is: <strong id="demoOtp">${data.otp}</strong></span>
                `;
                document.getElementById('demoBanner').style.display = 'flex';
            } else if (data.mode === 'lan') {
                document.getElementById('demoBanner').style.display = 'flex';
            }
            startResendTimer();
            document.querySelector('.otp-digit[data-index="0"]').focus();
        }
    } catch (err) {
        document.getElementById('otpError').textContent = 'Failed to resend OTP.';
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ============================================
// Go Back / Reset
// ============================================
function goBack() {
    clearInterval(resendTimerInterval);
    clearOtpInputs();
    showStep('step-phone');
}

function resetAll() {
    clearInterval(resendTimerInterval);
    currentPhone = '';
    currentOtp = '';
    document.getElementById('phoneInput').value = '';
    clearOtpInputs();
    showStep('step-phone');
}

function clearOtpInputs() {
    document.querySelectorAll('.otp-digit').forEach((d) => {
        d.value = '';
        d.classList.remove('filled', 'error');
    });
    document.getElementById('otpError').textContent = '';
}

// ============================================
// OTP Input Behavior
// ============================================
document.querySelectorAll('.otp-digit').forEach((input, index, inputs) => {
    // Only allow numbers
    input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val;

        if (val) {
            e.target.classList.add('filled');
            e.target.classList.remove('error');
            // Move to next
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        } else {
            e.target.classList.remove('filled');
        }
    });

    // Handle backspace
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
            inputs[index - 1].value = '';
            inputs[index - 1].classList.remove('filled');
        }

        // Enter to verify
        if (e.key === 'Enter') {
            handleVerifyOTP();
        }
    });

    // Handle paste
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        pasted.split('').forEach((char, i) => {
            if (inputs[i]) {
                inputs[i].value = char;
                inputs[i].classList.add('filled');
            }
        });
        if (pasted.length > 0) {
            const focusIdx = Math.min(pasted.length, inputs.length - 1);
            inputs[focusIdx].focus();
        }
    });
});

// Enter on phone input → send OTP
document.getElementById('phoneInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSendOTP();
});

// ============================================
// Helpers
// ============================================
function maskPhone(phone) {
    if (phone.length >= 10) {
        return phone.slice(0, -4).replace(/./g, (c, i) => (i < 3 ? c : '•')) + phone.slice(-4);
    }
    return phone;
}

// ============================================
// Confetti 🎉
// ============================================
function launchConfetti() {
    const colors = ['#6C63FF', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#EC4899', '#A78BFA'];
    const shapes = ['square', 'circle'];

    for (let i = 0; i < 60; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti-piece');

        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const left = Math.random() * 100;
        const size = Math.random() * 8 + 6;
        const duration = Math.random() * 2 + 1.5;
        const delay = Math.random() * 0.5;

        confetti.style.cssText = `
            left: ${left}%;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${shape === 'circle' ? '50%' : '2px'};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        document.body.appendChild(confetti);

        // Cleanup
        setTimeout(() => confetti.remove(), (duration + delay) * 1000 + 100);
    }
}
