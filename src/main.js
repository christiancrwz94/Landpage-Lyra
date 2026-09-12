// Lyra Odonto - Script Principal de Alta Conversão

document.addEventListener('DOMContentLoaded', () => {
  // 1. Menu Mobile
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

  // 2. Animações de Revelação no Scroll
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // 3. Toggle de Faturamento (Mensal / Anual)
  const billingButtons = document.querySelectorAll('.billing-toggle button');
  const priceConsultorio = document.querySelector('#priceConsultorio');
  const priceClinica = document.querySelector('#priceClinica');
  const periodConsultorio = document.querySelector('#periodConsultorio');
  const periodClinica = document.querySelector('#periodClinica');
  const discountBadges = document.querySelectorAll('.yearly-badge');

  billingButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      billingButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const isYearly = btn.dataset.billing === 'yearly';

      if (priceConsultorio) {
        priceConsultorio.textContent = isYearly ? '89' : '109';
      }
      if (priceClinica) {
        priceClinica.textContent = isYearly ? '169' : '199';
      }
      if (periodConsultorio) {
        periodConsultorio.textContent = isYearly ? '/mês no plano anual' : '/mês no plano mensal';
      }
      if (periodClinica) {
        periodClinica.textContent = isYearly ? '/mês no plano anual' : '/mês no plano mensal';
      }

      discountBadges.forEach((badge) => {
        badge.style.opacity = isYearly ? '1' : '0.4';
      });
    });
  });

  // 4. FAQ Accordion Cirúrgico
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach((other) => other.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 5. Sticky CTA no Scroll
  const stickyCta = document.querySelector('#stickyCta');
  const heroSection = document.querySelector('.hero-section');

  window.addEventListener('scroll', () => {
    if (!stickyCta) return;
    const heroHeight = heroSection ? heroSection.offsetHeight : 600;
    if (window.scrollY > heroHeight * 0.7) {
      stickyCta.classList.add('visible');
    } else {
      stickyCta.classList.remove('visible');
    }
  }, { passive: true });

  // 6. Demonstração Interativa do Modo Privacidade (Financeiro)
  const privacyDemos = document.querySelectorAll('[data-toggle-privacy]');
  privacyDemos.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const card = toggle.closest('.privacy-card-demo');
      if (!card) return;
      card.classList.toggle('is-private');
      const isPrivate = card.classList.contains('is-private');
      const textValues = card.querySelectorAll('.sensitive-value');
      textValues.forEach((el) => {
        if (isPrivate) {
          el.dataset.original = el.textContent || '';
          el.textContent = 'R$ •••••••';
        } else {
          el.textContent = el.dataset.original || 'R$ 48.950,00';
        }
      });
    });
  });
});
