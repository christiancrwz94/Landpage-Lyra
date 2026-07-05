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
