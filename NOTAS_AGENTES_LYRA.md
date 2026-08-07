# Notas para Agentes - Landing Page Lyra

Este arquivo resume o que foi construído, as decisões tomadas e, principalmente, a forma como o Chris trabalha e avalia a landing page do Lyra. Use este documento antes de continuar qualquer alteração relevante no projeto.

## Contexto do Projeto

O projeto é uma landing page do Lyra Odonto, software para clínicas odontológicas. A proposta central é convencer dentistas e clínicas de que o Lyra reduz burocracia, automatiza tarefas operacionais e centraliza a gestão em uma única plataforma.

O site está implementado como uma landing estática em Vite:

- `index.html` concentra a estrutura da página e scripts inline.
- `src/style.css` concentra praticamente todo o visual, responsividade e animações.
- `src/main.js` existe, mas a landing atual usa script inline no `index.html`.
- Assets principais ficam em `assets/` e `public/assets/`.

Comando de validação usado durante o projeto:

```bash
npm.cmd --prefix "C:\Users\chris\OneDrive\Documents\projeto odonto\Landpage Lyra" run build
```

Repositório GitHub:

```text
christiancrwz94/Landpage-Lyra
```

Última versão salva no Git durante a sessão:

```text
commit eb67c73 - Improve Lyra landing page
branch main
```

## Forma de Trabalhar do Chris

O Chris trabalha de forma muito visual e iterativa. Ele costuma mandar prints e pedir ajustes pontuais sobre aquilo que está vendo na tela. O fluxo ideal é:

1. Ler o pedido mais recente com atenção.
2. Fazer exatamente o ajuste solicitado, sem reinventar a seção inteira, a menos que ele peça autonomia ou redesign.
3. Validar com build quando houver alteração de código.
4. Responder de forma curta, dizendo o que foi alterado e se o build passou.

Ele gosta quando o agente toma boas decisões visuais, mas dentro da direção que ele acabou de dar. Quando ele diz que dá autonomia, pode propor e executar soluções mais fortes. Quando ele aponta uma área específica no print, o ideal é resolver aquela área com precisão.

Preferências claras do Chris:

- Visual premium, moderno e com acabamento de landing SaaS de alto nível.
- Referências: Apple, Samsung One UI, Stripe, Linear, Framer e Suno.
- Design limpo, sofisticado, com espaço bem controlado.
- Animações sutis, lentas e elegantes.
- Evitar exageros, efeitos elásticos, bounce, poluição visual e elementos com cara amadora.
- Ajustes devem priorizar conversão: fazer o dentista querer testar o Lyra.
- Ele valoriza mockups reais do sistema, bem posicionados, com sombra realista.
- Ele costuma pedir para salvar no Git em momentos de segurança; só faça commit/push quando ele pedir.

## Direção Visual Consolidada

### Paleta e Estilo

A identidade visual foi consolidada em azul, ciano e azul-marinho:

- Azul principal: `#1d4ed8` / variações próximas.
- Ciano: `#06b6d4` / `#59b7ff`.
- Azul-marinho premium: `#11284D` ou próximo.
- Texto principal: azul muito escuro.
- Fundos claros: branco e cinza muito suave.

Os elementos de destaque usam gradiente azul/ciano animado lentamente. Essa animação deve ser sutil e contínua, sem corte seco perceptível.

### Badges e Botões

Vários badges foram padronizados com fundo azul gradiente animado e texto branco. O Chris pediu isso repetidamente para manter consistência.

Exemplos de badges padronizados:

- `Novo padrão de gestão para clínicas odontológicas`
- `Menos digitação, mais atendimento`
- `Envio automático de mensagens`
- `Chega de perder tempo`
- `Sincronização automática`
- `Financeiro descomplicado`
- `Mais que um sistema`

O botão principal `Testar grátis` também foi arredondado e ganhou a mesma animação de gradiente.

### Ícones

