// Núcleo do painel de textos da landing. Usado pelo build (montar-landing.mjs) e pela função de salvar (api/salvar.js).
// Regras de segurança: só chaves conhecidas; só texto (nada de HTML); tamanhos limitados; links só https/mailto.

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const desescapar = (t) => t.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENT[m]);
const escapar = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const URL_CADASTRO_PADRAO = 'https://app.getlyra.com.br/?signup=1';
export const EMAIL_PADRAO = 'contato@getlyra.com.br';

// <tag ... data-edit="chave">conteúdo</tag> (o conteúdo só pode ter <br> e <strong>, nunca a própria tag)
const RX_MARCA = /<(\w+)([^>]*?)\sdata-edit="([a-z0-9_]+)"([^>]*)>([\s\S]*?)<\/\1>/g;

/** HTML interno -> texto simples editável ("**negrito**", quebras de linha). */
export function htmlParaTexto(html) {
  return desescapar(
    html.replace(/<br\s*\/?>/gi, '\n').replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**').replace(/<[^>]+>/g, ''),
  ).trim();
}

/** Texto simples -> HTML seguro (escapa tudo; só "**x**" vira negrito e "\n" vira quebra). */
export function textoParaHtml(texto) {
  return escapar(texto)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

/** Valores padrão (o que está escrito hoje na página), por chave. */
export function extrairPadroes(html, js) {
  const padroes = {};
  for (const m of html.matchAll(RX_MARCA)) padroes[m[3]] = htmlParaTexto(m[5]);
  const wa = /whatsapp:\s*'(\d+)'/.exec(js);
  if (wa) padroes.wa_numero = wa[1];
  const titulo = /<title>([\s\S]*?)<\/title>/.exec(html);
  if (titulo) padroes.seo_titulo = desescapar(titulo[1]).trim();
  const desc = /<meta name="description" content="([^"]*)"/.exec(html);
  if (desc) padroes.seo_descricao = desescapar(desc[1]);
  if (html.includes(URL_CADASTRO_PADRAO)) padroes.link_cadastro = URL_CADASTRO_PADRAO;
  if (html.includes(EMAIL_PADRAO)) padroes.rod_email = EMAIL_PADRAO;
  return padroes;
}

const TIPOS = {
  curto: (v) => true,
  titulo: (v) => true,
  longo: (v) => true,
  telefone: (v) => /^\d{10,15}$/.test(v) || 'só números, com DDI e DDD (ex.: 5524999999999)',
  email: (v) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(v) || 'e-mail inválido',
  link: (v) => /^(https:\/\/|mailto:)[^\s<>"]+$/.test(v) || 'o link precisa começar com https://',
};

/**
 * Valida os valores enviados contra a lista de campos. Devolve { ok, limpos, erros }.
 * Campo vazio = voltar ao texto original (não é gravado).
 */
export function validarValores(valores, campos) {
  const erros = {};
  const limpos = {};
  if (!valores || typeof valores !== 'object' || Array.isArray(valores)) return { ok: false, limpos, erros: { _: 'formato inválido' } };
  const porChave = new Map(campos.map((c) => [c.chave, c]));
  for (const [chave, bruto] of Object.entries(valores)) {
    const campo = porChave.get(chave);
    if (!campo) { erros[chave] = 'campo desconhecido'; continue; }
    if (typeof bruto !== 'string') { erros[chave] = 'precisa ser texto'; continue; }
    const v = bruto.replace(/\r\n/g, '\n').trim();
    if (v === '') continue;
    if (/[<>]/.test(v)) { erros[chave] = 'não use os sinais < e >'; continue; }
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v)) { erros[chave] = 'caractere inválido'; continue; }
    if (v.length > campo.max) { erros[chave] = `máximo de ${campo.max} caracteres`; continue; }
    const r = (TIPOS[campo.tipo] || TIPOS.curto)(v);
    if (r !== true) { erros[chave] = r; continue; }
    limpos[chave] = v;
  }
  return { ok: Object.keys(erros).length === 0, limpos, erros };
}

/** Aplica os valores na página (index.html) e no script.js. Chaves vazias ou ausentes mantêm o texto original. */
export function aplicar(html, js, valores) {
  let h = html.replace(RX_MARCA, (todo, tag, antes, chave, depois, interno) => {
    const v = valores[chave];
    const abre = `<${tag}${antes}${depois}>`;
    return `${abre}${v ? textoParaHtml(v) : interno}</${tag}>`;
  });
  if (valores.link_cadastro) h = h.split(URL_CADASTRO_PADRAO).join(escapar(valores.link_cadastro));
  if (valores.rod_email) h = h.split(EMAIL_PADRAO).join(escapar(valores.rod_email));
  if (valores.seo_titulo) {
    const antigo = /<title>([\s\S]*?)<\/title>/.exec(h)?.[1];
    h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapar(valores.seo_titulo)}</title>`);
    if (antigo) h = h.split(`<meta property="og:title" content="${antigo}"`).join(`<meta property="og:title" content="${escapar(valores.seo_titulo)}"`);
  }
  if (valores.seo_descricao) h = h.replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapar(valores.seo_descricao)}$2`);
  const j = valores.wa_numero ? js.replace(/(whatsapp:\s*')\d+(')/, `$1${valores.wa_numero}$2`) : js;
  return { html: h, js: j };
}
