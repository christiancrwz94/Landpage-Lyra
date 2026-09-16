const menuButton = document.querySelector('#menuButton');
const mobileMenu = document.querySelector('#mobileMenu');

menuButton?.addEventListener('click', () => {
  const isOpen = mobileMenu?.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(Boolean(isOpen)));
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelectorAll('.billing-toggle button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.billing-toggle button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const isYearly = button.dataset.billing === 'year';
    document.querySelector('#priceValue').textContent = isYearly ? 'Teste grátis' : 'Teste grátis';
    document.querySelector('#pricePeriod').textContent = isYearly ? 'com desconto no anual' : 'por 7 dias';
  });
});

const stickyCta = document.querySelector('#stickyCta');

window.addEventListener('scroll', () => {
  if (!stickyCta) return;
  stickyCta.classList.toggle('visible', window.scrollY > 560);
});

const suiteCarousel = document.querySelector('[data-suite-carousel]');

if (suiteCarousel) {
  const track = suiteCarousel.querySelector('.suite-grid');
  const cards = Array.from(suiteCarousel.querySelectorAll('.suite-card'));
  const prevButton = suiteCarousel.querySelector('.suite-carousel-prev');
  const nextButton = suiteCarousel.querySelector('.suite-carousel-next');
  const dots = suiteCarousel.querySelector('.suite-carousel-dots');
  let scrollTicking = false;

  cards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir para o card ${index + 1}`);
    dot.addEventListener('click', () => scrollToCard(index));
    dots?.appendChild(dot);
  });

  const dotButtons = Array.from(dots?.querySelectorAll('button') ?? []);

  const getStep = () => {
    const firstCard = cards[0];
    if (!firstCard || !track) return 1;
    const gap = Number.parseFloat(window.getComputedStyle(track).gap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  };

  const getIndex = () => {
    if (!track) return 0;
    return Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / getStep())));
  };

  function updateCarouselState() {
    const activeIndex = getIndex();
    dotButtons.forEach((dot, index) => dot.classList.toggle('active', index === activeIndex));
  }

  function scrollToCard(index) {
    if (!track) return;
    track.scrollTo({ left: getStep() * index, behavior: 'smooth' });
  }

  prevButton?.addEventListener('click', () => scrollToCard(getIndex() - 1));
  nextButton?.addEventListener('click', () => scrollToCard(getIndex() + 1));

  track?.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateCarouselState();
      scrollTicking = false;
    });
  });

  window.addEventListener('resize', updateCarouselState);
  updateCarouselState();
}
