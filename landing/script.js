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

// ── Tema claro/escuro: segue o celular, lembra a escolha e troca com onda circular ──
(function temaDaPagina() {
  const raiz = document.documentElement;
  const btn = document.getElementById('tema-btn');
  const meta = document.querySelector('meta[name="theme-color"]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' }));
  const guardado = () => { try { return localStorage.getItem('lyra-tema'); } catch (e) { return null; } };
  const aplica = (t) => {
    raiz.setAttribute('data-tema', t);
    meta.content = t === 'escuro' ? '#111715' : '#f8f6ef';
    if (btn) btn.setAttribute('aria-label', t === 'escuro' ? 'Trocar para o tema claro' : 'Trocar para o tema escuro');
    document.dispatchEvent(new CustomEvent('lyra:tema', { detail: t }));
  };
  aplica(raiz.getAttribute('data-tema') === 'claro' ? 'claro' : 'escuro');

  if (btn) btn.addEventListener('click', () => {
    const novo = raiz.getAttribute('data-tema') === 'escuro' ? 'claro' : 'escuro';
    const troca = () => {
      aplica(novo);
      try { localStorage.setItem('lyra-tema', novo); } catch (e) { /* sem armazenamento: vale só nesta visita */ }
    };
    if (reduzMovimento || !document.startViewTransition) { troca(); return; }
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    // Igual ao app: indo para o claro a nova tela ABRE a partir do botão;
    // indo para o escuro a tela clara FECHA (encolhe até o botão) e revela o escuro por baixo.
    const abre = novo === 'claro';
    raiz.setAttribute('data-vt', abre ? 'abre' : 'fecha');
    const t = document.startViewTransition(troca);
    t.ready.then(() => {
      raiz.animate(
        { clipPath: abre
            ? [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`]
            : [`circle(${raio}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(.25,1,.5,1)', fill: 'forwards',
          pseudoElement: abre ? '::view-transition-new(root)' : '::view-transition-old(root)' }
      );
    }).catch(() => {});
    t.finished.finally(() => raiz.removeAttribute('data-vt'));
  });

  // Se a pessoa nunca escolheu, acompanha mudanças do sistema
  const sistema = window.matchMedia('(prefers-color-scheme: dark)');
  const muda = (e) => { if (!guardado()) aplica(e.matches ? 'escuro' : 'claro'); };
  if (sistema.addEventListener) sistema.addEventListener('change', muda);
})();

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

// ── Demonstrações animadas ──────────────────────────────────────────────────
// Cada demonstração recebe uma "raiz": a própria seção da página ou a cópia que aparece
// dentro do painel dos cartões do topo (nas cópias, os ids viram data-id).
const por = (raiz, id) => raiz.querySelector('#' + id) || raiz.querySelector('[data-id="' + id + '"]');
const CANCELA = Symbol('cancela');

// Agenda inteligente: marca um horário, o paciente confirma pelo WhatsApp, o atendimento é concluído
function demoAgenda(raiz) {
  const app = por(raiz, 'demo-agenda');
  if (!app) return;
  const novo = por(app, 'ag-novo');
  const juliana = por(app, 'ag-juliana');
  const felipe = por(app, 'ag-felipe');
  const muda = (li, texto, classe) => {
    const p = li.querySelector('.ag-pill');
    p.classList.remove('st-ag', 'st-conf', 'st-aten', 'st-conc');
    p.classList.add(classe);
    p.querySelector('.t').textContent = texto;
  };

  if (reduzMovimento) {
    novo.classList.add('on');
    muda(juliana, 'Confirmado', 'st-conf');
    muda(felipe, 'Concluído', 'st-conc');
    return;
  }

  let rodando = false;
  let cancelado = false;
  const dorme = async (ms) => {
    await new Promise((r) => setTimeout(r, ms));
    if (cancelado) throw CANCELA;
  };
  function zera() {
    app.classList.remove('aviso');
    novo.classList.remove('on', 'toque');
    muda(juliana, 'Agendado', 'st-ag');
    muda(felipe, 'Atendendo', 'st-aten');
  }
  async function ciclo() {
    zera();
    await dorme(2200);                       // agenda do dia
    novo.classList.add('toque');             // toque no + às 10:30
    await dorme(750);
    novo.classList.add('on');                // horário marcado
    novo.classList.remove('toque');
    await dorme(2200);
    app.classList.add('aviso');              // paciente confirma pelo WhatsApp
    await dorme(1000);
    muda(juliana, 'Confirmado', 'st-conf');
    await dorme(2400);
    app.classList.remove('aviso');
    await dorme(900);
    muda(felipe, 'Concluído', 'st-conc');    // atendimento concluído
    await dorme(5500);
  }
  async function laco() {
    if (rodando) return;
    rodando = true;
    try { while (!cancelado) await ciclo(); } catch (e) { if (e !== CANCELA) throw e; }
    rodando = false;
  }
  new IntersectionObserver((itens) => {
    itens.forEach((i) => {
      if (i.isIntersecting) { cancelado = false; laco(); } else { cancelado = true; }
    });
  }, { threshold: 0.35 }).observe(app);
}

