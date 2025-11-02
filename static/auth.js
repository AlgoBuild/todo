// Handle login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorMsg = document.getElementById('error-message');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        errorMsg.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                window.location.href = '/';
            } else {
                errorMsg.textContent = data.error || 'Login failed';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        } catch (error) {
            errorMsg.textContent = 'An error occurred. Please try again.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
}

// Handle signup form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorMsg = document.getElementById('error-message');
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        errorMsg.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing up...';
        
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                window.location.href = '/';
            } else {
                errorMsg.textContent = data.error || 'Signup failed';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up';
            }
        } catch (error) {
            errorMsg.textContent = 'An error occurred. Please try again.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    });
}

