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
  // Fundo levemente escurecido enquanto o menu está aberto (toque nele fecha o menu)
  const fundo = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'menu-fundo' }));
  const definir = (aberto) => {
    menu.classList.toggle('open', aberto);
    fundo.style.top = document.querySelector('.site-header').offsetHeight + 'px'; // o topo (logo) não escurece
    fundo.classList.toggle('on', aberto);
    toggle.setAttribute('aria-expanded', String(aberto));
  };
  toggle.addEventListener('click', () => definir(!menu.classList.contains('open')));
  fundo.addEventListener('click', () => definir(false));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => definir(false)));
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

  let emAndamento = null; // troca de tema animada que ainda está rodando
  let alvo = null;         // último tema pedido (cliques seguidos valem pelo último)
  const troca = () => {
    aplica(alvo);
    try { localStorage.setItem('lyra-tema', alvo); } catch (e) { /* sem armazenamento: vale só nesta visita */ }
  };
  if (btn) btn.addEventListener('click', () => {
    const novo = raiz.getAttribute('data-tema') === 'escuro' ? 'claro' : 'escuro';
    alvo = novo;
    if (reduzMovimento || !document.startViewTransition) { troca(); return; }
    // Clique antes da animação anterior acabar: encerra a anterior e troca na hora, sem nova animação.
    // Começar outra animação por cima fazia o navegador fotografar a tela em branco (o "flash" branco).
    if (emAndamento) { emAndamento.skipTransition(); troca(); return; }
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    // Igual ao app: indo para o claro a nova tela ABRE a partir do botão;
    // indo para o escuro a tela clara FECHA (encolhe até o botão) e revela o escuro por baixo.
    const abre = novo === 'claro';
    raiz.setAttribute('data-vt', abre ? 'abre' : 'fecha');
    const t = document.startViewTransition(troca);
    emAndamento = t;
    let circulo = null;
    t.ready.then(() => {
      circulo = raiz.animate(
        { clipPath: abre
            ? [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`]
            : [`circle(${raio}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`] },
        // Abrir é o fechar ao contrário: começa devagar no botão e acelera (com a mesma curva, o círculo
        // já nascia quase do tamanho da tela e o efeito de abrir nem aparecia).
        { duration: 600, easing: abre ? 'cubic-bezier(.5,0,.75,0)' : 'cubic-bezier(.25,1,.5,1)', fill: 'forwards',
          pseudoElement: abre ? '::view-transition-new(root)' : '::view-transition-old(root)' }
      );
    }).catch(() => {});
    t.finished.finally(() => {
      // A animação fica presa ao <html> com fill 'forwards'; se não for cancelada, o círculo fechado (0px)
      // da troca anterior continua valendo na PRÓXIMA troca e esconde a tela antiga: era a tela branca.
      if (circulo) circulo.cancel();
      if (emAndamento !== t) return;
      emAndamento = null;
      raiz.removeAttribute('data-vt');
    });
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
    muda(felipe, 'Confirmado', 'st-conf');
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
  // Toca a conversa ao entrar na tela e a zera quando sai por completo, para tocar de novo na próxima vez que aparecer.
  const observa = () => {
    vis = new IntersectionObserver((itens) => {
      itens.forEach((i) => {
        if (i.intersectionRatio >= 0.4) demo.classList.add('vista');
        else if (!i.isIntersecting) demo.classList.remove('vista');
      });
    }, { threshold: [0, 0.4] });
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

// ── Atendimento: botão flutuante do WhatsApp (painel com atalhos; sem aviso automático) ──
(function atendimento() {
  const raiz = document.getElementById('lyra-chat');
  if (!raiz) return;
  const botao = document.getElementById('lc-botao');
  const painel = document.getElementById('lc-painel');
  const selo = document.getElementById('lc-selo');
  const fechaPainel = raiz.querySelector('.lc-x');
  function abre() {
    raiz.classList.add('aberto');
    painel.removeAttribute('inert');
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar atendimento');
    selo.hidden = true;
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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && raiz.classList.contains('aberto')) fecha(true); });
  // Toque fora do painel fecha (os links do painel continuam abrindo o WhatsApp)
  document.addEventListener('pointerdown', (e) => {
    if (raiz.classList.contains('aberto') && !raiz.contains(e.target)) fecha(false);
  });
})();

// Barra de rolagem flutuante: a nativa some (não ocupa espaço) e uma barrinha fina aparece por cima, só enquanto rola.
(function () {
  var raiz = document.documentElement, t, arrasto = null;
  var barra = document.createElement('div');
  barra.className = 'rolagem-flutuante';
  barra.setAttribute('aria-hidden', 'true');
  document.body.appendChild(barra);
  function atualizar() {
    var alto = raiz.clientHeight, total = raiz.scrollHeight;
    if (total <= alto + 1) { barra.style.display = 'none'; return; }
    var h = Math.max(36, alto * alto / total);
    barra.style.display = 'block';
    barra.style.height = h + 'px';
    barra.style.transform = 'translateY(' + (raiz.scrollTop / (total - alto)) * (alto - h - 8) + 'px)';
  }
  function mostrar() {
    atualizar();
    barra.classList.add('visivel');
    clearTimeout(t);
    t = setTimeout(function () { if (!arrasto) barra.classList.remove('visivel'); }, 900);
  }
  window.addEventListener('scroll', mostrar, { passive: true });
  window.addEventListener('resize', atualizar);
  barra.addEventListener('pointerdown', function (e) {
    arrasto = { y: e.clientY, topo: raiz.scrollTop };
    barra.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  barra.addEventListener('pointermove', function (e) {
    if (!arrasto) return;
    var alto = raiz.clientHeight, total = raiz.scrollHeight, h = barra.offsetHeight;
    raiz.scrollTop = arrasto.topo + (e.clientY - arrasto.y) * (total - alto) / (alto - h - 8);
  });
  function soltar() { arrasto = null; mostrar(); }
  barra.addEventListener('pointerup', soltar);
  barra.addEventListener('pointercancel', soltar);
})();

/* Planos: alterna entre mensal e anual. */
(function () {
  var secao = document.getElementById('planos');
  var botoes = document.querySelectorAll('.planos-troca button');
  if (!secao || !botoes.length) return;
  var todas = Array.prototype.slice.call(botoes);
  function mostrar(modo) {
    todas.forEach(function (o) {
      var on = o.getAttribute('data-plano') === modo;
      o.classList.toggle('on', on);
      o.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    secao.querySelectorAll('[data-modo]').forEach(function (el) {
      el.hidden = el.getAttribute('data-modo').split(' ').indexOf(modo) === -1;
    });
  }
  todas.forEach(function (b) { b.addEventListener('click', function () { mostrar(b.getAttribute('data-plano')); }); });
  mostrar('anual'); // o anual aparece primeiro; o mensal fica a um toque
})();

/* Recursos (celular): pontinhos do carrossel acompanham o deslize e levam ao cartão ao tocar */
(function carrosselRecursos() {
  const trilho = document.querySelector('#recursos .cards');
  if (!trilho) return;
  const cartoes = Array.from(trilho.querySelectorAll('.card'));
  if (cartoes.length < 2) return;
  const pontos = document.createElement('div');
  pontos.className = 'carrossel-pontos';
  const botoes = cartoes.map((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Ir para o cartão ' + (i + 1) + ' de ' + cartoes.length);
    b.addEventListener('click', () => {
      const alvo = c.offsetLeft - (trilho.clientWidth - c.offsetWidth) / 2;
      trilho.scrollTo({ left: alvo, behavior: 'smooth' });
    });
    pontos.appendChild(b);
    return b;
  });
  trilho.after(pontos);
  // Setas (computador): andam um cartão por vez e ficam apagadas nas pontas
  const moldura = document.createElement('div');
  moldura.className = 'rec-wrap';
  trilho.before(moldura);
  moldura.appendChild(trilho);
  const seta = (cls, rotulo, d, passo) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rec-seta ' + cls;
    b.setAttribute('aria-label', rotulo);
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
    b.addEventListener('click', () => trilho.scrollBy({ left: passo * (cartoes[0].offsetWidth + 20), behavior: 'smooth' }));
    moldura.appendChild(b);
    return b;
  };
  const ant = seta('rec-ant', 'Recursos anteriores', 'M15 5l-7 7 7 7', -1);
  const prox = seta('rec-prox', 'Próximos recursos', 'M9 5l7 7-7 7', 1);
  const pontas = () => {
    ant.disabled = trilho.scrollLeft < 4;
    prox.disabled = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;
  };
  const atualizar = () => {
    // Computador (vários cartões à vista): marca o primeiro visível; celular: o do meio
    const varios = cartoes[0].offsetWidth < trilho.clientWidth / 2;
    const ref = varios ? trilho.scrollLeft : trilho.scrollLeft + trilho.clientWidth / 2;
    let melhor = 0, dist = Infinity;
    cartoes.forEach((c, i) => {
      const d = Math.abs((varios ? c.offsetLeft : c.offsetLeft + c.offsetWidth / 2) - ref);
      if (d < dist) { dist = d; melhor = i; }
    });
    botoes.forEach((b, i) => b.classList.toggle('on', i === melhor));
    pontas();
  };
  trilho.addEventListener('scroll', () => requestAnimationFrame(atualizar), { passive: true });
  window.addEventListener('resize', atualizar);
  atualizar();
})();