// Evolução clínica por voz (texto sendo "ditado")
function demoVoz(raiz) {
  const cartao = por(raiz, 'demo-voz');
  const caixa = por(raiz, 'demo-texto');
  const tempo = por(raiz, 'demo-tempo');
  const estado = por(raiz, 'demo-estado');
  if (!caixa || !cartao) return;

  // Partes do texto; b = destaque azul
  const roteiro = [
    { t: 'Paciente relata sensibilidade no ' },
    { t: 'dente 16', b: true },
    { t: ' ao frio. Realizada ' },
    { t: 'restauração em resina composta', b: true },
    { t: ' nas faces ' },
    { t: 'mesial e oclusal', b: true },
    { t: '. Anestesia de ' },
    { t: '1,8 ml', b: true },
    { t: ' de lidocaína. Retorno em 15 dias.' },
  ];
  const htmlFinal = roteiro.map((p) => (p.b ? `<b>${p.t}</b>` : p.t)).join('');

  // Reserva a altura do texto completo, para o cartão não crescer enquanto "digita"
  const reserva = () => {
    caixa.style.minHeight = '';
    caixa.innerHTML = htmlFinal;
    caixa.style.minHeight = caixa.offsetHeight + 'px';
  };

  if (reduzMovimento) {
    caixa.innerHTML = htmlFinal;
    estado.textContent = 'Texto transcrito';
    return;
  }

  let rodando = false;
  let cancelado = false;
  const dorme = (ms) => new Promise((r) => setTimeout(r, ms));

  async function uma() {
    reserva();
    caixa.innerHTML = '<span class="cursor"></span>';
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
  new IntersectionObserver((itens) => {
    itens.forEach((i) => {
      if (i.isIntersecting) { cancelado = false; laco(); } else { cancelado = true; }
    });
  }, { threshold: 0.35 }).observe(cartao);
}

// Odontograma por voz: o dentista fala, o Lyra marca o dente e lista o tratamento
function demoOdontograma(raiz) {
  const app = por(raiz, 'demo-odonto');
  if (!app) return;
  const fala = por(app, 'od-fala');
  const salvar = por(app, 'od-salvar');
  const dente = (n) => app.querySelector(`.od-t[data-n="${n}"]`);
  const item = (n) => app.querySelector(`.od-lista li[data-n="${n}"]`);
  const DICA = fala.textContent;

  const marca = (n, canal) => {
    const d = dente(n);
    if (canal) d.classList.add('canal');
    d.classList.add('on');
    item(n).classList.add('on');
  };

  if (reduzMovimento) {
    marca(14); marca(15, true);
    fala.textContent = '“Dente 15, canal.”';
    fala.classList.add('ativa');
    app.classList.add('orc');
    return;
  }

  let rodando = false;
  let cancelado = false;
  const dorme = async (ms) => {
    await new Promise((r) => setTimeout(r, ms));
    if (cancelado) throw CANCELA;
  };
  async function dita(texto) {
    fala.classList.add('ativa');
    fala.textContent = '';
    for (const letra of texto) { fala.textContent += letra; await dorme(55); }
  }
  function zera() {
    app.classList.remove('ouvindo', 'orc');
    app.querySelectorAll('.od-t').forEach((d) => d.classList.remove('on', 'canal'));
    app.querySelectorAll('.od-lista li').forEach((l) => l.classList.remove('on'));
    salvar.classList.remove('press');
    fala.classList.remove('ativa');
    fala.textContent = DICA;
  }

  async function ciclo() {
    zera();
    await dorme(2000);                                  // 1) odontograma inicial
    app.classList.add('ouvindo');                       // 2) microfone ligado
    await dita('“Dente 14, restauração média.”');
    await dorme(600);
    marca(14);                                          // 3) dente 14 e tratamento 1
    await dorme(1700);
    await dita('“Dente 15, canal.”');                   // 4) segundo procedimento
    await dorme(600);
    marca(15, true);
    app.classList.remove('ouvindo');
    await dorme(1900);
    salvar.classList.add('press');                      // 5) salvar abre o orçamento
    await dorme(450);
    app.classList.add('orc');
    await dorme(6000);                                  // 6) resultado fica visível
    app.classList.remove('orc');
    await dorme(800);
  }

  async function laco() {
    if (rodando) return;
    rodando = true;
    try { while (!cancelado) await ciclo(); } catch (e) { if (e !== CANCELA) throw e; }
    rodando = false;
  }

  // Só anima quando está na tela; ao sair, para
  new IntersectionObserver((itens) => {
    itens.forEach((i) => {
      if (i.isIntersecting) { cancelado = false; laco(); } else { cancelado = true; }
    });
  }, { threshold: 0.35 }).observe(app);
}

// WhatsApp (mensagens aparecem em sequência). "reinicia" toca a conversa de novo.
function demoWhats(raiz) {
  const demo = por(raiz, 'demo-wa');
  if (!demo) return;
  if (!('IntersectionObserver' in window)) { demo.classList.add('vista'); return; }
  let vis;
  const observa = () => {
    vis = new IntersectionObserver((itens) => {
      itens.forEach((i) => {
        if (!i.isIntersecting) return;
        demo.classList.add('vista');
        vis.disconnect();
      });
    }, { threshold: 0.4 });
    vis.observe(demo);
  };
  observa();
  demo.reinicia = () => {
    vis.disconnect();
    demo.classList.remove('vista');
    void demo.offsetWidth;
    observa();
  };
}

function iniciarDemos(raiz) {
  demoAgenda(raiz);
  demoVoz(raiz);
  demoOdontograma(raiz);
  demoWhats(raiz);
}
iniciarDemos(document);

// ── Cartões do topo: a seta abre a seção do recurso logo abaixo e fecha sozinha ao rolar ──
(function cartoesExpansiveis() {
  const grade = document.querySelector('.destaques');
  const painel = document.getElementById('painel');
  if (!grade || !painel) return;
  const corpo = document.getElementById('painel-corpo');
  const dentro = painel.querySelector('.painel-in');
  const cartaoPainel = painel.querySelector('.painel-card');
  const botoes = [...grade.querySelectorAll('.dest-seta')];
  const celular = window.matchMedia('(max-width: 620px)');
  const conteudos = {};
  let ativo = null;
  let abriuEm = 0;
  let vigia = null;

  // Botão de fechar dentro do painel
  const fecha = document.createElement('button');
  fecha.type = 'button';
  fecha.className = 'painel-fecha';
  fecha.setAttribute('aria-label', 'Fechar');
  fecha.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  cartaoPainel.appendChild(fecha);

  // Cópia da seção real (mesmo texto e mesma animação), criada na primeira vez que abre
  function conteudoDe(alvo) {
    if (conteudos[alvo]) return conteudos[alvo];
    const secao = document.getElementById(alvo);
    const origem = secao && secao.querySelector('.container');
    if (!origem) return null;
    const copia = origem.cloneNode(true);
    copia.className = 'painel-grid';
    copia.querySelectorAll('.reveal').forEach((e) => e.classList.remove('reveal'));
    copia.querySelectorAll('[id]').forEach((e) => { e.setAttribute('data-id', e.id); e.removeAttribute('id'); });
    copia.querySelectorAll('[aria-labelledby]').forEach((e) => e.removeAttribute('aria-labelledby'));
    copia.querySelectorAll('h2').forEach((h2) => {
      const h3 = document.createElement('h3');
      h3.className = 't-painel';
      h3.innerHTML = h2.innerHTML;
      h2.replaceWith(h3);
    });
    const caixa = document.createElement('div');
    caixa.className = 'painel-conteudo';
    caixa.hidden = true;
    caixa.dataset.alvo = alvo;
    caixa.appendChild(copia);
    corpo.appendChild(caixa);
    iniciarDemos(caixa);
    conteudos[alvo] = caixa;
    return caixa;
  }

  function marca(alvo) {
    botoes.forEach((b) => {
      const on = b.dataset.alvo === alvo;
      b.setAttribute('aria-expanded', String(on));
      b.closest('.dest').classList.toggle('ativo', on);
    });
  }

  function mostra(alvo) {
    Object.entries(conteudos).forEach(([k, el]) => { el.hidden = k !== alvo; });
    const el = conteudos[alvo];
    el.hidden = false;
    const demoWa = el.querySelector('.wa-demo');
    if (demoWa && demoWa.reinicia) demoWa.reinicia();
  }

  // A pontinha do painel aponta para o cartão aberto (só quando o painel fica abaixo de todos os cartões)
  function apontaSeta(btn) {
    if (celular.matches) return;
    const c = btn.closest('.dest').getBoundingClientRect();
    const p = painel.getBoundingClientRect();
    painel.style.setProperty('--seta-x', `${Math.round(c.left + c.width / 2 - p.left)}px`);
  }

  function posiciona(btn) {
    if (celular.matches) btn.closest('.dest').after(painel);
    else if (painel.previousElementSibling !== grade) grade.after(painel);
  }

  function rolaAte(btn) {
    const alvo = celular.matches ? btn.closest('.dest') : grade;
    alvo.scrollIntoView({ behavior: reduzMovimento ? 'auto' : 'smooth', block: 'start' });
  }

  function vigiaRolagem() {
    if (vigia) vigia.disconnect();
    vigia = new IntersectionObserver((itens) => {
      // Passou algum tempo desde que abriu e o painel saiu da tela: fecha sem animar (a rolagem continua normal)
      if (ativo && Date.now() - abriuEm > 900 && !itens[0].isIntersecting) fechar(true);
    }, { threshold: 0 });
    vigia.observe(painel);
  }

  function fechar(instantaneo) {
    if (ativo === null) return;
    if (instantaneo) {
      painel.classList.add('sem-anim');
      painel.classList.remove('aberto');
      void painel.offsetWidth;
      requestAnimationFrame(() => painel.classList.remove('sem-anim'));
    } else {
      painel.classList.remove('aberto');
    }
    painel.setAttribute('inert', '');
    ativo = null;
    marca(null);
    if (vigia) { vigia.disconnect(); vigia = null; }
  }

  function abrir(btn) {
    const alvo = btn.dataset.alvo;
    if (ativo === alvo) { fechar(false); return; }
    const caixa = conteudoDe(alvo);
    if (!caixa) return;
    const jaAberto = ativo !== null;

    if (jaAberto && celular.matches) fechar(true);      // no celular o painel muda de lugar
    const trocando = jaAberto && !celular.matches;
    const alturaAntes = trocando ? dentro.offsetHeight : 0;

    posiciona(btn);
    mostra(alvo);
    apontaSeta(btn);
    marca(alvo);
    ativo = alvo;
    abriuEm = Date.now();
    painel.removeAttribute('inert');

    if (trocando && !reduzMovimento) {
      // Troca de recurso com o painel aberto: a altura desliza do tamanho antigo para o novo
      const alturaDepois = dentro.offsetHeight;
      dentro.animate([{ height: `${alturaAntes}px` }, { height: `${alturaDepois}px` }],
        { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)' });
    } else {
      painel.classList.add('aberto');
    }
    painel.classList.add('aberto');
    rolaAte(btn);
    setTimeout(() => { if (ativo === alvo) vigiaRolagem(); }, 1000);
  }

  botoes.forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); abrir(b); }));
  // O cartão inteiro também abre (a seta é o botão para teclado e leitor de tela)
  grade.querySelectorAll('.dest').forEach((c) => c.addEventListener('click', () => {
    const b = c.querySelector('.dest-seta');
    if (b) abrir(b);
  }));
  fecha.addEventListener('click', () => { const b = botoes.find((x) => x.dataset.alvo === ativo); fechar(false); if (b) b.focus({ preventScroll: true }); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || ativo === null) return;
    const b = botoes.find((x) => x.dataset.alvo === ativo);
    fechar(false);
    if (b) b.focus({ preventScroll: true });
  });
  // Mudou de celular para computador (ou o contrário): fecha para não desalinhar
  celular.addEventListener('change', () => fechar(true));
  window.addEventListener('resize', () => { if (ativo && !celular.matches) { const b = botoes.find((x) => x.dataset.alvo === ativo); if (b) apontaSeta(b); } });
})();

