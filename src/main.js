import './style.css';

// --- 1. Theme Management (Dark/Light Mode) ---
const themeToggleBtn = document.getElementById('theme-toggle');
const bodyElement = document.body;
const navbarLogo = document.getElementById('navbar-logo');
const footerLogo = document.getElementById('footer-logo');

// Set logo filters or toggle sources depending on theme
function updateLogoForTheme(isDark) {
  // We can use a CSS class filter or dynamically set sources.
  // Using the SVG files:
  if (isDark) {
    bodyElement.classList.add('dark-theme');
    bodyElement.classList.remove('light-theme');
    // logo_lyra.svg is the primary colored logo, logo_lyra_black.svg is black.
    // In dark theme, we can invert the black logo or use the colored one.
    // The logo_lyra.svg will be styled via CSS filter if needed.
  } else {
    bodyElement.classList.add('light-theme');
    bodyElement.classList.remove('dark-theme');
  }
}

// Initial theme check
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  updateLogoForTheme(true);
} else {
  updateLogoForTheme(false);
}

// Toggle theme on button click
themeToggleBtn.addEventListener('click', () => {
  const isDark = bodyElement.classList.contains('dark-theme');
  updateLogoForTheme(!isDark);
  localStorage.setItem('theme', !isDark ? 'dark' : 'light');
});


// --- 2. Mobile Menu Navigation Overlay ---
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

function openMobileMenu() {
  mobileMenuOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeMobileMenu() {
  mobileMenuOverlay.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

mobileMenuToggle.addEventListener('click', openMobileMenu);
mobileMenuClose.addEventListener('click', closeMobileMenu);

// Close menu when a link is clicked
mobileNavLinks.forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});


// --- 3. Segmented Plan Selector (Mobile Cards Toggle) ---
const planSelector = document.getElementById('plan-selector');
const segmentBtns = planSelector.querySelectorAll('.segment-btn');
const pricingCards = document.querySelectorAll('#pricing-cards .pricing-card');

segmentBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const selectedIndex = e.currentTarget.getAttribute('data-index');
    
    // Update active segment button
    segmentBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // Show corresponding pricing card
    pricingCards.forEach(card => {
      card.classList.remove('active');
      if (card.getAttribute('data-plan') === selectedIndex) {
        card.classList.add('active');
      }
    });
  });
});


// --- 4. Smooth Scroll Actions & Active Link Highlighting ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      const offsetHeader = 64; // Navbar height
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offsetHeader;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});


// --- 5. Registration Modal Management (SaaS Apple Standard) ---
const registerModal = document.getElementById('register-modal');
const modalCloseBtn = document.getElementById('modal-close');
const triggerModalBtns = document.querySelectorAll('.trigger-modal');
const registerForm = document.getElementById('register-form');
const phoneInput = document.getElementById('reg-phone');

// Inputs for validation
const clinicInput = document.getElementById('reg-clinic');
const branchInput = document.getElementById('reg-branch');
const nameInput = document.getElementById('reg-name');
const emailInput = document.getElementById('reg-email');

// Error message elements
const errorClinic = document.getElementById('error-clinic');
const errorBranch = document.getElementById('error-branch');
const errorName = document.getElementById('error-name');
const errorEmail = document.getElementById('error-email');
const errorPhone = document.getElementById('error-phone');

function openModal() {
  registerModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock page scroll
}

function closeModal() {
  registerModal.classList.remove('active');
  document.body.style.overflow = ''; // Unlock page scroll
  resetFormErrors();
}

function resetFormErrors() {
  const errorMsgs = registerForm.querySelectorAll('.error-msg');
  const inputs = registerForm.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], select');
  
  errorMsgs.forEach(msg => msg.classList.remove('visible'));
  inputs.forEach(input => input.classList.remove('invalid'));
}

// Attach triggers
triggerModalBtns.forEach(btn => {
  btn.addEventListener('click', openModal);
});

// Close triggers
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeModal);
}

if (registerModal) {
  registerModal.addEventListener('click', (e) => {
    if (e.target === registerModal) {
      closeModal();
    }
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && registerModal.classList.contains('active')) {
    closeModal();
  }
});

// Phone Input Masking (Brazil formatting: (XX) XXXXX-XXXX)
if (phoneInput) {
  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    if (value.length > 10) {
      // (XX) XXXXX-XXXX
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 6) {
      // (XX) XXXX-XXXX
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
      // (XX) XXXX
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      // (XX
      e.target.value = `(${value}`;
    } else {
      e.target.value = '';
    }
  });
}

// Form Submission with pre-filled redirect parameters
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    resetFormErrors();
    
    let isValid = true;
    
    // Validate Clinic
    if (!clinicInput.value.trim()) {
      clinicInput.classList.add('invalid');
      errorClinic.classList.add('visible');
      isValid = false;
    }
    
    // Validate Branch
    if (!branchInput.value) {
      branchInput.classList.add('invalid');
      errorBranch.classList.add('visible');
      isValid = false;
    }
    
    // Validate Name
    if (!nameInput.value.trim()) {
      nameInput.classList.add('invalid');
      errorName.classList.add('visible');
      isValid = false;
    }
    
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      emailInput.classList.add('invalid');
      errorEmail.classList.add('visible');
      isValid = false;
    }
    
    // Validate Phone (at least 10 digits without mask)
    const rawPhone = phoneInput.value.replace(/\D/g, '');
    if (rawPhone.length < 10) {
      phoneInput.classList.add('invalid');
      errorPhone.classList.add('visible');
      isValid = false;
    }
    
    if (isValid) {
      // Collect values and redirect to app registration screen with query params
      const clinic = clinicInput.value.trim();
      const branch = branchInput.value;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      
      const encodedClinic = encodeURIComponent(clinic);
      const encodedBranch = encodeURIComponent(branch);
      const encodedName = encodeURIComponent(name);
      const encodedEmail = encodeURIComponent(email);
      const encodedPhone = encodeURIComponent(phone);
      
      // Go to register url
      const registerUrl = `https://app.getlyra.com.br/register?email=${encodedEmail}&nome=${encodedName}&telefone=${encodedPhone}&clinica=${encodedClinic}&ramo=${encodedBranch}`;
      
      window.location.href = registerUrl;
    }
  });
}

