import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Maximize2, Minimize2 } from "lucide-react";
import { toPng } from "html-to-image";

import { Button } from "@/components/ui/button";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { PivotTable } from "@/components/dashboard/PivotTable";
import { OsDrawer } from "@/components/dashboard/OsDrawer";
import { applyFilters, useDataset, type Filters, type OS } from "@/lib/mock-data";
import { PortalContainerProvider } from "@/lib/portal-container";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setIsFullscreen((v) => !v);
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col gap-3 p-4 bg-background overflow-hidden animate-fade-in"
          : "h-[calc(100dvh-7rem)] flex flex-col gap-3 animate-fade-in min-h-0"
      }
    >
      <PortalContainerProvider container={isFullscreen ? containerRef.current : null}>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <FiltersBar filters={filters} setFilters={setFilters} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-9 gap-1.5 rounded-full border-border/60 bg-secondary/50 hover:bg-accent/60 px-3 shrink-0"
            title={isFullscreen ? "Sair da tela cheia (F)" : "Tela cheia (F)"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span className="text-xs">{isFullscreen ? "Sair" : "Tela cheia"}</span>
          </Button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <div>
            <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span> OS visíveis ·
            <span className="ml-1 font-semibold text-foreground tabular-nums">{cidades}</span> cidades
          </div>
          <div>Pressione <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-secondary/40 font-mono text-[10px]">F</kbd> para alternar tela cheia · clique em uma célula para detalhes</div>
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
      </PortalContainerProvider>
    </div>
  );
}
