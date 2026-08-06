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

const faceButtons = document.querySelectorAll('.tooth-grid button');
const toothStatus = document.querySelector('#toothStatus');
const statusCycle = ['Planejado', 'Aprovado', 'Concluído'];

faceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const current = Number(button.dataset.state || 0);
    const next = (current + 1) % statusCycle.length;
    button.dataset.state = String(next);
    button.className = ['planned', 'approved', 'done'][next];
    faceButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    if (toothStatus) toothStatus.textContent = `${button.dataset.face}: ${statusCycle[next]}`;
  });
});

document.querySelectorAll('.billing-toggle button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.billing-toggle button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const isYearly = button.dataset.billing === 'year';
    document.querySelector('#priceValue').textContent = isYearly ? 'Teste grátis' : 'Teste grátis';
    document.querySelector('#pricePeriod').textContent = isYearly ? 'com desconto no anual' : 'por 7 dias';
  });
});

document.querySelectorAll('.faq-item button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    item?.classList.toggle('open');
    const marker = button.querySelector('span');
    if (marker) marker.textContent = item?.classList.contains('open') ? '-' : '+';
  });
});

const stickyCta = document.querySelector('#stickyCta');

window.addEventListener('scroll', () => {
  if (!stickyCta) return;
  stickyCta.classList.toggle('visible', window.scrollY > 560);
});
