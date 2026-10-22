import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { criarHandler } from './painel-api.mjs';

const campos = JSON.parse(readFileSync('landing/campos.json', 'utf8'));
const SENHA = 'senha-de-teste-123';
const HASH = createHash('sha256').update(SENHA).digest('hex');
const env = { EDITOR_SENHA_SHA256: HASH, GITHUB_TOKEN: 'token-falso', GITHUB_REPO: 'dono/repo', GITHUB_BRANCH: 'main' };

function res() {
  const r = { headers: {}, statusCode: 0, corpo: null };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.end = (t) => { r.corpo = JSON.parse(t); };
  return r;
}
const req = (extra = {}) => ({
  method: 'POST',
  headers: { 'x-painel': '1', host: 'www.getlyra.com.br', origin: 'https://www.getlyra.com.br', 'x-forwarded-for': '1.2.3.4' },
  body: { senha: SENHA, valores: { hero_l1: 'Novo título' } },
  ...extra,
});

// GitHub falso: guarda chamadas e responde conforme o roteiro.
function githubFalso(roteiro) {
  const chamadas = [];
  const f = async (url, op = {}) => {
    chamadas.push({ url, metodo: op.method || 'GET', corpo: op.body ? JSON.parse(op.body) : null, auth: op.headers?.Authorization });
    const r = roteiro.shift();
    return { status: r.status, json: async () => r.json };
  };
  f.chamadas = chamadas;
  return f;
}
const novo = (extra = {}) => {
  const fetchImpl = extra.fetchImpl || githubFalso([{ status: 404 }, { status: 201 }]);
  return { handler: criarHandler({ campos, env: extra.env || env, fetchImpl, espera: async () => {}, agora: extra.agora }), fetchImpl };
};

test('só aceita POST, com cabeçalho do painel e mesma origem', async () => {
  const { handler } = novo();
  let r = res(); await handler(req({ method: 'GET' }), r); assert.equal(r.statusCode, 405);
  r = res(); await handler(req({ headers: { host: 'www.getlyra.com.br' } }), r); assert.equal(r.statusCode, 403);
  r = res(); await handler(req({ headers: { 'x-painel': '1', host: 'www.getlyra.com.br', origin: 'https://outro-site.com' } }), r); assert.equal(r.statusCode, 403);
});

test('sem configuração (senha ou token) responde 503 e não grava', async () => {
  const { handler, fetchImpl } = novo({ env: { ...env, GITHUB_TOKEN: '' } });
  const r = res(); await handler(req(), r);
  assert.equal(r.statusCode, 503);
  assert.equal(fetchImpl.chamadas.length, 0);
});

test('senha errada: 401, nada é gravado, e bloqueia depois de várias tentativas', async () => {
  const relogio = { t: 1_000_000 };
  const { handler, fetchImpl } = novo({ agora: () => relogio.t });
  for (let i = 0; i < 8; i++) {
    const r = res(); await handler(req({ body: { senha: 'errada', valores: {} } }), r);
    assert.equal(r.statusCode, 401);
  }
  let r = res(); await handler(req(), r); // até a senha certa fica bloqueada
  assert.equal(r.statusCode, 429);
  relogio.t += 16 * 60_000; // passou a janela
  r = res(); await handler(req(), r);
  assert.equal(r.statusCode, 200);
  assert.equal(fetchImpl.chamadas.length, 2); // só a última tentativa chegou ao GitHub
});

test('campo inválido: 422 com o motivo e nada é gravado', async () => {
  const { handler, fetchImpl } = novo();
  const r = res(); await handler(req({ body: { senha: SENHA, valores: { link_cadastro: 'javascript:alert(1)', xyz: 'a' } } }), r);
  assert.equal(r.statusCode, 422);
  assert.ok(r.corpo.erros.link_cadastro && r.corpo.erros.xyz);
  assert.equal(fetchImpl.chamadas.length, 0);
});

test('arquivo novo: lê (404), grava sem sha, com token e branch certos', async () => {
  const { handler, fetchImpl } = novo();
  const r = res(); await handler(req(), r);
  assert.equal(r.statusCode, 200);
  assert.equal(r.corpo.resultado, 'gravado');
  const [leitura, gravacao] = fetchImpl.chamadas;
  assert.match(leitura.url, /repos\/dono\/repo\/contents\/landing\/conteudo\.json\?ref=main$/);
  assert.equal(gravacao.metodo, 'PUT');
  assert.equal(gravacao.auth, 'Bearer token-falso');
  assert.equal(gravacao.corpo.sha, undefined);
  assert.equal(gravacao.corpo.branch, 'main');
  assert.deepEqual(JSON.parse(Buffer.from(gravacao.corpo.content, 'base64').toString()), { hero_l1: 'Novo título' });
});

test('arquivo existente: grava com o sha; sem mudança não cria commit', async () => {
  const conteudoAtual = JSON.stringify({ hero_l1: 'Novo título' }, null, 2) + '\n';
  let { handler, fetchImpl } = novo({ fetchImpl: githubFalso([{ status: 200, json: { sha: 'abc', content: Buffer.from(conteudoAtual).toString('base64') } }]) });
  let r = res(); await handler(req(), r);
  assert.equal(r.corpo.resultado, 'sem-mudanca');
  assert.equal(fetchImpl.chamadas.length, 1);

  ({ handler, fetchImpl } = novo({ fetchImpl: githubFalso([{ status: 200, json: { sha: 'abc', content: Buffer.from('{}').toString('base64') } }, { status: 200 }]) }));
  r = res(); await handler(req(), r);
  assert.equal(r.corpo.resultado, 'gravado');
  assert.equal(fetchImpl.chamadas[1].corpo.sha, 'abc');
});

test('conflito (409): tenta de novo uma vez e consegue', async () => {
  const roteiro = [{ status: 200, json: { sha: 'a', content: '' } }, { status: 409 }, { status: 200, json: { sha: 'b', content: '' } }, { status: 200 }];
  const { handler, fetchImpl } = novo({ fetchImpl: githubFalso(roteiro) });
  const r = res(); await handler(req(), r);
  assert.equal(r.statusCode, 200);
  assert.equal(fetchImpl.chamadas[3].corpo.sha, 'b');
});

test('falha do GitHub: 502 sem vazar detalhes', async () => {
  const { handler } = novo({ fetchImpl: githubFalso([{ status: 500 }]) });
  const r = res(); await handler(req(), r);
  assert.equal(r.statusCode, 502);
  assert.ok(!JSON.stringify(r.corpo).includes('token'));
});

test('restaurar tudo ao original: valores vazios gravam arquivo vazio {}', async () => {
  const { handler, fetchImpl } = novo();
  const r = res(); await handler(req({ body: { senha: SENHA, valores: { hero_l1: '' } } }), r);
  assert.equal(r.statusCode, 200);
  assert.deepEqual(JSON.parse(Buffer.from(fetchImpl.chamadas[1].corpo.content, 'base64').toString()), {});
});
