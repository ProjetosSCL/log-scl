## Plano de melhorias — Tabela operacional + visual global

### 1. Layout duas-colunas no mobile landscape (`PivotTable.tsx`)

Em `isMobileLandscape`, mudar o agrupamento das datas para reduzir o scroll horizontal:
- Em vez de N colunas (uma por dia), agrupar duas datas consecutivas em uma única coluna composta, exibindo um mini sub-header com o par "DD/DD" e dois badges lado a lado dentro da célula. Isso corta a largura horizontal pela metade mantendo legibilidade.
- A coluna Cidade fica fixa à esquerda com largura ampliada (≈180px) e fonte 14px.
- Total da linha continua sticky à direita.
- Em desktop e mobile portrait o layout atual (uma coluna por dia) é preservado.

### 2. Sticky header otimizado para mobile landscape

- `<thead>` continua `sticky top-0` mas com `bg-background/85 backdrop-blur-md` e `box-shadow` inferior sutil para destacar do corpo durante scroll vertical.
- Em landscape, reduzir altura do header (`py-0.5`) e usar duas linhas (par de datas em cima, "HOJE" embaixo se aplicável) para manter os dias sempre visíveis sem ocupar área.
- Coluna Cidade do header ganha `z-30` (acima do z-20 da coluna corpo) garantindo canto superior esquerdo sempre limpo.

### 3. Filtros otimizados para landscape (`tabela-operacional.tsx` + `FiltersBar.tsx`)

- Detectar `isMobileLandscape` na rota e renderizar `FiltersBar` com `only={["contratante","prestador","cidade"]}` automaticamente (sem precisar entrar no modo foco).
- A barra de ações (Compacto / Foco / Print / Tela cheia) colapsa em um único botão "⋯" com Popover em landscape, liberando espaço vertical.
- `FiltersBar` ganha prop `dense` que reduz `p-3 → p-1.5`, gap, e altura dos chips para 7 unidades quando em landscape.

### 4. Auto-zoom em landscape

- Na página `tabela-operacional.tsx`, quando entra em `isMobileLandscape`, calcular zoom alvo: `clamp(80, floor((width - 16) / idealWidth * 100), 100)` onde `idealWidth = cityMinW + (dates.length/2) * pairColWidth + totalCol`.
- Aplicar apenas se o usuário não tiver mexido manualmente no zoom (flag `userZoomed`). Resetar `userZoomed` ao sair do landscape.
- Garante que cidade e badges fiquem legíveis sem necessidade de pinça.

### 5. Print apenas da tabela (`tabela-operacional.tsx`)

- `handleScreenshot` já usa `tableRef.current` via `toPng`, mas o `tableRef` envolve o wrapper `flex-1 min-h-0` que herda altura do container. Em fullscreen ele captura também áreas vazias.
- Mover `tableRef` para envolver diretamente o `<div className="rounded-lg glass …">` interno do `PivotTable` via `forwardRef` exposto como `printRef`.
- Adicionar opção `{ width: el.scrollWidth, height: el.scrollHeight }` em `toPng` para capturar a tabela inteira (incluindo conteúdo fora do viewport por scroll), gerando um PNG que mostra toda a matriz, não apenas a tela.

### 6. Glassmorfismo global

- As classes `.glass` / `.glass-strong` já existem em `src/styles.css`. Reforçar visual aplicando-as consistentemente onde hoje há `bg-card`/`bg-secondary` puros:
  - `KpiCard`, `InsightsPanel`, `OsDrawer` header/footer, `AppHeader`, `AppSidebar`, popover de filtros, botões de ação da toolbar.
  - Aumentar `backdrop-blur` do token `.glass` de `blur(12px)` para `blur(16px) saturate(140%)` e adicionar borda interna `inset 0 1px 0 oklch(1 0 0 / 0.5)` para o brilho de vidro.
- Adicionar nova classe utilitária `.glass-card` no `styles.css` para cards menores (sombra mais leve) e aplicar em chips/badges principais.
- Manter performance: `will-change: backdrop-filter` apenas em containers grandes.

### 7. Cidades em maiúsculo

- Em `PivotTable.tsx`, na célula de cidade aplicar `className="… uppercase tracking-wide"` (CSS-only, sem mutar dados). Mesmo tratamento no `OsDrawer` (header da cidade) para consistência visual.

### Arquivos afetados

- `src/components/dashboard/PivotTable.tsx` — agrupamento landscape, sticky header reforçado, uppercase cidade, expor ref para print.
- `src/components/dashboard/FiltersBar.tsx` — prop `dense`.
- `src/routes/tabela-operacional.tsx` — auto-foco filtros em landscape, auto-zoom, ref de print, toolbar colapsável.
- `src/components/dashboard/OsDrawer.tsx` — uppercase cidade + glass reforçado.
- `src/styles.css` — `.glass` reforçado + `.glass-card`.
- `src/components/dashboard/KpiCard.tsx`, `InsightsPanel.tsx`, `layout/AppHeader.tsx`, `layout/AppSidebar.tsx` — aplicação consistente de `.glass`.

### Pontos de atenção

- O agrupamento de duas datas só ativa quando `dates.length >= 4` em landscape (com 2-3 datas mantém colunas individuais).
- Auto-zoom respeita override manual do usuário.
- Print em PNG de tabela longa pode gerar imagem alta — aceitável e melhor que cortar.

Confirma para implementar?
