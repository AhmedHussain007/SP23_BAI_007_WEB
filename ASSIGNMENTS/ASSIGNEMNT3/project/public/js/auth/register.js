document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const passwordError = document.getElementById('passwordError');
    const showPasswordCheckbox = document.getElementById('showPassword');
    const submitButton = document.getElementById('submitButton');
    const formMessage = document.getElementById('formMessage');

    // OTP buttons and inputs
    const sendEmailOtpBtn = document.querySelector('#email + button');
    const sendPhoneOtpBtn = document.querySelector('#phone + button');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const emailOtpInput = document.getElementById('emailOtp');
    const phoneOtpInput = document.getElementById('phoneOtp');

    // Temporary store for OTPs
    let generatedEmailOtp = '';
    let generatedPhoneOtp = '';

    const validatePasswords = () => {
        if (password.value !== confirmPassword.value && confirmPassword.value) {
            confirmPassword.classList.add('is-invalid');
            passwordError.style.display = 'block';
            submitButton.disabled = true;
        } else {
            confirmPassword.classList.remove('is-invalid');
            passwordError.style.display = 'none';
            if (confirmPassword.value) {
                confirmPassword.classList.add('is-valid');
            } else {
                confirmPassword.classList.remove('is-valid');
            }
            submitButton.disabled = false;
        }
    };

    password.addEventListener('keyup', validatePasswords);
    confirmPassword.addEventListener('keyup', validatePasswords);

    showPasswordCheckbox.addEventListener('change', () => {
        const isChecked = showPasswordCheckbox.checked;
        password.type = confirmPassword.type = isChecked ? 'text' : 'password';
    });

    // Send Email OTP
    sendEmailOtpBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        if (!email) return alert('Please enter an email first.');
        sendEmailOtpBtn.disabled = true;
        sendEmailOtpBtn.innerText = 'Sending...';

        try {
            const res = await fetch('/auth/send-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                generatedEmailOtp = data.otp;
                alert('Email OTP sent!');
            } else {
                throw new Error(data.message || 'Failed to send email OTP');
            }
        } catch (err) {
            alert(err.message);
        } finally {
            sendEmailOtpBtn.disabled = false;
            sendEmailOtpBtn.innerText = 'Send OTP';
        }
    });

    // Send Phone OTP
    sendPhoneOtpBtn.addEventListener('click', async () => {
        const phone = phoneInput.value;
        if (!phone) return alert('Please enter a phone number first.');
        sendPhoneOtpBtn.disabled = true;
        sendPhoneOtpBtn.innerText = 'Sending...';

        try {
            const res = await fetch('/auth/send-phone-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();

            if (res.ok) {
                generatedPhoneOtp = data.otp;
                alert('Phone OTP sent!');
            } else {
                throw new Error(data.message || 'Failed to send phone OTP');
            }
        } catch (err) {
            alert(err.message);
        } finally {
            sendPhoneOtpBtn.disabled = false;
            sendPhoneOtpBtn.innerText = 'Send OTP';
        }
    });

    // Form submission
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        validatePasswords();
        if (password.value !== confirmPassword.value) {
            formMessage.innerHTML = `<div class="alert alert-danger">Passwords do not match.</div>`;
            return;
        }

        if (!registrationForm.checkValidity()) {
            registrationForm.classList.add('was-validated');
            return;
        }

        // OTP validation
        if (emailOtpInput.value != generatedEmailOtp) {
            formMessage.innerHTML = `<div class="alert alert-danger">Invalid Email OTP</div>`;
            return;
        }
        if (phoneOtpInput.value != generatedPhoneOtp) {
            formMessage.innerHTML = `<div class="alert alert-danger">Invalid Phone OTP</div>`;
            return;
        }

        const formData = new FormData();
        formData.append('firstName', document.getElementById('firstName').value);
        formData.append('lastName', document.getElementById('lastName').value);
        formData.append('email', emailInput.value);
        formData.append('password', password.value);
        formData.append('phone', phoneInput.value);

        const imageFile = document.getElementById('profileImage').files[0];
        if (imageFile) {
            formData.append('profileImage', imageFile);
        }

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';

            const response = await fetch('/auth/register', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                formMessage.innerHTML = `<p class="alert alert-success">${result.message}</p>`;
                registrationForm.reset();
                registrationForm.classList.remove('was-validated');
                ['password', 'confirmPassword'].forEach(id => document.getElementById(id).classList.remove('is-valid'));
                setTimeout(() => { window.location.href = '/auth/login'; }, 1000);
            } else {
                throw new Error(result.message || 'An error occurred.');
            }
        } catch (error) {
            formMessage.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Account';
        }
    });
});
