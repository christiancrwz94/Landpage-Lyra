# Relatorio final de QA - Landing Page Lyra

Data: 28/08/2026

## Resumo executivo

A landing page e a pagina de privacidade foram auditadas em navegacao, conversao, responsividade, desempenho, acessibilidade, SEO, seguranca e consistencia. O design, a paleta, a ordem das secoes e os textos comerciais foram preservados. A unica alteracao de oferta foi a troca do periodo de teste gratuito de 7 para 30 dias.

O build de producao foi concluido sem erros. A validacao responsiva cobriu 360x800, 390x844, 428x926, 768x1024, 844x390, 1280x800, 1440x900 e 1920x1080, sem rolagem horizontal na pagina.

## Lighthouse

| Perfil | Momento | Performance | Acessibilidade | Boas praticas | SEO | FCP | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | Antes | 63 | 96 | 96 | 92 | 3,5 s | 8,6 s | 0 | 0 ms |
| Mobile | Depois | 83 | 100 | 100 | 100 | 2,6 s | 3,7 s | 0 | 0 ms |
| Desktop | Antes | 95 | 96 | 96 | 92 | 0,9 s | 1,4 s | 0,014 | 0 ms |
| Desktop | Depois | 99 | 100 | 100 | 100 | 0,8 s | 0,8 s | 0,014 | 0 ms |

Observacao: o resultado mobile pode variar alguns pontos entre execucoes. O maior ganho veio da entrega de mockups em AVIF/WebP, dimensoes explicitas e ajustes no carregamento da imagem principal.

## Correcoes realizadas

### Alta prioridade

- Corrigidos links de chamada para cadastro para apontarem diretamente ao fluxo `signup=1`.
- Preservados `utm_source`, `utm_campaign`, `utm_medium`, `utm_content`, `utm_term` e `ref` ao sair da landing page para o cadastro.
- Corrigidas referencias inconsistentes ao teste gratuito de 7 dias.
- Eliminada a distorcao de proporcao dos mockups responsivos.
- Corrigida a navegacao do menu mobile, com estado acessivel e bloqueio correto quando fechado.

### Media prioridade

- Adicionados `canonical`, robots, Open Graph, Twitter Cards e dados estruturados de SoftwareApplication.
- Criados `robots.txt`, `sitemap.xml`, manifesto e pagina 404.
- Adicionados cabecalhos de seguranca e cache para a publicacao na Vercel.
- Corrigidos links falsos do rodape e links para privacidade, termos e contato.
- Melhorados foco de teclado, link para pular ao conteudo, hierarquia de cabecalhos e estados ARIA.
- Corrigidos SVGs com marcacao invalida e imagens sem dimensoes explicitas.

### Baixa prioridade

- Adicionados eventos no `dataLayer` para cadastro, navegacao, abertura do chat e profundidade de rolagem.
- Ajustados pontos de quebra para tablet e modo paisagem.
- Reduzido o custo visual de filtros e animacoes dos mockups em telas pequenas.

## Teste gratuito: 4 substituicoes confirmadas

1. Selo da oferta: `7 dias gratis` para `30 dias gratis`.
2. Texto do plano: `7 dias de acesso completo` para `30 dias de acesso completo`.
3. Chamada fixa de cadastro: `Teste gratis por 7 dias` para `Teste gratis por 30 dias`.
4. Chamada do rodape: periodo de 7 dias para 30 dias.

Nao existem referencias visiveis a 7 dias na landing page nem na pagina de privacidade. O arquivo interno `NOTAS_AGENTES_LYRA.md` ainda possui anotacoes historicas e nao e exibido no site.

## Resultado por frente

| Frente | Resultado |
| --- | --- |
| Links e ancoras | Links principais, menu, rodape, privacidade, termos e ancora da agenda validados. |
| Funil de conversao | CTAs levam ao cadastro e preservam parametros de campanha e referencia. |
| Responsividade | Validada em celulares, tablet, desktop e paisagem, sem overflow da pagina. |
| Compatibilidade | Validada no Chromium. A implementacao usa HTML/CSS padrao; Firefox e Safari ainda precisam de teste real em dispositivo ou nuvem. |
| Performance | Mockups convertidos para AVIF/WebP, preload do hero e dimensoes de imagem corrigidas. |
| Acessibilidade | Lighthouse 100, foco visivel, semantica, ARIA e navegacao por teclado corrigidos. |
| SEO | Lighthouse 100, metadados, canonical, sitemap, robots e dados estruturados adicionados. |
| Integracoes | Eventos preparados no `dataLayer`; cadastro recebe UTMs e `ref`. |
| Infraestrutura | Build Vite aprovado, pagina 404, cache e cabecalhos de seguranca configurados. |
| Legal | Politica de privacidade e termos acessiveis e ligados no rodape. |
| Conteudo | Copy e estrutura preservadas; somente o periodo gratuito foi alterado. |

## Pendencias externas

- Inserir os IDs reais de GA4/GTM/Meta Pixel. A pagina esta preparada, mas nao ha identificadores de producao no projeto.
- Conectar o chat ao provedor ou backend real. A interface abre e fecha corretamente, mas o envio nao foi validado como atendimento real.
- Confirmar Firefox e Safari/iOS em navegadores reais antes de uma campanha de grande alcance.
- Validar com o responsavel pelo produto todas as alegacoes comerciais e juridicas publicadas.
- Avaliar uma Content-Security-Policy apos definir analytics e chat; ativar uma politica restritiva agora poderia quebrar scripts inline e integracoes futuras.

## Arquivos alterados ou adicionados

- `index.html`
- `privacidade.html`
- `src/main.js`
- `src/style.css`
- `vercel.json`
- `public/404.html`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/site.webmanifest`
- `public/assets/icon-192.png`
- `public/assets/icon-512.png`
- `public/assets/financeiro-descomplicado.avif`
- `public/assets/financeiro-descomplicado.webp`
- `public/assets/mockup-agenda.avif`
- `public/assets/mockup-agenda.webp`
- `public/assets/mockup-evolucao-ia.avif`
- `public/assets/mockup-evolucao-ia.webp`
- `public/assets/mockup-odontograma.avif`
- `public/assets/mockup-odontograma.webp`
- `public/assets/mockup-whatsapp-hero.avif`
- `public/assets/mockup-whatsapp-hero.webp`
- `public/assets/mockup-whatsapp.avif`
- `public/assets/mockup-whatsapp.webp`

## Verificacoes executadas

- `npm run build`: aprovado.
- Lighthouse mobile e desktop: aprovado, resultados acima.
- Navegacao interna e pagina de privacidade: aprovada.
- Preservacao de UTMs e `ref`: aprovada.
- Menu mobile e chat: estados de abrir/fechar aprovados.
- Varredura de overflow em oito viewports: aprovada.
