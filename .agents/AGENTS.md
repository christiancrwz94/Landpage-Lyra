# AGENTE — LANDING PAGE LYRA DENTAL

Você é o engenheiro responsável pela landing page do produto **Lyra Dental** (`getlyra.com.br`).

## CONTEXTO DO PROJETO

**Produto:** Landing page de marketing do Lyra Dental — SaaS para clínicas odontológicas.
**Stack:** HTML + CSS (Vanilla) + JavaScript (Vanilla) — build com Vite.
**Deploy:** Vercel (automático via push para `main` no GitHub).
**Repositório:** `git@github.com:christiancrwz94/Landpage-Lyra.git`
**Pasta local:** `/home/christiancruz/Documentos/Landpage Lyra/`

## ESTRUTURA

```
index.html          # Página principal (HTML completo)
privacidade.html    # Política de privacidade
src/
  style.css         # Todo o CSS da landing page
  main.js           # JavaScript (navbar, reveal, carousel, scroll)
public/
  assets/           # Imagens otimizadas (webp, avif, png)
  app-screenshots/  # Screenshots do app para seção de features
  favicon.svg
  icons.svg
  robots.txt
  sitemap.xml
assets/             # Imagens originais (fonte de verdade para edições)
play-store-assets/  # Assets da Play Store (não usados na landing)
vercel.json         # Config do deploy
vite.config.js      # Config do build
```

## REGRAS

- **Arquivos que você edita:** `index.html`, `src/style.css`, `src/main.js`, `privacidade.html`
- **Nunca edite** arquivos do app Flutter (`applyra/`) a partir desta pasta
- **Idioma do site:** pt-BR
- **Paleta principal:** `#1d4ed8` (azul), `#0f172a` (ink escuro), `#f8fafc` (fundo claro)
- **Fonte:** Inter (Google Fonts)
- **Commit e push:** sempre confirmar com o usuário antes de `git push`

## DEPLOY

Para publicar alterações em produção:
1. `cd "/home/christiancruz/Documentos/Landpage Lyra"`
2. `git add -A && git commit -m "mensagem"`
3. `git push origin main` — Vercel faz o deploy automaticamente

## PREVIEW LOCAL

```bash
cd "/home/christiancruz/Documentos/Landpage Lyra"
npm run dev
# Abre em http://localhost:5173
```

## REGRAS DE QUALIDADE

- Rodar sempre em `http://localhost:5173` (Vite dev) para testar — não abrir `file://` diretamente
- Manter SEO: `<title>`, `<meta description>`, heading hierarchy (`h1` → `h2` → `h3`)
- Imagens novas: adicionar versão `.webp` em `public/assets/`
- CSS: sem `scroll-behavior: smooth` global no `html` (causa scroll travado no Firefox/Linux)
- CSS: sem `will-change` na navbar com `backdrop-filter` (cria layer de composição pesada)
