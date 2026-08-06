import './style.css';

// --- 1. DARK MODE MANAGER ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const sunIcon = themeToggleBtn?.querySelector('.sun-icon');
const moonIcon = themeToggleBtn?.querySelector('.moon-icon');

function getInitialTheme() {
  const savedTheme = localStorage.getItem('lyra-theme');
  if (savedTheme) return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
  }
  localStorage.setItem('lyra-theme', theme);
}

applyTheme(getInitialTheme());

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

// --- 2. GTM / GA4 EVENT TRACKING ---
function trackCtaClick(label, section) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'cta_click',
    cta_label: label || 'comecar_gratis',
    cta_section: section || 'desconhecido'
  });
}

function trackFormEvent(eventName, details) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...details
  });
}

// Bind click tracking on all CTAs
document.querySelectorAll('[data-cta-label]').forEach(element => {
  element.addEventListener('click', () => {
    const label = element.getAttribute('data-cta-label');
    const section = element.getAttribute('data-cta-section');
    trackCtaClick(label, section);
  });
});

// --- 3. INTERSECTION OBSERVER SCROLL ANIMATIONS ---
const animatedElements = document.querySelectorAll('.animate-on-scroll');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        obs.unobserve(entry.target); // Animates ONCE
      }
    });
  }, {
    threshold: 0.15
  });

  animatedElements.forEach(el => observer.observe(el));
} else {
  animatedElements.forEach(el => el.classList.add('animated'));
}

// --- 4. DESKTOP PARALLAX ON MOCKUPS ---
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const parallaxTargets = document.querySelectorAll('.parallax-target');

if (!isTouchDevice && window.matchMedia('(min-width: 1025px)').matches) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        parallaxTargets.forEach(target => {
          const speed = 0.05; // Max 15-20px movement
          const yPos = -(scrolled * speed);
          target.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });
}

// --- 5. MOBILE DRAWER NAVIGATION ---
const btnHamburger = document.getElementById('btn-hamburger');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerClose = document.getElementById('drawer-close');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

function openDrawer() {
  if (mobileDrawer) mobileDrawer.classList.remove('hidden');
}

function closeDrawer() {
  if (mobileDrawer) mobileDrawer.classList.add('hidden');
}

if (btnHamburger) btnHamburger.addEventListener('click', openDrawer);
if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

mobileNavLinks.forEach(link => {
  link.addEventListener('click', closeDrawer);
});