Preferência forte por ícones minimalistas no estilo Lucide, sem balões em volta quando ele pede algo mais limpo. Em alguns cards, o Chris pediu explicitamente para remover emojis e usar ícones minimalistas.

Evite emojis em componentes premium, a menos que ele peça expressamente.

## Principais Seções e Decisões

### Hero

Headline atual:

```text
Liberte-se da burocracia e faça sua clínica faturar mais.
```

Descrição atual:

```text
O Lyra conecta IA por voz, automações no WhatsApp, agenda inteligente, prontuário digital, odontograma e financeiro para reduzir tarefas operacionais e permitir que o dentista foque no que realmente importa: seus pacientes.
```

Decisões:

- Hero usa o mockup do WhatsApp como primeiro mockup.
- O botão `Começar teste grátis de 7 dias` foi removido do hero.
- Badge do hero recebeu gradiente animado.
- Mockup foi ajustado várias vezes para não sobrepor texto em telas de notebook.
- Espaçamento superior do hero foi reduzido.
- Chat flutuante fica no canto inferior direito.

### Chat Flutuante

Foi criado um botão de atendimento no canto inferior direito, inspirado em botão circular de chat.

Comportamento:

- Mostra convite `Posso ajudar?`.
- Tem botão `X` para fechar o convite.
- Ao fechar, a pergunta some durante a sessão atual usando `sessionStorage`.
- Ao fechar e abrir novamente o site em uma nova sessão, o convite aparece de novo.
- O botão circular permanece visível.
- O botão usa o mesmo gradiente azul animado da landing.

### Faixa de Provas/Recursos

A faixa escura abaixo do hero foi reorganizada para comunicar:

- `Fale, a IA escreve.`
- `Prontuário completo em segundos.`
- `WhatsApp Inteligente`
- `Confirma consultas, envia lembretes e atende automaticamente.`
- `Assinatura Digital`
- `Documentos e contratos assinados com validade jurídica.`
- `Sincronização em tempo real`
- `Todos os dados sempre atualizados em qualquer dispositivo.`

Os itens foram centralizados verticalmente e a altura da faixa foi reduzida.

### Seção de Dor / Método Tradicional x Com Lyra

Foi criada uma comparação visual em dois cards:

Card esquerdo:

- Selo: `Método tradicional`
- Título: `Mais trabalho. Menos tempo para o paciente.`
- Bullets:
  - `Prontuários acumulam no fim do dia.`
  - `Confirmações dependem da recepção.`
  - `Avaliações no Google são esquecidas.`
  - `Pacientes não recebem felicitações.`
  - `A clínica perde oportunidades diariamente.`
  - `Financeiro espalhado e sem controle.`

Card direito:

- Selo: `Com Lyra`
- Título: `Mais automação. Mais tempo para cuidar.`
- Bullets:
  - `Evolução clínica por voz com IA.`
  - `WhatsApp confirma consultas automaticamente.`
  - `Agenda inteligente com status em tempo real.`
  - `Odontograma interativo integrado ao orçamento.`
  - `Financeiro completo em um só lugar.`
  - `Documentos com assinatura digital integrada.`

### WhatsApp Inteligente

Título atual:

```text
Transforme sua recepção em um motor de crescimento.
```

Descrição atual:

```text
O Lyra automatiza confirmações, lembretes, mensagens pós-consulta e pedidos de avaliação para reduzir faltas, fortalecer sua reputação no Google Maps e gerar mais oportunidades para a sua clínica.
```

Também há texto em seção escura:

```text
Reduza faltas, conquiste muito mais avaliações no Google Maps e mantenha sua clínica crescendo automaticamente, mesmo fora do horário de atendimento.
```

Cards da seção receberam ícones minimalistas:

- Confirmações e lembretes
- Recepção 24h
- Cobrança sem constrangimento
- Mais avaliações no Google

O Chris pediu para diminuir espaçamento de texto, remover balão dos ícones e manter títulos em uma linha quando possível.

