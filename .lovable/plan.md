
# Plano — Dashboard Operacional de OS (Stone-style Glassmorphism)

## Visão geral

Sistema SaaS enterprise para acompanhamento diário de Ordens de Serviço, com sidebar, header, KPIs, tabela dinâmica cidade×data com heatmap de criticidade, filtros avançados, drawer de drill-down, painel de insights e gráficos. Estética dark + glassmorphism inspirada em Stone, Linear, Datadog.

## Estrutura de rotas

```
src/routes/
  __root.tsx              layout global (sidebar + header + outlet)
  index.tsx               Dashboard (KPIs + tabela + insights + gráficos)
  sla.tsx                 Indicadores de SLA
  os-criticas.tsx         Lista de OS críticas
  prestadores.tsx         Ranking e gestão de prestadores
  relatorios.tsx          Relatórios operacionais
  indicadores.tsx         Painel de KPIs detalhado
  configuracoes.tsx       Configurações
```

Cada rota terá `head()` próprio (title/description/og).

## Design system (`src/styles.css`)

Tokens novos em oklch (dark-first):

- `--background`: verde-preto profundo (`oklch(0.16 0.03 155)`)
- `--surface` / `--card`: glass base (`oklch(0.22 0.025 155 / 0.55)`)
- `--surface-elevated`: drawer/modal (`oklch(0.26 0.03 155 / 0.7)`)
- `--primary`: Stone green `oklch(0.78 0.21 148)` (≈ #00D959)
- `--primary-glow`: `oklch(0.85 0.22 148)`
- `--border`: `oklch(1 0 0 / 0.08)`
- Estados de criticidade:
  - `--status-critical` (vermelho), `--status-warning` (laranja), `--status-attention` (amarelo), `--status-healthy` (verde Stone)
- Gradientes/sombras: `--gradient-primary`, `--gradient-glass`, `--shadow-glow`, `--shadow-elevated`
- Utilitários: classe `.glass` (background-color + backdrop-filter blur(20px) + border 1px), `.glass-strong`, `.glow-primary`

Tipografia: Inter via `<link>` no `__root` head. Radius default 12px.

## Componentes

```
src/components/
  layout/
    AppSidebar.tsx        glassmorphism, ícones lucide, ativo via useRouterState, collapse
    AppHeader.tsx         título, datetime live, "última atualização", search global, refresh, avatar
  dashboard/
    KpiCard.tsx           ícone, valor, delta %, sparkline mini, hover glow
    KpiGrid.tsx           grid responsivo dos 8 KPIs
    FiltersBar.tsx        chips multi-select com Popover/Command (contratante, prestador, cidade, região, técnico, criticidade, período, status, emergencial)
    PivotTable.tsx        tabela cidade×data; sticky header/coluna; células coloridas por SLA; clique → drill-down; ordenação, paginação
    HeatCell.tsx          célula com cor por criticidade + tooltip
    InsightsPanel.tsx     mini-cards de insights automáticos
    OsDrawer.tsx          Sheet lateral direita com detalhes da OS, timeline, badges, botões
    charts/
      OsByCityBar.tsx     recharts bar
      DueByDayLine.tsx    recharts area/line
      StatusDonut.tsx     recharts pie donut
      CriticalityHeatmap.tsx  grid SVG
      RankingList.tsx     prestadores/cidades/técnicos
  ui/                      shadcn existente (sheet, popover, command, badge, button, etc.)
```

Drawer usa `components/ui/sheet.tsx` (Sheet/SheetContent side="right") já presente.

## Dados (mock)

`src/lib/mock-data.ts` — gera ~200 OS com cidades (Limoeiro, Morada Nova, Russas, Quixadá, Sobral, Fortaleza...), datas próximas, prestadores, técnicos, SLA, status, criticidade. Funções:

- `getKpis()`
- `getPivot(filters)` → `{ cities, dates, matrix, totals }`
- `getOsByCell(city, date)` → lista de OS para o drawer
- `getInsights()`, `getRankings()`, `getStatusDistribution()`, `getDueByDay()`

Estado de filtros via Zustand simples ou `useState` no `index.tsx` + Context. Vou manter local no Dashboard (sem nova lib).

## Comportamentos chave

- Tabela: hover destaca linha+coluna, células coloridas por % de SLA vencido, clique abre `OsDrawer` com `{city, date, items}`.
- Drawer: animação Sheet padrão, conteúdo em cards glass, timeline vertical, badges de status/SLA/emergência, botões "Ver detalhes" / "Abrir OS".
- Header: relógio atualiza a cada 1s; botão refresh dispara animação spin + toast.
- Sidebar: collapsible icon mode, indicador ativo com barra glow.
- Microinterações: framer-motion já em `tw-animate-css`/Tailwind animations existentes; usar `animate-fade-in`, hover scale, transitions.

## Responsividade

- Desktop/TV: layout full grid (sidebar + main 12 cols, painel insights à direita lg+).
- Tablet: insights colapsam abaixo, sidebar vira icon-only.
- Mobile: sidebar offcanvas via Sheet, KPIs em 2 colunas, tabela com scroll horizontal.

## Detalhes técnicos

- TanStack Router file routes; `__root.tsx` mantém shell HTML + envolve `<Outlet/>` em layout com Sidebar/Header.
- Sem backend nesta entrega — tudo mockado client-side (pode ser plugado em Lovable Cloud depois).
- Recharts já disponível em `components/ui/chart.tsx`.
- SEO: cada rota com head() próprio.
- Acessibilidade: foco visível, aria-labels nos botões de ícone, contraste AA no dark.

## Fora do escopo (para iterações futuras)

- Backend real / autenticação / RLS
- Persistência de filtros por usuário
- Exportação CSV/PDF
- Notificações em tempo real

Confirma para eu construir?