// --- 6. ACCORDION LOGIC (AGENDA & FAQ) ---
function initAccordions(selector) {
  const items = document.querySelectorAll(selector);
  items.forEach(item => {
    const trigger = item.querySelector('.accordion-header, .faq-question');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

initAccordions('.accordion-item');
initAccordions('.faq-item');

// --- 7. MOBILE STICKY CTA BAR ---
const mobileStickyCta = document.getElementById('mobile-sticky-cta');

window.addEventListener('scroll', () => {
  if (window.scrollY > 450) {
    if (mobileStickyCta) mobileStickyCta.classList.add('visible');
  } else {
    if (mobileStickyCta) mobileStickyCta.classList.remove('visible');
  }
});

// --- 8. AUTH MODAL & FORM HANDLING ---
const authModal = document.getElementById('auth-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');

const btnLoginModals = document.querySelectorAll('.btn-login-modal');
const btnCtaSignups = document.querySelectorAll('.btn-cta-signup');

const signupFields = document.getElementById('signup-fields');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const submitBtnText = document.getElementById('submit-btn-text');
const submitBtnSpinner = document.getElementById('submit-btn-spinner');
const submitBtnArrow = document.getElementById('submit-btn-arrow');
const btnSubmitAuth = document.getElementById('btn-submit-auth');

const togglePromptText = document.getElementById('toggle-prompt-text');
const btnToggleMode = document.getElementById('btn-toggle-mode');
const passToggleBtn = document.getElementById('btn-toggle-pass');
const passwordInput = document.getElementById('input-password');
const authForm = document.getElementById('auth-form');
const authFeedback = document.getElementById('auth-feedback');

let isSignUpMode = false;

function openModal(signUpMode = false) {
  isSignUpMode = signUpMode;
  updateModalUI();
  clearFeedback();
  if (authModal) authModal.classList.remove('hidden');
  if (mobileStickyCta) mobileStickyCta.classList.add('hidden-override');
}

function closeModal() {
  if (authModal) authModal.classList.add('hidden');
  if (mobileStickyCta) mobileStickyCta.classList.remove('hidden-override');
  clearFeedback();
}

function clearFeedback() {
  if (authFeedback) {
    authFeedback.classList.add('hidden');
    authFeedback.classList.remove('success', 'error');
    authFeedback.textContent = '';
  }
}

function showFeedback(type, message) {
  if (authFeedback) {
    authFeedback.classList.remove('hidden', 'success', 'error');
    authFeedback.classList.add(type);
    authFeedback.textContent = message;
  }
}

function updateModalUI() {
  if (!signupFields || !modalTitle) return;
  if (isSignUpMode) {
    signupFields.classList.remove('hidden');
    modalTitle.textContent = 'Crie sua conta no Lyra';
    modalSubtitle.textContent = 'Comece seu teste gratuito de 7 dias em menos de 1 minuto.';
    submitBtnText.textContent = 'Criar Conta Gratuita';
    togglePromptText.textContent = 'Já possui uma conta?';
    btnToggleMode.textContent = 'Acessar minha conta';
  } else {
    signupFields.classList.add('hidden');
    modalTitle.textContent = 'Acesse sua conta';
    modalSubtitle.textContent = 'Entre para gerenciar sua clínica odontológica.';
    submitBtnText.textContent = 'Entrar no Sistema';
    togglePromptText.textContent = 'Ainda não possui uma conta?';
    btnToggleMode.textContent = 'Criar conta no Lyra';
  }
}

btnLoginModals.forEach(btn => {
  btn.addEventListener('click', () => {
    closeDrawer();
    openModal(false);
  });
});

btnCtaSignups.forEach(btn => {
  btn.addEventListener('click', () => {
    closeDrawer();
    openModal(true);
  });
});

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

if (btnToggleMode) {
  btnToggleMode.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    updateModalUI();
    clearFeedback();
  });
}

if (authModal) {
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
  });
}

if (passToggleBtn && passwordInput) {
  passToggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

    const eyeOpen = passToggleBtn.querySelector('.eye-open');
    const eyeClosed = passToggleBtn.querySelector('.eye-closed');

    if (eyeOpen && eyeClosed) {
      if (isPassword) {
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
      } else {
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
      }
    }
  });
}

// FORM SUBMISSION WITH LOADING & FEEDBACK
if (authForm) {
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();

    const emailInput = document.getElementById('input-email');
    const passwordInput = document.getElementById('input-password');
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!email || !password) {
      showFeedback('error', 'Por favor, preencha todos os campos obrigatórios.');
      trackFormEvent('form_submit_error', { reason: 'missing_fields' });
      return;
    }

    // Set Loading State
    if (btnSubmitAuth) btnSubmitAuth.disabled = true;
    if (submitBtnSpinner) submitBtnSpinner.classList.remove('hidden');
    if (submitBtnArrow) submitBtnArrow.classList.add('hidden');
    if (submitBtnText) submitBtnText.textContent = isSignUpMode ? 'Criando conta...' : 'Entrando...';

    // Async Request Simulation
    setTimeout(() => {
      // Restore Button State
      if (btnSubmitAuth) btnSubmitAuth.disabled = false;
      if (submitBtnSpinner) submitBtnSpinner.classList.add('hidden');
      if (submitBtnArrow) submitBtnArrow.classList.remove('hidden');
      if (submitBtnText) submitBtnText.textContent = isSignUpMode ? 'Criar Conta Gratuita' : 'Entrar no Sistema';

      showFeedback('success', isSignUpMode ? 'Conta iniciada com sucesso! Redirecionando...' : 'Acesso autorizado! Redirecionando...');
      trackFormEvent('form_submit_success', { mode: isSignUpMode ? 'signup' : 'login', email });

      // REDIRECT DESTINATION (Production App URL)
      let targetUrl = 'https://app.getlyra.com.br';
      if (isSignUpMode) {
        targetUrl += `/?signup=true&email=${encodeURIComponent(email)}`;
      } else {
        targetUrl += `/login?email=${encodeURIComponent(email)}`;
      }

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 1000);
    }, 1200);
  });
}
