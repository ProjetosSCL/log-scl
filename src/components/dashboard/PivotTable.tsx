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
    <div className={cn("rounded-xl glass overflow-hidden flex flex-col", fullHeight && "h-full")}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
        <div>
          <div className="text-xs font-semibold leading-tight">Tabela operacional</div>
          <div className="text-[10px] text-muted-foreground leading-tight">
            Volume de OS por cidade × data · clique para detalhes
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <Legend color="status-critical" label="Vencido" />
          <Legend color="status-warning" label="Vence hoje" />
          <Legend color="status-attention" label="Próximo" />
          <Legend color="status-healthy" label="Saudável" />
        </div>
      </div>

      <div className={cn("overflow-auto", fullHeight ? "flex-1 min-h-0" : "max-h-[520px]")}>
        <table className="w-full text-xs table-fixed">
          <thead className="sticky top-0 z-10 backdrop-blur bg-background/40">
            <tr>
              <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sticky left-0 bg-background/60 backdrop-blur z-20 w-[120px]">
                Cidade
              </th>
              {dates.map((d) => (
                <th
                  key={d.label}
                  className="font-medium px-1 py-1.5 text-muted-foreground text-center capitalize text-[10px]"
                >
                  {d.label}
                  {d.offset === 0 && (
                    <div className="text-[8px] text-primary font-semibold leading-none">
                      HOJE
                    </div>
                  )}
                </th>
              ))}
              <th className="font-medium px-2 py-1.5 text-foreground text-center w-[52px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city, ci) => (
              <tr
                key={city}
                className="group/row border-t border-border/40 hover:bg-accent/20 transition-colors"
              >
                <td className="px-2 py-0.5 sticky left-0 bg-background/40 backdrop-blur z-10 group-hover/row:bg-accent/20 truncate">
                  <div className="font-medium truncate text-xs" title={city}>{city}</div>
                </td>
                {dates.map((d) => {
                  const items = matrix[city]?.[d.label] ?? [];
                  const crit = cellCriticality(items);
                  return (
                    <td key={d.label} className="px-0.5 py-0.5 text-center">
                      {items.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => onCellClick(city, d.label, items)}
                          className={cn(
                            "w-full min-w-[28px] px-1 py-0.5 rounded-md font-semibold tabular-nums transition-all text-xs",
                            critClasses[crit],
                            "hover:scale-[1.06]",
                          )}
                          title={`${items.length} OS — ${city} · ${d.label}`}
                        >
                          {items.length}
                        </button>
                      ) : (
                        <span className="text-muted-foreground/40">·</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-0.5 text-center font-semibold tabular-nums text-xs">
                  {totalsByCity[ci]}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 z-10">
            <tr className="border-t border-border/60 bg-background/80 backdrop-blur">
              <td className="px-2 py-1.5 font-semibold sticky left-0 bg-background/90 backdrop-blur z-10 text-xs">
                Total
              </td>
              {totalsByDate.map((t, i) => (
                <td
                  key={i}
                  className="px-1 py-1.5 text-center font-semibold tabular-nums text-foreground/90 text-xs"
                >
                  {t}
                </td>
              ))}
              <td className="px-2 py-1.5 text-center font-bold tabular-nums text-primary text-xs">
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
