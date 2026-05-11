import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { PivotTable } from "@/components/dashboard/PivotTable";
import { OsDrawer } from "@/components/dashboard/OsDrawer";
import { applyFilters, useDataset, type Filters, type OS } from "@/lib/mock-data";

export const Route = createFileRoute("/tabela-operacional")({
  head: () => ({
    meta: [
      { title: "Tabela Operacional · FieldOps" },
      { name: "description", content: "Visão expandida da matriz de OS por cidade × data." },
      { property: "og:title", content: "Tabela Operacional · FieldOps" },
      { property: "og:description", content: "Visão expandida da matriz de OS por cidade × data." },
    ],
  }),
  component: TabelaOperacionalPage,
});

function TabelaOperacionalPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCity, setDrawerCity] = useState<string | null>(null);
  const [drawerDate, setDrawerDate] = useState<string | null>(null);
  const [drawerItems, setDrawerItems] = useState<OS[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { all } = useDataset();
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);

  const openDrawer = (city: string, dateLabel: string, items: OS[]) => {
    setDrawerCity(city);
    setDrawerDate(dateLabel);
    setDrawerItems(items);
    setSelectedId(items[0]?.id ?? null);
    setDrawerOpen(true);
  };

  const cidades = new Set(filtered.map((o) => o.cidade)).size;

  return (
    <div className="h-[calc(100dvh-7rem)] flex flex-col gap-3 animate-fade-in min-h-0">
      <FiltersBar filters={filters} setFilters={setFilters} />

      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
        <div>
          <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span> OS visíveis ·
          <span className="ml-1 font-semibold text-foreground tabular-nums">{cidades}</span> cidades
        </div>
        <div>Clique em uma célula para abrir o detalhamento</div>
      </div>

      <div className="flex-1 min-h-0">
        <PivotTable filters={filters} onCellClick={openDrawer} fullHeight />
      </div>

      <OsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        city={drawerCity}
        dateLabel={drawerDate}
        items={drawerItems}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />
    </div>
  );
}