// ── Atendimento: botão flutuante do WhatsApp (aviso de boas-vindas, painel com atalhos) ──
(function atendimento() {
  const raiz = document.getElementById('lyra-chat');
  if (!raiz) return;
  const botao = document.getElementById('lc-botao');
  const painel = document.getElementById('lc-painel');
  const dica = document.getElementById('lc-dica');
  const selo = document.getElementById('lc-selo');
  const fechaPainel = raiz.querySelector('.lc-x');
  const fechaDica = raiz.querySelector('.lc-dica-x');
  const guarda = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* ok */ } };
  const le = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  let tDica = null;

  function escondeDica(pronto) {
    clearTimeout(tDica);
    if (dica.hidden) return;
    if (reduzMovimento) { dica.hidden = true; return; }
    dica.classList.add('some');
    setTimeout(() => { dica.hidden = true; dica.classList.remove('some'); }, 380);
  }
  function mostraDica() {
    if (le('lyra-aviso-visto') || raiz.classList.contains('aberto')) return;
    dica.hidden = false;
    selo.hidden = false;
    guarda('lyra-aviso-visto', '1');
    tDica = setTimeout(() => escondeDica(), 11000);   // some sozinho depois de uns segundos
  }

  function abre() {
    raiz.classList.add('aberto');
    painel.removeAttribute('inert');
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar atendimento');
    selo.hidden = true;
    escondeDica();
  }
  function fecha(devolveFoco) {
    raiz.classList.remove('aberto');
    painel.setAttribute('inert', '');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Falar com o suporte pelo WhatsApp');
    if (devolveFoco) botao.focus({ preventScroll: true });
  }

  botao.addEventListener('click', () => (raiz.classList.contains('aberto') ? fecha(false) : abre()));
  fechaPainel.addEventListener('click', () => fecha(true));
  fechaDica.addEventListener('click', () => escondeDica());
  dica.addEventListener('click', (e) => { if (!e.target.closest('.lc-dica-x')) abre(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && raiz.classList.contains('aberto')) fecha(true); });
  // Toque fora do painel fecha (os links do painel continuam abrindo o WhatsApp)
  document.addEventListener('pointerdown', (e) => {
    if (raiz.classList.contains('aberto') && !raiz.contains(e.target)) fecha(false);
  });
  // O aviso de boas-vindas chega depois que a pessoa deu uma olhada na página
  setTimeout(mostraDica, reduzMovimento ? 3500 : 4500);
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
  // Acompanha o tema da página (botão do topo ou tema do celular)
  document.addEventListener('lyra:tema', (e) => trocar(e.detail));
  trocar(document.documentElement.dataset.tema === 'claro' ? 'claro' : 'escuro');
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
