// Lógica da função "salvar" do painel de textos (a casca da Vercel está em api/salvar.js).
// Fluxo: confere cabeçalho e origem -> confere a senha -> valida os campos -> grava landing/conteudo.json no GitHub.
// A Vercel republica o site sozinha quando o GitHub recebe o commit.
import { createHash, timingSafeEqual } from 'node:crypto';
import { validarValores } from './painel-lib.mjs';

const ARQUIVO = 'landing/conteudo.json';
const MAX_ERROS = 8;           // erros de senha por IP...
const JANELA_MS = 15 * 60_000; // ...a cada 15 minutos
const ESPERA_ERRO_MS = 800;

const sha256 = (t) => createHash('sha256').update(t, 'utf8').digest();
const iguais = (a, b) => a.length === b.length && timingSafeEqual(a, b);

export function criarHandler({
  campos,
  env = process.env,
  fetchImpl = fetch,
  espera = (ms) => new Promise((r) => setTimeout(r, ms)),
  agora = () => Date.now(),
} = {}) {
  const falhas = new Map(); // ip -> { n, ate }

  const responder = (res, status, corpo) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(corpo));
  };

  async function gh(caminho, opcoes = {}) {
    return fetchImpl(`https://api.github.com${caminho}`, {
      ...opcoes,
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'lyra-painel',
        ...(opcoes.headers || {}),
      },
    });
  }

  async function gravar(conteudo) {
    const repo = env.GITHUB_REPO || 'christiancrwz94/Landpage-Lyra';
    const branch = env.GITHUB_BRANCH || 'main';
    const url = `/repos/${repo}/contents/${ARQUIVO}`;
    for (let tentativa = 0; tentativa < 2; tentativa++) {
      const atual = await gh(`${url}?ref=${encodeURIComponent(branch)}`);
      let sha;
      if (atual.status === 200) {
        const j = await atual.json();
        sha = j.sha;
        const antigo = Buffer.from(j.content || '', 'base64').toString('utf8');
        if (antigo === conteudo) return 'sem-mudanca';
      } else if (atual.status !== 404) {
        throw new Error(`leitura ${atual.status}`);
      }
      const resp = await gh(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'conteudo: edição pelo painel de textos',
          content: Buffer.from(conteudo, 'utf8').toString('base64'),
          branch,
          ...(sha ? { sha } : {}),
          committer: { name: 'Painel Lyra', email: 'painel@getlyra.com.br' },
        }),
      });
      if (resp.status === 200 || resp.status === 201) return 'gravado';
      if (resp.status !== 409 && resp.status !== 422) throw new Error(`gravação ${resp.status}`);
      // 409/422: o arquivo mudou entre a leitura e a gravação; tenta de novo uma vez.
    }
    throw new Error('conflito ao gravar');
  }

  return async function handler(req, res) {
    if (req.method !== 'POST') return responder(res, 405, { erro: 'método não permitido' });
    if (req.headers['x-painel'] !== '1') return responder(res, 403, { erro: 'pedido não autorizado' });
    const origem = req.headers.origin;
    if (origem) {
      let host = '';
      try { host = new URL(origem).host; } catch { /* origem inválida */ }
      if (host !== req.headers.host) return responder(res, 403, { erro: 'origem não permitida' });
    }
    if (!env.EDITOR_SENHA_SHA256 || !env.GITHUB_TOKEN) return responder(res, 503, { erro: 'painel ainda não configurado' });

    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconhecido';
    const reg = falhas.get(ip);
    if (reg && reg.n >= MAX_ERROS && agora() < reg.ate) return responder(res, 429, { erro: 'muitas tentativas; tente de novo em alguns minutos' });

    const corpo = req.body;
    if (!corpo || typeof corpo !== 'object' || typeof corpo.senha !== 'string') return responder(res, 400, { erro: 'pedido inválido' });

    const esperado = Buffer.from(String(env.EDITOR_SENHA_SHA256).trim().toLowerCase(), 'hex');
    if (!iguais(sha256(corpo.senha), esperado)) {
      const novo = !reg || agora() >= reg.ate ? { n: 1, ate: agora() + JANELA_MS } : { n: reg.n + 1, ate: reg.ate };
      falhas.set(ip, novo);
      await espera(ESPERA_ERRO_MS);
      return responder(res, 401, { erro: 'senha incorreta' });
    }
    falhas.delete(ip);

    const { ok, limpos, erros } = validarValores(corpo.valores, campos);
    if (!ok) return responder(res, 422, { erro: 'há campos com problema', erros });

    try {
      const resultado = await gravar(JSON.stringify(limpos, null, 2) + '\n');
      return responder(res, 200, { ok: true, resultado, campos: Object.keys(limpos).length });
    } catch (e) {
      console.error('[painel] falha ao gravar:', e.message); // nunca registra senha, token ou conteúdo
      return responder(res, 502, { erro: 'não foi possível salvar agora; tente de novo' });
    }
  };
}
