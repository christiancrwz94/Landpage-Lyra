/* Lyra Dental — landing. Sem bibliotecas externas, sem rastreadores, sem coleta de dados. */

// ── Configuração (troque aqui) ───────────────────────────────────────────────
const LYRA_CONFIG = {
  // Número do WhatsApp que recebe os contatos (formato internacional, só dígitos).
  whatsapp: '5524993251138',
};

const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Botões que abrem o WhatsApp com mensagem pronta
document.querySelectorAll('[data-wa]').forEach((a) => {
  const texto = encodeURIComponent(a.dataset.wa || 'Olá! Quero conhecer o Lyra Dental.');
  a.href = `https://wa.me/${LYRA_CONFIG.whatsapp}?text=${texto}`;
});

// Ano no rodapé
const ano = document.getElementById('ano');
if (ano) ano.textContent = new Date().getFullYear();

// Menu do celular
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const aberto = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(aberto));
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

// Cabeçalho ganha fundo ao rolar
const header = document.querySelector('.site-header');
const marcaScroll = () => header && header.classList.toggle('rolou', window.scrollY > 24);
marcaScroll();
window.addEventListener('scroll', marcaScroll, { passive: true });

// FAQ: abre um por vez
document.querySelectorAll('.faq-list details').forEach((d) => d.addEventListener('toggle', () => {
  if (!d.open) return;
  document.querySelectorAll('.faq-list details[open]').forEach((o) => { if (o !== d) o.removeAttribute('open'); });
}));

