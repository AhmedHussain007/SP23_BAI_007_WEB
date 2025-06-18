document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('showPassword');
    const submitButton = document.getElementById('submitButton');
    const formMessage = document.getElementById('formMessage');

    showPasswordCheckbox.addEventListener('change', () => {
        const isChecked = showPasswordCheckbox.checked;
        passwordInput.type = isChecked ? 'text' : 'password';
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!loginForm.checkValidity()) {
            event.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }

        const formData = {
            email: emailInput.value,
            password: passwordInput.value,
        };

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging In...';
            formMessage.innerHTML = '';

            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            console.log(result);

            if (response.ok) {
                const { isadmin } = result;
                formMessage.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
                loginForm.reset();
                loginForm.classList.remove('was-validated');

                setTimeout(() => {
                  if (isadmin) {
                    window.location.href = '/admin';
                  } else {
                    window.location.href = '/';
                  }
                }, 1500);
            } else {
                throw new Error(result.message || 'An error occurred during login.');
            }

        } catch (error) {
            formMessage.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Log In';
        }
    });
});