### Evolução por Voz com IA

Título ajustado:

```text
Evolução do paciente por voz com IA
```

Badge:

```text
Menos digitação, mais atendimento
```

Cards:

- `Zero digitação entre consultas`
- `Foco 100% no paciente`
- `Agenda mais fluida`

Texto do primeiro card foi ajustado para:

```text
Menos tela, menos cansaço mental e menos prontuário acumulado.
```

Os cards receberam melhoria visual com ícones minimalistas posicionados ao centro vertical no canto esquerdo.

### Documentos / Assinatura Digital

Seção passou por vários ajustes de copy e layout.

Título:

```text
Atestados, anamnese, termos e assinatura digital em apenas um clique.
```

Lista numerada:

1. `Paciente recebe formulários, termos ou atestado direto no celular.`
2. `Assinatura direto no app.`
3. `Documentos salvos no prontuário com organização e segurança.`

Cards:

- `Anamnese` / `Preenchida direto no sistema`
- `Termo de Consentimento Livre e Esclarecido` / `Assinado digitalmente`
- `Receituário` / `Gerado em segundos`

A seção recebeu fundo azul gradiente. Depois houve ajustes para manter 3 cards de um lado e 3 do outro, sem sobreposição e sem excesso de espaço.

### Odontograma

Badge padronizado:

```text
Odontograma inteligente
```

Pontos foram alinhados verticalmente com as frases.

Mockup teve borda removida e tamanho padronizado com os outros mockups.

### Agenda / Sincronização

Badge:

```text
Sincronização automática
```

Título:

```text
Sua clínica inteira, em um só lugar.
```

Descrição:

```text
Agenda, múltiplos profissionais, financeiro e Google Calendar sincronizados em tempo real.
```

Bloco detalhado:

```text
Uma agenda que acompanha o ritmo da sua clínica.
Visualize compromissos por dia, semana ou mês e sincronize tudo com o Google Calendar.
```

O texto foi aproximado do mockup para ficar mais centralizado e menos solto.

### Financeiro Descomplicado

Foi criada uma seção específica com imagem de dentista segurando celular com tela financeira do Lyra. A imagem atual vem de:

```text
assets/financeiro-descomplicado.png
```

O layout final tem:

- Imagem à esquerda.
- Texto e cards à direita.
- Badge centralizado acima da imagem: `Financeiro descomplicado`.

Título:

```text
Controle todo o financeiro da sua clínica com rapidez e clareza.
```

Descrição:

```text
Gerencie faturamento, recebimentos, contas a receber, despesas e acompanhe relatórios completos em tempo real.
```

Cards com ícones minimalistas, sem emojis:

- `Faturamento em tempo real`
- `Recebimentos organizados`
- `Despesas sob controle`
- `Relatórios inteligentes`

Cards foram padronizados com fundo azul gradiente animado e bordas arredondadas. O Chris pediu que o balão fosse do tamanho da frase, sem espaço extra.

### Nova Seção Premium: Plataforma Integrada

A seção antiga de carrossel/CTA foi substituída por uma seção premium escura inspirada em Apple, Samsung One UI, Stripe, Linear e Framer.

Objetivo:

Comunicar que o Lyra reúne toda a gestão da clínica em uma única plataforma.

Estrutura:

- Container centralizado com largura máxima próxima de 1400px.
- Fundo azul-marinho com gradiente sutil.
- Border-radius de 24px.
- Duas colunas no desktop.
- Coluna esquerda com título, descrição, divisor e benefícios.
- Coluna direita com ecossistema visual do Lyra.

Título:

```text
Tudo o que sua clínica precisa.
Em um só lugar.
```

O trecho `Em um só lugar.` usa gradiente azul.

Descrição:

```text
Chega de alternar entre vários sistemas. Com o Lyra, você centraliza toda a operação da sua clínica em uma única plataforma.
```

Benefícios:

