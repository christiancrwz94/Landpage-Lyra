import './style.css';

// --- 1. Theme Management ---
const themeToggleBtn = document.getElementById('theme-toggle');
const bodyElement = document.body;

function updateTheme(isDark) {
  if (isDark) {
    bodyElement.classList.add('dark-theme');
    bodyElement.classList.remove('light-theme');
  } else {
    bodyElement.classList.add('light-theme');
    bodyElement.classList.remove('dark-theme');
  }
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  updateTheme(true);
} else {
  updateTheme(false);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isDark = bodyElement.classList.contains('dark-theme');
    updateTheme(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  });
}

// --- 2. Password Visibility Toggle ---
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordInput = document.getElementById('login-password');

if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    
    const eyeIcon = togglePasswordBtn.querySelector('.eye-icon');
    const eyeOffIcon = togglePasswordBtn.querySelector('.eye-off-icon');

    if (eyeIcon && eyeOffIcon) {
      if (isPassword) {
        eyeIcon.classList.add('hidden');
        eyeOffIcon.classList.remove('hidden');
      } else {
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
      }
    }
  });
}

// --- 3. Login Form Submit Handling ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const btnSubmit = document.getElementById('btn-submit-login');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailValue = emailInput ? emailInput.value.trim() : '';

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.classList.add('loading');
      btnSubmit.querySelector('span').textContent = 'Redirecionando...';
    }

    // Redirect to main web app login page
    let redirectUrl = 'https://app.getlyra.com.br/login';
    if (emailValue) {
      redirectUrl += `?email=${encodeURIComponent(emailValue)}`;
    }

    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 300);
  });
}
