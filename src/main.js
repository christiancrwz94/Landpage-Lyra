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

// --- 2. Smooth Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      const navbarHeight = 64;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// --- 3. Reused Phone Mockup App Screenshot Carousel ---
const carouselTrack = document.getElementById('phone-slider-track');
const phoneSlides = document.querySelectorAll('.phone-slide');
const carouselTabs = document.querySelectorAll('#app-carousel-tabs .carousel-tab');
const carouselDots = document.querySelectorAll('#carousel-dots .dot-item');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const carouselContainer = document.querySelector('.carousel-wrapper');

if (carouselTrack && phoneSlides.length > 0) {
  let currentSlide = 0;
  const REAL_SLIDES_COUNT = 4;
  let isTransitioning = false;
  let autoPlayTimer = null;
  const SLOW_INTERVAL_MS = 6500;

  function goToSlide(index, animate = true) {
    if (animate) {
      carouselTrack.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      carouselTrack.style.transition = 'none';
    }

    currentSlide = index;
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    const normalizedIndex = currentSlide % REAL_SLIDES_COUNT;

    carouselTabs.forEach((tab, idx) => {
      tab.classList.toggle('active', idx === normalizedIndex);
    });

    carouselDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === normalizedIndex);
    });
  }

  function nextSlide() {
    if (isTransitioning) return;
    
    if (currentSlide >= REAL_SLIDES_COUNT - 1) {
      isTransitioning = true;
      goToSlide(REAL_SLIDES_COUNT, true);

      setTimeout(() => {
        goToSlide(0, false);
        isTransitioning = false;
      }, 860);
    } else {
      goToSlide(currentSlide + 1, true);
    }
  }

  function prevSlide() {
    if (isTransitioning) return;

    if (currentSlide <= 0) {
      goToSlide(REAL_SLIDES_COUNT, false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          goToSlide(REAL_SLIDES_COUNT - 1, true);
        });
      });
    } else {
      goToSlide(currentSlide - 1, true);
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      nextSlide();
    }, SLOW_INTERVAL_MS);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  carouselTabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      goToSlide(idx, true);
      resetAutoPlay();
    });
  });

  carouselDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx, true);
      resetAutoPlay();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });
  }

  // Touch Swipe Gesture Support
  let touchStartX = 0;
  let touchEndX = 0;

  carouselTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 35;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide();
      resetAutoPlay();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide();
      resetAutoPlay();
    }
  }

  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoPlay);
    carouselContainer.addEventListener('mouseleave', startAutoPlay);
  }

  goToSlide(0, false);
  startAutoPlay();
}



// --- 5. FAQ Accordion ---
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const questionBtn = item.querySelector('.faq-question');
  if (questionBtn) {
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(otherItem => otherItem.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  }
});

// --- 6. Registration Modal & Phone Mask ---
const registerModal = document.getElementById('register-modal');
const modalCloseBtn = document.getElementById('modal-close');
const triggerModalBtns = document.querySelectorAll('.trigger-modal');
const registerForm = document.getElementById('register-form');
const phoneInput = document.getElementById('reg-phone');

const clinicInput = document.getElementById('reg-clinic');
const nameInput = document.getElementById('reg-name');
const emailInput = document.getElementById('reg-email');

const errorClinic = document.getElementById('error-clinic');
const errorName = document.getElementById('error-name');
const errorEmail = document.getElementById('error-email');
const errorPhone = document.getElementById('error-phone');

function openModal() {
  if (registerModal) {
    registerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  if (registerModal) {
    registerModal.classList.remove('active');
    document.body.style.overflow = '';
    resetFormErrors();
  }
}

function resetFormErrors() {
  if (!registerForm) return;
  const errorMsgs = registerForm.querySelectorAll('.error-msg');
  const inputs = registerForm.querySelectorAll('input');
  
  errorMsgs.forEach(msg => msg.classList.remove('visible'));
  inputs.forEach(input => input.classList.remove('invalid'));
}

triggerModalBtns.forEach(btn => btn.addEventListener('click', openModal));
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

if (registerModal) {
  registerModal.addEventListener('click', (e) => {
    if (e.target === registerModal) closeModal();
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && registerModal && registerModal.classList.contains('active')) {
    closeModal();
  }
});

if (phoneInput) {
  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 6) {
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      e.target.value = `(${value}`;
    } else {
      e.target.value = '';
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    resetFormErrors();
    
    let isValid = true;
    
    if (!clinicInput.value.trim()) {
      clinicInput.classList.add('invalid');
      if (errorClinic) errorClinic.classList.add('visible');
      isValid = false;
    }
    
    if (!nameInput.value.trim()) {
      nameInput.classList.add('invalid');
      if (errorName) errorName.classList.add('visible');
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      emailInput.classList.add('invalid');
      if (errorEmail) errorEmail.classList.add('visible');
      isValid = false;
    }
    
    const rawPhone = phoneInput.value.replace(/\D/g, '');
    if (rawPhone.length < 10) {
      phoneInput.classList.add('invalid');
      if (errorPhone) errorPhone.classList.add('visible');
      isValid = false;
    }
    
    if (isValid) {
      const clinic = encodeURIComponent(clinicInput.value.trim());
      const name = encodeURIComponent(nameInput.value.trim());
      const email = encodeURIComponent(emailInput.value.trim());
      const phone = encodeURIComponent(phoneInput.value.trim());
      
      const registerUrl = `https://app.getlyra.com.br/register?email=${email}&nome=${name}&telefone=${phone}&clinica=${clinic}`;
      window.location.href = registerUrl;
    }
  });
}