- `Mais controle` / `Tudo organizado em um só lugar.`
- `Mais tempo` / `Automação que libera você para o que importa.`
- `Mais resultados` / `Gestão inteligente para fazer sua clínica crescer.`

Ecossistema visual:

- Logo Lyra no centro com glassmorphism, glow e respiração suave.
- Módulos conectados:
  - Agenda
  - Pacientes
  - Financeiro
  - WhatsApp
  - Prontuário
  - Avaliações

Animações:

- Core do logo com respiração leve.
- Módulos com flutuação sutil.
- Linhas pontilhadas azuis.
- Pontos luminosos deslizando lentamente pelas linhas.
- Hover com scale e brilho discretos.

Observação técnica:

O pedido mencionava React + Tailwind + Framer Motion, mas a landing atual está em HTML/CSS estático. Para evitar migração desnecessária, a implementação foi feita em HTML/CSS puro, com SVGs inline no estilo Lucide e keyframes CSS.

## Mockups e Imagens

Mockups reais do sistema foram enviados pelo Chris e usados como material principal de conversão:

- `mockup-whatsapp.png`
- `mockup-evolucao-ia.png`
- `mockup-agenda.png`
- `mockup-odontograma.png`
- `financeiro-descomplicado.png`

Preferências consolidadas:

- Mockups não devem parecer flutuando sem peso.
- Sombra deve ser realista e preferencialmente projetada para um lado, não igualmente para os dois lados.
- Mockups devem ter tamanho consistente entre seções.
- Em notebook, texto nunca pode invadir mockup.
- A primeira seção usa animação automática do mockup.
- Demais mockups animam quando a seção entra no centro da tela.

## Animações de Mockups

Foi implementado padrão premium:

- Hero entra automaticamente ao carregar.
- Demais mockups entram com `IntersectionObserver`.
- Cada animação ocorre uma única vez.
- Direção depende do lado do mockup:
  - mockup à esquerda entra da esquerda.
  - mockup à direita entra da direita.
- Propriedades usadas:
  - `transform`
  - `opacity`
  - `filter: blur`

Easing aproximado:

```text
cubic-bezier(0.22, 1, 0.36, 1)
```

## Responsividade

Várias correções foram feitas para evitar:

- Texto em cima de mockups em telas de notebook.
- Espaço lateral direito sobrando.
- Cards sobrepostos em seções com grid.
- Mockups grandes demais em janelas menores.
- Elementos saindo da largura da página.

Há regras de `overflow-x` para evitar espaço lateral indesejado criado por animações.

## Cuidados para Próximos Agentes

1. Antes de redesenhar algo, veja o site no navegador local e compare com o pedido visual do Chris.
2. Não remova detalhes que foram refinados ao longo da conversa sem pedido explícito.
3. Evite usar emojis em cards premium; use ícones minimalistas.
4. Preserve os badges com gradiente animado quando fizer sentido.
5. Se mexer no hero, teste especialmente notebook/larguras médias.
6. Se mexer em mockups, cuide para não criar sombra artificial demais.
7. Se alterar CSS global como `.split-feature`, confira todas as seções, porque várias usam esse padrão.
8. Sempre rode build após alterações relevantes.
9. Só faça commit/push quando o Chris pedir para salvar no Git.
10. Responda com objetividade: o que mudou, se o build passou e qualquer risco importante.

## Frases e Termos Importantes

Use `Google Maps`, não apenas `Google`, quando falar de avaliações/reputação.

O teste gratuito é de 7 dias.

Evite termos genéricos que o Chris já pediu para remover, como:

- `Diferencial único`
- `Automação 24/7` em alguns badges antigos
- labels repetitivos como `ANTES`, `DEPOIS`, `COM LYRA`, `PROBLEMA`

O tom da landing deve sempre apontar para:

- menos burocracia
- mais tempo para pacientes
- automação da recepção
- IA por voz
- gestão centralizada
- financeiro claro
- aumento de oportunidades e avaliações

