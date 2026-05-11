import { useMemo } from "react";
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
}

export function PivotTable({ filters, onCellClick, fullHeight = false }: Props) {
  const { all, dates: storeDates } = useDataset();
  const data = useMemo(() => applyFilters(all, filters), [all, filters]);
  const { cities, dates, matrix } = useMemo(() => getPivot(data, storeDates), [data, storeDates]);

  const totalsByCity = cities.map((c) =>
    dates.reduce((acc, d) => acc + (matrix[c]?.[d.label]?.length ?? 0), 0),
  );
  const totalsByDate = dates.map((d) =>
    cities.reduce((acc, c) => acc + (matrix[c]?.[d.label]?.length ?? 0), 0),
  );
  const grandTotal = totalsByCity.reduce((a, b) => a + b, 0);

  return (
    <div className={cn("rounded-lg glass overflow-hidden flex flex-col", fullHeight && "h-full")}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
        <div>
          <div className="text-sm font-semibold leading-tight">Tabela operacional</div>
          <div className="text-xs text-muted-foreground leading-tight mt-0.5">
            Volume de OS por cidade × data · clique para detalhes
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Legend color="status-critical" label="Vencido" />
          <Legend color="status-warning" label="Vence hoje" />
          <Legend color="status-attention" label="Próximo" />
          <Legend color="status-healthy" label="Saudável" />
        </div>
      </div>

      <div className={cn("overflow-auto", fullHeight ? "flex-1 min-h-0" : "max-h-[520px]")}>
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/40 backdrop-blur">
            <tr className="border-b border-border">
              <th className="text-left font-semibold px-3 py-2 text-foreground sticky left-0 bg-muted/60 backdrop-blur z-20 min-w-[180px] border-r border-border">
                Cidade
              </th>
              {dates.map((d) => (
                <th
                  key={d.label}
                  className="font-semibold px-2 py-2 text-foreground text-center capitalize text-xs whitespace-nowrap border-r border-border/40"
                >
                  {d.label}
                  {d.offset === 0 && (
                    <div className="text-[10px] text-primary font-bold leading-none mt-0.5">
                      HOJE
                    </div>
                  )}
                </th>
              ))}
              <th className="font-bold px-3 py-2 text-foreground text-center min-w-[70px] bg-muted/60">
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
                <td className="px-3 py-1.5 sticky left-0 bg-background/80 backdrop-blur z-10 group-hover/row:bg-accent/20 border-r border-border/60">
                  <div className="font-medium text-sm truncate" title={city}>{city}</div>
                </td>
                {dates.map((d) => {
                  const items = matrix[city]?.[d.label] ?? [];
                  const crit = cellCriticality(items);
                  return (
                    <td key={d.label} className="px-1.5 py-1.5 text-center border-r border-border/30">
                      {items.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => onCellClick(city, d.label, items)}
                          className={cn(
                            "min-w-[34px] px-2 py-1 rounded-md font-semibold tabular-nums transition-all text-sm",
                            critClasses[crit],
                            "hover:scale-[1.08]",
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
                <td className="px-3 py-1.5 text-center font-bold tabular-nums text-sm bg-muted/30">
                  {totalsByCity[ci]}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 z-10">
            <tr className="border-t-2 border-border bg-muted/60 backdrop-blur">
              <td className="px-3 py-2 font-bold sticky left-0 bg-muted/80 backdrop-blur z-10 text-sm border-r border-border">
                Total Geral
              </td>
              {totalsByDate.map((t, i) => (
                <td
                  key={i}
                  className="px-2 py-2 text-center font-bold tabular-nums text-foreground text-sm border-r border-border/40"
                >
                  {t}
                </td>
              ))}
              <td className="px-3 py-2 text-center font-bold tabular-nums text-primary text-base bg-muted/80">
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
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: `var(--${color})`, boxShadow: `0 0 8px var(--${color})` }}
      />
      {label}
    </div>
  );
}
