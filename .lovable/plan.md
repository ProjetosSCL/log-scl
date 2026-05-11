
# Plano — Migrar dashboard para tema predominantemente branco

## Mudança principal

Inverter a estética de "dark glassmorphism" para "light glassmorphism premium", mantendo:
- verde Stone (#00D959) como accent principal;
- glassmorphism, blur, glow sutil e microinterações;
- todas as cores de criticidade (vermelho/laranja/amarelo/verde) com leve ajuste para contraste em fundo claro;
- toda a estrutura, componentes e dados existentes — só muda o sistema de cores.

## Ajustes em `src/styles.css`

Reescrever os tokens em `:root` para uma paleta light-first em oklch:

- `--background`: branco quase puro com leve verde (`oklch(0.99 0.005 150)`)
- `--foreground`: cinza-grafite escuro (`oklch(0.2 0.02 250)`)
- `--surface` / `--card`: branco translúcido (`oklch(1 0 0 / 0.7)`)
- `--surface-elevated`: branco mais opaco para drawer/modal (`oklch(1 0 0 / 0.85)`)
- `--popover`: branco quase opaco (`oklch(1 0 0 / 0.96)`)
- `--primary`: mantém Stone green `oklch(0.72 0.2 148)` (levemente mais escuro p/ contraste em branco)
- `--primary-foreground`: branco
- `--primary-glow`: verde claro
- `--secondary`: cinza muito claro (`oklch(0.96 0.005 150)`)
- `--muted-foreground`: cinza médio (`oklch(0.5 0.02 250)`)
- `--border`: linha cinza sutil (`oklch(0.85 0.01 150 / 0.6)`)
- Tokens de criticidade ajustados levemente (saturação maior para contrastar com branco):
  - `--status-critical`, `--status-warning`, `--status-attention`, `--status-healthy`
- Sombras: sombras suaves coloridas em vez de pretas pesadas
  - `--shadow-glass: 0 8px 32px oklch(0.5 0.05 150 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.6)`
  - `--shadow-glow: 0 0 30px oklch(0.78 0.21 148 / 0.25)`
  - `--shadow-elevated: 0 20px 50px -20px oklch(0.5 0.05 150 / 0.18)`
- `--gradient-bg`: fundo claro com halos verdes muito sutis
  ```
  radial-gradient(ellipse 80% 60% at 20% 0%, oklch(0.78 0.21 148 / 0.10), transparent 60%),
  radial-gradient(ellipse 60% 50% at 90% 100%, oklch(0.7 0.15 200 / 0.08), transparent 60%),
  oklch(0.985 0.005 150)
  ```
- `--gradient-glass`: branco translúcido sobre branco
  ```
  linear-gradient(135deg, oklch(1 0 0 / 0.55) 0%, oklch(1 0 0 / 0.25) 100%)
  ```
- Scrollbar: thumb cinza claro em vez de branco transparente.
- Grid-bg: linhas cinza muito sutis (`oklch(0.5 0.02 150 / 0.05)`).

Manter os mesmos nomes de variáveis para que nenhum componente precise mudar.

## Ajustes em `src/routes/__root.tsx`

- Remover `className="dark"` do `<html>` (passar a usar light mode por padrão).
- Mantém o resto da estrutura.

## Ajustes pontuais nos componentes (mínimos)

Verificar e ajustar onde houver dependência implícita de fundo escuro:

- **`charts.tsx`**:
  - `tooltipStyle.background` → branco translúcido com borda cinza, texto escuro.
  - `StatusDonut` `Pie.stroke` → branco em vez de verde-escuro do background.
  - Cores das séries: manter (já legíveis em ambos os modos).
- **`PivotTable.tsx`**: header sticky `bg-background/40 backdrop-blur` — funciona em branco também, mas aumentar opacidade para 60–70% para garantir leitura.
- **`OsDrawer.tsx`**: header sticky idem; verificar contraste das badges de criticidade (já usam `/15` opacidade — ok em branco).
- **`AppSidebar.tsx`** e **`AppHeader.tsx`**: classes `glass`/`glass-strong` já refletem os novos tokens, sem mudança necessária.
- **`KpiCard`**: o "glow" colorido no canto continua funcionando; ajustar opacidade do gradient para 45% (em vez de 60%) p/ não estourar em fundo claro.

## Hidratação

Aproveitar para corrigir o erro de hidratação atual no `AppHeader` (relógio renderizando hora diferente entre server e client): inicializar `now`/`lastUpdate` como `null` e só popular após `useEffect`, exibindo `--:--:--` no SSR. Isso elimina o warning de hydration mismatch.

## Resultado esperado

- Visual claro, premium, tipo Linear/Notion/Stripe em modo light, com sotaque verde Stone.
- Cards e sidebar em vidro branco translúcido sobre fundo claro com halos verdes sutis.
- Todo contraste preservado, status de criticidade ainda muito legíveis.
- Zero mudança estrutural — só tokens + 4 ajustes pontuais.

Confirma para aplicar?
