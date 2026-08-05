import './style.css';

// --- 1. CAROUSEL & SLIDE MANAGEMENT ---
const slides = document.querySelectorAll('.slide-item');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prev-slide-btn');
const nextBtn = document.getElementById('next-slide-btn');

let currentSlide = 0;
const totalSlides = slides.length;
let autoSlideTimer = null;

function goToSlide(index) {
  if (index < 0) {
    index = totalSlides - 1;
  } else if (index >= totalSlides) {
    index = 0;
  }

  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  dots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  currentSlide = index;
  resetAutoSlide();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

function resetAutoSlide() {
  if (autoSlideTimer) clearInterval(autoSlideTimer);
  autoSlideTimer = setInterval(() => {
    nextSlide();
  }, 6000);
}

// Event Listeners for Carousel
if (nextBtn) nextBtn.addEventListener('click', nextSlide);
if (prevBtn) prevBtn.addEventListener('click', prevSlide);

dots.forEach((dot) => {
  dot.addEventListener('click', (e) => {
    const targetIndex = parseInt(e.currentTarget.getAttribute('data-slide'), 10);
    goToSlide(targetIndex);
  });
});

// Keyboard Left / Right Navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft') prevSlide();
});

// Touch Swipe Support
let touchStartX = 0;
let touchEndX = 0;
const slidesContainer = document.getElementById('slides-container');

if (slidesContainer) {
  slidesContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slidesContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
}

function handleSwipe() {
  const swipeThreshold = 40;
  if (touchEndX < touchStartX - swipeThreshold) nextSlide();
  if (touchEndX > touchStartX + swipeThreshold) prevSlide();
}

// Start Auto-Slide
resetAutoSlide();

// --- 2. AUTH MODAL & FORM LOGIC ---
const authModal = document.getElementById('auth-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const btnHeaderLogin = document.getElementById('btn-header-login');
const btnCreateAccount = document.getElementById('btn-create-account');
const btnLoginAccount = document.getElementById('btn-login-account');

const signupFields = document.getElementById('signup-fields');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const submitBtnText = document.getElementById('submit-btn-text');
const togglePromptText = document.getElementById('toggle-prompt-text');
const btnToggleMode = document.getElementById('btn-toggle-mode');
const passToggleBtn = document.getElementById('btn-toggle-pass');
const passwordInput = document.getElementById('input-password');
const authForm = document.getElementById('auth-form');

let isSignUpMode = false;

function openModal(signUpMode = false) {
  isSignUpMode = signUpMode;
  updateModalUI();
  authModal.classList.remove('hidden');
}

function closeModal() {
  authModal.classList.add('hidden');
}

function updateModalUI() {
  if (isSignUpMode) {
    signupFields.classList.remove('hidden');
    modalTitle.textContent = 'Crie sua conta';
    modalSubtitle.textContent = 'Comece seu teste gratuito em menos de 1 minuto.';
    submitBtnText.textContent = 'Criar conta gratuita';
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

// Modal Listeners
if (btnHeaderLogin) btnHeaderLogin.addEventListener('click', () => openModal(false));
if (btnLoginAccount) btnLoginAccount.addEventListener('click', () => openModal(false));
if (btnCreateAccount) btnCreateAccount.addEventListener('click', () => openModal(true));
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

if (btnToggleMode) {
  btnToggleMode.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    updateModalUI();
  });
}

// Close Modal on backdrop click
if (authModal) {
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
  });
}

// Toggle Password Visibility
if (passToggleBtn && passwordInput) {
  passToggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    
    const eyeOpen = passToggleBtn.querySelector('.eye-open');
    const eyeClosed = passToggleBtn.querySelector('.eye-closed');

    if (isPassword) {
      eyeOpen.classList.add('hidden');
      eyeClosed.classList.remove('hidden');
    } else {
      eyeOpen.classList.remove('hidden');
      eyeClosed.classList.add('hidden');
    }
  });
}

// Submit Form Handler
if (authForm) {
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('input-email').value.trim();

    let targetUrl = 'https://app.getlyra.com.br';
    if (isSignUpMode) {
      targetUrl += '/?signup=true';
      if (email) targetUrl += `&email=${encodeURIComponent(email)}`;
    } else {
      targetUrl += '/login';
      if (email) targetUrl += `?email=${encodeURIComponent(email)}`;
    }

    window.location.href = targetUrl;
  });
}
