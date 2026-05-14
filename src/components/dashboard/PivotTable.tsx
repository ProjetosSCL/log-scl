import { forwardRef, useEffect, useMemo, useState } from "react";
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
  const [state, setState] = useState<{
    isMobile: boolean;
    isPortrait: boolean;
    isMobileLandscape: boolean;
    width: number;
  }>(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    const h = typeof window !== "undefined" ? window.innerHeight : 768;
    const isMobile = w < 768;
    const isMobileLandscape = h <= 500 && w > h;
    return {
      isMobile: isMobile || isMobileLandscape,
      isPortrait: h > w,
      isMobileLandscape,
      width: w,
    };
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;
      const isMobileLandscape = h <= 500 && w > h;
      setState({
        isMobile: isMobile || isMobileLandscape,
        isPortrait: h > w,
        isMobileLandscape,
        width: w,
      });
    };
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

export const PivotTable = forwardRef<HTMLDivElement, Props>(function PivotTable(
  { filters, onCellClick, fullHeight = false, zoom = 100, compact = false },
  ref,
) {
  const { all, dates: storeDates } = useDataset();
  const data = useMemo(() => applyFilters(all, filters), [all, filters]);
  const { cities, dates, matrix } = useMemo(() => getPivot(data, storeDates), [data, storeDates]);
  const { isMobile, isPortrait, isMobileLandscape, width } = useOrientation();
  const [hintDismissed, setHintDismissed] = useState(false);

  const totalsByCity = cities.map((c) =>
    dates.reduce((acc, d) => acc + (matrix[c]?.[d.label]?.length ?? 0), 0),
  );
  const totalsByDate = dates.map((d) =>
    cities.reduce((acc, c) => acc + (matrix[c]?.[d.label]?.length ?? 0), 0),
  );
  const grandTotal = totalsByCity.reduce((a, b) => a + b, 0);

  // Landscape pair grouping: when in mobile landscape with 4+ dates,
  // group dates into pairs to halve horizontal scroll.
  const pairMode = isMobileLandscape && dates.length >= 4;
  type Group = { dates: typeof dates };
  const dateGroups: Group[] = useMemo(() => {
    if (!pairMode) return dates.map((d) => ({ dates: [d] }));
    const out: Group[] = [];
    for (let i = 0; i < dates.length; i += 2) {
      out.push({ dates: dates.slice(i, i + 2) });
    }
    return out;
  }, [pairMode, dates]);

  const cityMinW = compact
    ? isMobileLandscape ? 156 : 132
    : isMobileLandscape ? 180 : isMobile ? 140 : 180;
  const dateMinWBase = pairMode
    ? compact ? 86 : 96
    : compact
      ? isMobileLandscape ? 52 : 48
      : isMobileLandscape ? 60 : isMobile ? 56 : 64;
  const cityFontPx = compact
    ? isMobileLandscape ? 13 : 13
    : isMobileLandscape ? 14 : isMobile ? 13 : 14;
  const dateMinW = isMobileLandscape && dateGroups.length > 0
    ? Math.max(
        dateMinWBase,
        Math.floor((width - cityMinW - (compact ? 56 : 72) - 16) / dateGroups.length),
      )
    : dateMinWBase;

  const showLandscapeHint = isMobile && isPortrait && !hintDismissed && dates.length > 4;

  return (
    <div
      ref={ref}
      className={cn("rounded-lg glass overflow-hidden flex flex-col", fullHeight && "h-full")}
    >
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
          <thead className="sticky top-0 z-10 bg-background/85 backdrop-blur-md shadow-[0_2px_6px_-3px_oklch(0.4_0.04_150/0.25)]">
            <tr className="border-b border-border">
              <th
                className={cn(
                  "text-left font-semibold text-foreground sticky left-0 bg-muted/80 backdrop-blur z-30 border-r border-border shadow-[2px_0_4px_-2px_oklch(0.4_0.04_150/0.18)]",
                  compact || isMobileLandscape ? "px-2 py-1" : "px-3 py-1.5",
                )}
                style={{ minWidth: cityMinW }}
              >
                Cidade
              </th>
              {dateGroups.map((g, gi) => (
                <th
                  key={gi}
                  className={cn(
                    "font-semibold text-foreground text-center capitalize whitespace-nowrap border-r border-border/40",
                    compact || isMobileLandscape ? "px-1 py-0.5 text-[10px]" : "px-2 py-1.5 text-xs",
                  )}
                  style={{ minWidth: dateMinW }}
                >
                  {pairMode ? (
                    <div className="flex items-stretch divide-x divide-border/40">
                      {g.dates.map((d) => (
                        <div key={d.label} className="flex-1 px-0.5 leading-tight">
                          <div>{d.label}</div>
                          {d.offset === 0 && (
                            <div className="text-primary font-bold text-[8px] leading-none mt-0.5">
                              HOJE
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {g.dates[0].label}
                      {g.dates[0].offset === 0 && (
                        <div className={cn("text-primary font-bold leading-none mt-0.5", compact ? "text-[8px]" : "text-[10px]")}>
                          HOJE
                        </div>
                      )}
                    </>
                  )}
                </th>
              ))}
              <th
                className={cn(
                  "font-bold text-foreground text-center bg-muted/60 sticky right-0 z-20 border-l border-border",
                  compact || isMobileLandscape ? "px-2 py-1 text-xs" : "px-3 py-1.5",
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
                    "sticky left-0 bg-background/90 backdrop-blur z-10 group-hover/row:bg-accent/20 border-r border-border/60 shadow-[2px_0_4px_-2px_oklch(0.4_0.04_150/0.18)]",
                    compact || isMobileLandscape ? "px-2 py-1" : "px-3 py-1.5",
                  )}
                  style={{ minWidth: cityMinW }}
                >
                  <div
                    className="font-semibold uppercase tracking-wide truncate"
                    style={{ fontSize: cityFontPx, maxWidth: cityMinW - 16 }}
                    title={city}
                  >
                    {city}
                  </div>
                </td>
                {dateGroups.map((g, gi) => (
                  <td
                    key={gi}
                    className={cn(
                      "text-center border-r border-border/30",
                      compact || isMobileLandscape ? "px-0.5 py-0.5" : "px-1.5 py-1",
                    )}
                    style={{ minWidth: dateMinW }}
                  >
                    {pairMode ? (
                      <div className="flex items-center justify-center gap-1">
                        {g.dates.map((d) => {
                          const items = matrix[city]?.[d.label] ?? [];
                          const crit = cellCriticality(items);
                          return items.length > 0 ? (
                            <button
                              key={d.label}
                              type="button"
                              onClick={() => onCellClick(city, d.label, items)}
                              className={cn(
                                "rounded-md font-semibold tabular-nums transition-all touch-manipulation",
                                "min-w-[24px] min-h-[22px] px-1 py-0.5 text-[11px]",
                                critClasses[crit],
                                "hover:scale-[1.08] active:scale-95",
                              )}
                              title={`${items.length} OS — ${city} · ${d.label}`}
                            >
                              {items.length}
                            </button>
                          ) : (
                            <span key={d.label} className="text-muted-foreground/30 min-w-[24px]">·</span>
                          );
                        })}
                      </div>
                    ) : (() => {
                      const d = g.dates[0];
                      const items = matrix[city]?.[d.label] ?? [];
                      const crit = cellCriticality(items);
                      return items.length > 0 ? (
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
                      );
                    })()}
                  </td>
                ))}
                <td
                  className={cn(
                    "text-center font-bold tabular-nums bg-muted/30 sticky right-0 z-[5] group-hover/row:bg-accent/30 border-l border-border/40",
                    compact || isMobileLandscape ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
                  )}
                >
                  {totalsByCity[ci]}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 z-10">
            <tr className="border-t-2 border-border bg-muted/80 backdrop-blur">
              <td
                className={cn(
                  "font-bold sticky left-0 bg-muted/85 backdrop-blur z-20 border-r border-border",
                  compact || isMobileLandscape ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm",
                )}
                style={{ minWidth: cityMinW }}
              >
                Total Geral
              </td>
              {dateGroups.map((g, gi) => {
                const total = g.dates.reduce(
                  (acc, d) => acc + (totalsByDate[dates.indexOf(d)] ?? 0),
                  0,
                );
                return (
                  <td
                    key={gi}
                    className={cn(
                      "text-center font-bold tabular-nums text-foreground border-r border-border/40",
                      compact || isMobileLandscape ? "px-1 py-1.5 text-xs" : "px-2 py-2 text-sm",
                    )}
                  >
                    {total}
                  </td>
                );
              })}
              <td
                className={cn(
                  "text-center font-bold tabular-nums text-primary bg-muted/85 sticky right-0 z-20 border-l border-border",
                  compact || isMobileLandscape ? "px-2 py-1.5 text-sm" : "px-3 py-2 text-base",
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
});

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