// Revelar blocos ao rolar
const observador = 'IntersectionObserver' in window
  ? new IntersectionObserver((itens) => {
      itens.forEach((i) => {
        if (!i.isIntersecting) return;
        i.target.classList.add('vista');
        observador.unobserve(i.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
  : null;
document.querySelectorAll('.reveal').forEach((el) => (observador ? observador.observe(el) : el.classList.add('vista')));

// Celulares do topo se mexem de leve com a rolagem (parallax)
if (!reduzMovimento) {
  const itens = [...document.querySelectorAll('.parallax')];
  let pendente = false;
  const atualizar = () => {
    pendente = false;
    const y = window.scrollY;
    if (y > 900) return;
    itens.forEach((el) => {
      const v = parseFloat(el.dataset.speed || '0.1');
      el.style.translate = `0 ${-(y * v).toFixed(1)}px`;
    });
  };
  window.addEventListener('scroll', () => { if (!pendente) { pendente = true; requestAnimationFrame(atualizar); } }, { passive: true });
}

// ── Demonstração da voz (texto sendo "ditado") ──────────────────────────────
(function demoVoz() {
  const caixa = document.getElementById('demo-texto');
  const tempo = document.getElementById('demo-tempo');
  const estado = document.getElementById('demo-estado');
  const legenda = document.getElementById('demo-legenda');
  const dentes = [...document.querySelectorAll('#demo-odonto .t')];
  const cartao = document.getElementById('demo-voz');
  if (!caixa || !cartao) return;

  // Partes do texto; [[b]] = destaque azul; "marca" liga o dente no odontograma
  const roteiro = [
    { t: 'Paciente relata sensibilidade no ', },
    { t: 'dente 16', b: true, marca: '16' },
    { t: ' ao frio. Realizada ' },
    { t: 'restauração em resina composta', b: true },
    { t: ' nas faces ' },
    { t: 'mesial e oclusal', b: true },
    { t: '. Anestesia de ' },
    { t: '1,8 ml', b: true },
    { t: ' de lidocaína. Retorno em 15 dias.' },
  ];
  const textoFinal = roteiro.map((p) => p.t).join('');

  if (reduzMovimento) {
    caixa.innerHTML = roteiro.map((p) => (p.b ? `<b>${p.t}</b>` : p.t)).join('');
    dentes.forEach((d) => d.dataset.n === '16' && d.classList.add('on'));
    estado.textContent = 'Texto transcrito';
    return;
  }

  let rodando = false;
  let cancelado = false;
  const dorme = (ms) => new Promise((r) => setTimeout(r, ms));

  async function uma() {
    caixa.innerHTML = '<span class="cursor"></span>';
    dentes.forEach((d) => d.classList.remove('on'));
    legenda.textContent = 'Odontograma';
    estado.textContent = 'Ouvindo…';
    let seg = 0;
    const relogio = setInterval(() => {
      seg += 1;
      tempo.textContent = `0:${String(seg).padStart(2, '0')}`;
    }, 1000);
    tempo.textContent = '0:00';

    let html = '';
    for (const parte of roteiro) {
      for (const letra of parte.t) {
        if (cancelado) { clearInterval(relogio); return; }
        html += parte.b ? `<b>${letra}</b>` : letra;
        caixa.innerHTML = html + '<span class="cursor"></span>';
        await dorme(34 + Math.random() * 26);
      }
      if (parte.marca) {
        dentes.forEach((d) => d.dataset.n === parte.marca && d.classList.add('on'));
        legenda.textContent = `Dente ${parte.marca} marcado`;
      }
    }
    clearInterval(relogio);
    estado.textContent = 'Texto transcrito';
    await dorme(4200);
  }

  async function laco() {
    if (rodando) return;
    rodando = true;
    while (!cancelado) await uma();
    rodando = false;
  }

  // Só roda quando a demonstração está visível (economiza bateria)
  const vis = new IntersectionObserver((itens) => {
    itens.forEach((i) => {
      if (i.isIntersecting) { cancelado = false; laco(); } else { cancelado = true; }
    });
  }, { threshold: 0.35 });
  vis.observe(cartao);
})();

// ── Demonstração do WhatsApp (mensagens aparecem em sequência) ──────────────
(function demoWhats() {
  const demo = document.getElementById('demo-wa');
  if (!demo) return;
  if (!('IntersectionObserver' in window)) { demo.classList.add('vista'); return; }
  const vis = new IntersectionObserver((itens) => {
    itens.forEach((i) => {
      if (!i.isIntersecting) return;
      demo.classList.add('vista');
      vis.disconnect();
    });
  }, { threshold: 0.4 });
  vis.observe(demo);
})();

// Alternador Escuro/Claro dos prints do app (só troca a imagem; as claras carregam quando pedidas)
(function temaDosPrints() {
  const botoes = [...document.querySelectorAll('.tema-toggle button')];
  const imgs = [...document.querySelectorAll('#telas img')];
  if (!botoes.length || !imgs.length) return;
  const trocar = (tema) => {
    imgs.forEach((img) => {
      const base = img.getAttribute('src').replace('-claro.webp', '.webp');
      img.setAttribute('src', tema === 'claro' ? base.replace('.webp', '-claro.webp') : base);
    });
    botoes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tema === tema)));
  };
  botoes.forEach((b) => b.addEventListener('click', () => trocar(b.dataset.tema)));
})();


// Carrossel das telas do app: setas, pontos, arrastar e passar sozinho (pausa ao tocar ou passar o mouse)
(function carrosselDasTelas() {
  const pista = document.getElementById('telas');
  if (!pista) return;
  const slides = [...pista.querySelectorAll('figure')];
  const raiz = pista.closest('.carrossel');
  const pontos = raiz.querySelector('.car-dots');
  const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let atual = 0, pausado = false, visivel = false, timer = null;

  slides.forEach((fig, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Ir para: ' + (fig.querySelector('figcaption')?.textContent || 'tela ' + (i + 1)));
    b.addEventListener('click', () => ir(i));
    pontos.appendChild(b);
  });

  const marcar = (i) => {
    atual = i;
    slides.forEach((s, k) => s.classList.toggle('ativa', k === i));
    [...pontos.children].forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
  };
  const ir = (i) => {
    const alvo = slides[(i + slides.length) % slides.length];
    pista.scrollTo({ left: alvo.offsetLeft - (pista.clientWidth - alvo.offsetWidth) / 2, behavior: reduz ? 'auto' : 'smooth' });
  };
  const maisProximo = () => {
    const centro = pista.scrollLeft + pista.clientWidth / 2;
    let melhor = 0, dist = Infinity;
    slides.forEach((s, k) => {
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - centro);
      if (d < dist) { dist = d; melhor = k; }
    });
    return melhor;
  };
  let raf = 0;
  pista.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { const i = maisProximo(); if (i !== atual) marcar(i); });
  }, { passive: true });

  raiz.querySelector('.prev').addEventListener('click', () => ir(atual - 1));
  raiz.querySelector('.next').addEventListener('click', () => ir(atual + 1));
  pista.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(atual - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(atual + 1); }
  });

  const parar = () => { clearInterval(timer); timer = null; };
  const tocar = () => {
    if (reduz || pausado || !visivel || timer) return;
    timer = setInterval(() => ir(atual + 1), 4500);
  };
  const pausa = () => { pausado = true; parar(); };
  const retoma = () => { pausado = false; tocar(); };
  ['mouseenter', 'focusin', 'touchstart', 'pointerdown'].forEach((ev) => raiz.addEventListener(ev, pausa, { passive: true }));
  ['mouseleave', 'focusout'].forEach((ev) => raiz.addEventListener(ev, retoma));
  raiz.addEventListener('touchend', () => setTimeout(retoma, 6000), { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visivel = e.isIntersecting; visivel ? tocar() : parar(); }, { threshold: 0.4 }).observe(raiz);
  }

  // começa pela tela do meio (Odontograma), sem animar
  requestAnimationFrame(() => {
    const meio = Math.floor(slides.length / 2);
    const alvo = slides[meio];
    pista.style.scrollBehavior = 'auto';
    pista.scrollLeft = alvo.offsetLeft - (pista.clientWidth - alvo.offsetWidth) / 2;
    pista.style.scrollBehavior = '';
    marcar(meio);
  });
})();
