import { useEffect, useMemo, useState } from "react";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Criticality,
  type OS,
  cellCriticality,
  type Filters,
  applyFilters,
  useDataset,
  getPivot,
} from "@/lib/mock-data";

const critClasses: Record<Criticality, string> = {
  vencido:
    "bg-status-critical/15 text-status-critical hover:bg-status-critical/25 ring-1 ring-status-critical/30",
  vence_hoje:
    "bg-status-warning/15 text-status-warning hover:bg-status-warning/25 ring-1 ring-status-warning/30",
  proximo:
    "bg-status-attention/15 text-status-attention hover:bg-status-attention/25 ring-1 ring-status-attention/30",
  saudavel:
    "bg-status-healthy/10 text-status-healthy hover:bg-status-healthy/20 ring-1 ring-status-healthy/25",
};

interface Props {
  filters: Filters;
  onCellClick: (city: string, dateLabel: string, items: OS[]) => void;
  fullHeight?: boolean;
  zoom?: number;
  compact?: boolean;
}

function useOrientation() {
  const [state, setState] = useState<{ isMobile: boolean; isPortrait: boolean }>(() => ({
    isMobile: typeof window !== "undefined" && window.innerWidth < 768,
    isPortrait: typeof window !== "undefined" && window.innerHeight > window.innerWidth,
  }));
  useEffect(() => {
    const update = () =>
      setState({
        isMobile: window.innerWidth < 768,
        isPortrait: window.innerHeight > window.innerWidth,
      });
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return state;
}

export function PivotTable({ filters, onCellClick, fullHeight = false, zoom = 100, compact = false }: Props) {
  const { all, dates: storeDates } = useDataset();
  const data = useMemo(() => applyFilters(all, filters), [all, filters]);
  const { cities, dates, matrix } = useMemo(() => getPivot(data, storeDates), [data, storeDates]);
  const { isMobile, isPortrait } = useOrientation();
  const [hintDismissed, setHintDismissed] = useState(false);

  const totalsByCity = cities.map((c) =>
    dates.reduce((acc, d) => acc + (matrix[c]?.[d.label]?.length ?? 0), 0),
  );
  const totalsByDate = dates.map((d) =>
    cities.reduce((acc, c) => acc + (matrix[c]?.[d.label]?.length ?? 0), 0),
  );
  const grandTotal = totalsByCity.reduce((a, b) => a + b, 0);

  // Responsive sizing — never let city names get illegible
  const cityMinW = compact ? 132 : isMobile ? 140 : 180;
  const dateMinW = compact ? 48 : isMobile ? 56 : 64;
  const cityFontPx = compact ? 13 : isMobile ? 13 : 14;

  const showLandscapeHint = isMobile && isPortrait && !hintDismissed && dates.length > 4;

  return (
    <div className={cn("rounded-lg glass overflow-hidden flex flex-col", fullHeight && "h-full")}>
      <div className="flex items-center justify-between gap-2 px-3 md:px-4 py-2 md:py-2.5 border-b border-border/60 flex-wrap">
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-tight">Tabela operacional</div>
          <div className="text-[11px] md:text-xs text-muted-foreground leading-tight mt-0.5">
            Volume de OS por cidade × data · clique para detalhes
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs flex-wrap">
          <Legend color="status-critical" label="Vencido" />
          <Legend color="status-warning" label="Vence hoje" />
          <Legend color="status-attention" label="Próximo" />
          <Legend color="status-healthy" label="Saudável" />
        </div>
      </div>

      {showLandscapeHint && (
        <button
          type="button"
          onClick={() => setHintDismissed(true)}
          className="flex items-center justify-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[11px] font-medium border-b border-primary/20 hover:bg-primary/15 transition-colors"
        >
          <RotateCw className="h-3 w-3" />
          Gire o celular para ver melhor a tabela · toque para ocultar
        </button>
      )}

      <div
        className={cn(
          "overflow-auto overscroll-contain",
          fullHeight ? "flex-1 min-h-0" : "max-h-[520px]",
        )}
        style={{ fontSize: `${zoom}%`, WebkitOverflowScrolling: "touch" }}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/40 backdrop-blur">
            <tr className="border-b border-border">
              <th
                className={cn(
                  "text-left font-semibold text-foreground sticky left-0 bg-muted/70 backdrop-blur z-20 border-r border-border shadow-[2px_0_4px_-2px_hsl(var(--background)/0.5)]",
                  compact ? "px-2 py-1" : "px-3 py-1.5",
                )}
                style={{ minWidth: cityMinW }}
              >
                Cidade
              </th>
              {dates.map((d) => (
                <th
                  key={d.label}
                  className={cn(
                    "font-semibold text-foreground text-center capitalize whitespace-nowrap border-r border-border/40",
                    compact ? "px-1 py-1 text-[10px]" : "px-2 py-1.5 text-xs",
                  )}
                  style={{ minWidth: dateMinW }}
                >
                  {d.label}
                  {d.offset === 0 && (
                    <div className={cn("text-primary font-bold leading-none mt-0.5", compact ? "text-[8px]" : "text-[10px]")}>
                      HOJE
                    </div>
                  )}
                </th>
              ))}
              <th
                className={cn(
                  "font-bold text-foreground text-center bg-muted/60 sticky right-0 z-10 border-l border-border",
                  compact ? "px-2 py-1 text-xs" : "px-3 py-1.5",
                )}
                style={{ minWidth: compact ? 48 : 64 }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city, ci) => (
              <tr
                key={city}
                className="group/row border-b border-border/40 hover:bg-accent/20 transition-colors"
              >
                <td
                  className={cn(
                    "sticky left-0 bg-background/90 backdrop-blur z-10 group-hover/row:bg-accent/20 border-r border-border/60 shadow-[2px_0_4px_-2px_hsl(var(--background)/0.5)]",
                    compact ? "px-2 py-1" : "px-3 py-1.5",
                  )}
                  style={{ minWidth: cityMinW }}
                >
                  <div
                    className="font-medium truncate"
                    style={{ fontSize: cityFontPx, maxWidth: cityMinW - 16 }}
                    title={city}
                  >
                    {city}
                  </div>
                </td>
                {dates.map((d) => {
                  const items = matrix[city]?.[d.label] ?? [];
                  const crit = cellCriticality(items);
                  return (
                    <td
                      key={d.label}
                      className={cn(
                        "text-center border-r border-border/30",
                        compact ? "px-0.5 py-0.5" : "px-1.5 py-1",
                      )}
                      style={{ minWidth: dateMinW }}
                    >
                      {items.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => onCellClick(city, d.label, items)}
                          className={cn(
                            "rounded-md font-semibold tabular-nums transition-all touch-manipulation",
                            compact
                              ? "min-w-[26px] min-h-[24px] px-1.5 py-0.5 text-[11px]"
                              : "min-w-[34px] min-h-[28px] px-2 py-0.5 text-sm",
                            critClasses[crit],
                            "hover:scale-[1.08] active:scale-95",
                          )}
                          title={`${items.length} OS — ${city} · ${d.label}`}
                        >
                          {items.length}
                        </button>
                      ) : (
                        <span className="text-muted-foreground/30">·</span>
                      )}
                    </td>
                  );
                })}
                <td
                  className={cn(
                    "text-center font-bold tabular-nums bg-muted/30 sticky right-0 z-[5] group-hover/row:bg-accent/30 border-l border-border/40",
                    compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
                  )}
                >
                  {totalsByCity[ci]}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 z-10">
            <tr className="border-t-2 border-border bg-muted/70 backdrop-blur">
              <td
                className={cn(
                  "font-bold sticky left-0 bg-muted/80 backdrop-blur z-10 border-r border-border",
                  compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm",
                )}
                style={{ minWidth: cityMinW }}
              >
                Total Geral
              </td>
              {totalsByDate.map((t, i) => (
                <td
                  key={i}
                  className={cn(
                    "text-center font-bold tabular-nums text-foreground border-r border-border/40",
                    compact ? "px-1 py-1.5 text-xs" : "px-2 py-2 text-sm",
                  )}
                >
                  {t}
                </td>
              ))}
              <td
                className={cn(
                  "text-center font-bold tabular-nums text-primary bg-muted/80 sticky right-0 z-10 border-l border-border",
                  compact ? "px-2 py-1.5 text-sm" : "px-3 py-2 text-base",
                )}
              >
                {grandTotal}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: `var(--${color})`, boxShadow: `0 0 8px var(--${color})` }}
      />
      {label}
    </div>
  );
}
