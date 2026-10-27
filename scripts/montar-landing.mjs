// Monta o site: copia a pasta landing/ para dist/ (o que a Vercel publica) e aplica os textos salvos no painel (landing/conteudo.json).
// Se algo no painel estiver errado ou faltar, a página sai com os textos originais: o painel nunca derruba o site.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { extrairPadroes, validarValores, aplicar } from './painel-lib.mjs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('landing', 'dist', { recursive: true });

try {
  const campos = JSON.parse(readFileSync('landing/campos.json', 'utf8'));
  const html = readFileSync('landing/index.html', 'utf8');
  const js = readFileSync('landing/script.js', 'utf8');
  const padroes = extrairPadroes(html, js);

  let salvos = {};
  if (existsSync('landing/conteudo.json')) {
    try {
      const { limpos, erros } = validarValores(JSON.parse(readFileSync('landing/conteudo.json', 'utf8')), campos);
      for (const [k, e] of Object.entries(erros)) console.warn(`Painel: campo "${k}" ignorado (${e})`);
      salvos = limpos;
    } catch (e) {
      console.warn('Painel: conteudo.json ilegível, usando os textos originais:', e.message);
    }
  }

  const { html: htmlFinal, js: jsFinal } = aplicar(html, js, salvos);
  writeFileSync('dist/index.html', htmlFinal);
  writeFileSync('dist/script.js', jsFinal);

  // Dados para a tela de edição: o texto atual e o original de cada campo.
  const dados = campos.map((c) => ({ ...c, padrao: padroes[c.chave] ?? '', valor: salvos[c.chave] ?? padroes[c.chave] ?? '' }));
  mkdirSync('dist/editar', { recursive: true });
  writeFileSync('dist/editar/dados.json', JSON.stringify({ campos: dados }));
  console.log(`Painel de textos: ${Object.keys(salvos).length} campo(s) editado(s).`);
} catch (e) {
  console.warn('Painel de textos ignorado (site publicado com os textos originais):', e.message);
}
// MODO MANUTENÇÃO: enquanto existir a pasta manutencao/, a página inicial vira um aviso "voltamos em breve" (sem a landing).
// As páginas de privacidade e de exclusão de conta continuam no ar (exigidas pela Play Store). Para voltar ao normal: apagar manutencao/.
if (existsSync('manutencao/index.html')) {
  cpSync('manutencao/index.html', 'dist/index.html');
  cpSync('manutencao/logo.png', 'dist/logo.png');
  cpSync('manutencao/robots.txt', 'dist/robots.txt');
  rmSync('dist/sitemap.xml', { force: true });
  console.log('MODO MANUTENÇÃO ativo: página inicial substituída.');
}
console.log('Site montado em dist/');
