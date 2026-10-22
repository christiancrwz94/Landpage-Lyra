import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extrairPadroes, validarValores, aplicar, textoParaHtml, htmlParaTexto, URL_CADASTRO_PADRAO, EMAIL_PADRAO } from './painel-lib.mjs';

const html = readFileSync('landing/index.html', 'utf8');
const js = readFileSync('landing/script.js', 'utf8');
const campos = JSON.parse(readFileSync('landing/campos.json', 'utf8'));
const padroes = extrairPadroes(html, js);
const semMarcas = (h) => h.replace(/\sdata-edit="[a-z0-9_]+"/g, '');

test('todo campo tem texto padrão e as chaves são únicas', () => {
  const vistas = new Set();
  for (const c of campos) {
    assert.ok(!vistas.has(c.chave), `chave repetida: ${c.chave}`);
    vistas.add(c.chave);
    assert.ok(padroes[c.chave], `sem texto padrão: ${c.chave}`);
    assert.ok(padroes[c.chave].length <= c.max, `padrão maior que o máximo: ${c.chave}`);
  }
});

test('sem edições, a página sai idêntica à original (só sem as marcas)', () => {
  const r = aplicar(html, js, {});
  assert.equal(r.html, semMarcas(html));
  assert.equal(r.js, js);
});

test('aplica texto, negrito, link, e-mail, WhatsApp e Google', () => {
  const v = {
    hero_l1: 'Novo título & cia', seg_c2_x: 'Texto com **destaque**.', link_cadastro: 'https://exemplo.com/a?b=1&c=2',
    rod_email: 'oi@exemplo.com', wa_numero: '5511999998888', seo_titulo: 'Meu título', seo_descricao: 'Minha descrição',
  };
  const r = aplicar(html, js, v);
  assert.match(r.html, /<span>Novo título &amp; cia<\/span>/);
  assert.match(r.html, /Texto com <strong>destaque<\/strong>\./);
  assert.ok(!r.html.includes(URL_CADASTRO_PADRAO));
  assert.match(r.html, /href="https:\/\/exemplo\.com\/a\?b=1&amp;c=2"/);
  assert.ok(!r.html.includes(EMAIL_PADRAO));
  assert.match(r.html, /mailto:oi@exemplo\.com">oi@exemplo\.com</);
  assert.match(r.js, /whatsapp: '5511999998888'/);
  assert.match(r.html, /<title>Meu título<\/title>/);
  assert.match(r.html, /og:title" content="Meu título"/);
  assert.match(r.html, /name="description" content="Minha descrição"/);
});

test('texto malicioso nunca vira HTML', () => {
  assert.equal(textoParaHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  const r = validarValores({ hero_l1: '<img src=x onerror=alert(1)>' }, campos);
  assert.equal(r.ok, false);
  assert.deepEqual(r.limpos, {});
  const forcado = aplicar(html, js, { hero_l1: '<b>x</b>' });
  assert.ok(!forcado.html.includes('<b>x</b>'));
});

test('validação: chave desconhecida, tamanho, link, telefone e e-mail', () => {
  assert.equal(validarValores({ nao_existe: 'x' }, campos).ok, false);
  assert.equal(validarValores({ hero_l1: 'a'.repeat(500) }, campos).ok, false);
  assert.equal(validarValores({ link_cadastro: 'javascript:alert(1)' }, campos).ok, false);
  assert.equal(validarValores({ link_cadastro: 'http://sem-https.com' }, campos).ok, false);
  assert.equal(validarValores({ link_cadastro: 'https://ok.com/x' }, campos).ok, true);
  assert.equal(validarValores({ wa_numero: '12345' }, campos).ok, false);
  assert.equal(validarValores({ wa_numero: '5524993251138' }, campos).ok, true);
  assert.equal(validarValores({ rod_email: 'sem-arroba' }, campos).ok, false);
  assert.equal(validarValores({ hero_l1: 123 }, campos).ok, false);
  assert.equal(validarValores([], campos).ok, false);
  assert.equal(validarValores(null, campos).ok, false);
});

test('campo vazio volta ao original e não é gravado', () => {
  const r = validarValores({ hero_l1: '   ', hero_l2: 'ok' }, campos);
  assert.deepEqual(r.limpos, { hero_l2: 'ok' });
});

test('ida e volta de negrito e quebra de linha', () => {
  assert.equal(htmlParaTexto('a <strong>b</strong><br />c'), 'a **b**\nc');
  assert.equal(textoParaHtml('a **b**\nc'), 'a <strong>b</strong><br />c');
});
