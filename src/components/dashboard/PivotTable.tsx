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
    <div className="rounded-2xl glass overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <div>
          <div className="text-sm font-semibold">Tabela operacional</div>
          <div className="text-[11px] text-muted-foreground">
            Volume de OS por cidade × data · clique em uma célula para detalhes
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <Legend color="status-critical" label="Vencido" />
          <Legend color="status-warning" label="Vence hoje" />
          <Legend color="status-attention" label="Próximo" />
          <Legend color="status-healthy" label="Saudável" />
        </div>
      </div>

      <div className="overflow-auto max-h-[520px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 backdrop-blur bg-background/40">
            <tr>
              <th className="text-left font-medium px-4 py-3 text-muted-foreground sticky left-0 bg-background/60 backdrop-blur z-20">
                Cidade
              </th>
              {dates.map((d) => (
                <th
                  key={d.label}
                  className="font-medium px-3 py-3 text-muted-foreground text-center min-w-[88px] capitalize"
                >
                  {d.label}
                  {d.offset === 0 && (
                    <div className="text-[9px] text-primary mt-0.5 font-semibold">
                      HOJE
                    </div>
                  )}
                </th>
              ))}
              <th className="font-medium px-4 py-3 text-foreground text-center">
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
                <td className="px-4 py-2.5 sticky left-0 bg-background/40 backdrop-blur z-10 group-hover/row:bg-accent/20">
                  <div className="font-medium">{city}</div>
                </td>
                {dates.map((d) => {
                  const items = matrix[city]?.[d.label] ?? [];
                  const crit = cellCriticality(items);
                  return (
                    <td key={d.label} className="px-2 py-2 text-center">
                      {items.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => onCellClick(city, d.label, items)}
                          className={cn(
                            "min-w-[52px] px-3 py-1.5 rounded-lg font-semibold tabular-nums transition-all",
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
                <td className="px-4 py-2.5 text-center font-semibold tabular-nums">
                  {totalsByCity[ci]}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border/60 bg-secondary/30">
              <td className="px-4 py-3 font-semibold sticky left-0 bg-secondary/60 backdrop-blur">
                Total
              </td>
              {totalsByDate.map((t, i) => (
                <td
                  key={i}
                  className="px-2 py-3 text-center font-semibold tabular-nums text-foreground/90"
                >
                  {t}
                </td>
              ))}
              <td className="px-4 py-3 text-center font-bold tabular-nums text-primary">
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
