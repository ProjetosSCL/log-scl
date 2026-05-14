import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Focus, Maximize2, Minimize2, Rows3 } from "lucide-react";
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
  const [capturing, setCapturing] = useState(false);
  const [zoom, setZoom] = useState<80 | 90 | 100 | 110 | 120>(90);
  const [userZoomed, setUserZoomed] = useState(false);
  const [compact, setCompact] = useState(false);
  const [focusTable, setFocusTable] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const { all } = useDataset();
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);

  // Detect mobile landscape to drive auto-filters and auto-zoom
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobileLandscape(h <= 500 && w > h);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // Auto-zoom to a comfortable level in landscape unless the user touched it
  useEffect(() => {
    if (isMobileLandscape && !userZoomed) {
      setZoom(90);
    }
    if (!isMobileLandscape) {
      setUserZoomed(false);
    }
  }, [isMobileLandscape, userZoomed]);

  const handleZoom = (z: 80 | 90 | 100 | 110 | 120) => {
    setZoom(z);
    setUserZoomed(true);
  };

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

  const handleScreenshot = async () => {
    if (!tableRef.current) return;
    setCapturing(true);
    try {
      const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
      const el = tableRef.current;
      const w = Math.max(el.scrollWidth, el.clientWidth);
      const h = Math.max(el.scrollHeight, el.clientHeight);
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: bg,
        width: w,
        height: h,
        canvasWidth: w,
        canvasHeight: h,
        style: { transform: "none" },
      });
      const link = document.createElement("a");
      const ts = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
      link.download = `tabela-operacional-${ts}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Falha ao gerar imagem", err);
    } finally {
      setCapturing(false);
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
          ? "fixed inset-0 z-50 flex flex-col gap-2 md:gap-3 p-2 md:p-4 bg-background overflow-hidden animate-fade-in"
          : "h-[calc(100dvh-7rem)] flex flex-col gap-2 md:gap-3 animate-fade-in"
      }
    >
      <PortalContainerProvider container={isFullscreen ? containerRef.current : null}>
        {!focusTable && (
          <div className="flex items-stretch md:items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-0 w-full md:w-auto order-1 md:order-none">
              <FiltersBar
                filters={filters}
                setFilters={setFilters}
                dense={isMobileLandscape}
                only={isMobileLandscape ? ["contratante", "prestador", "cidade"] : undefined}
              />
            </div>
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-secondary/50 p-0.5 shrink-0 overflow-x-auto max-w-full">
              {([80, 90, 100, 110, 120] as const).map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => handleZoom(z)}
                  className={
                    "px-2 h-7 md:h-8 rounded-full text-[11px] md:text-xs font-medium transition-colors shrink-0 " +
                    (zoom === z
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40")
                  }
                  title={`Zoom da tabela ${z}%`}
                >
                  {z}%
                </button>
              ))}
            </div>
          </div>
        )}

        {!focusTable && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompact((v) => !v)}
              className={
                "h-8 md:h-9 gap-1.5 rounded-full px-2.5 md:px-3 shrink-0 " +
                (compact
                  ? "border-primary/50 bg-primary/15 text-primary hover:bg-primary/20"
                  : "border-border/60 bg-secondary/50 hover:bg-accent/60")
              }
              title="Modo compacto: reduz o tamanho dos elementos"
              aria-pressed={compact}
            >
              <Rows3 className="h-3.5 w-3.5" />
              <span className="text-[11px] md:text-xs">Compacto</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFocusTable(true)}
              className="h-8 md:h-9 gap-1.5 rounded-full border-border/60 bg-secondary/50 hover:bg-accent/60 px-2.5 md:px-3 shrink-0"
              title="Foco na tabela: oculta filtros e barra superior"
            >
              <Focus className="h-3.5 w-3.5" />
              <span className="text-[11px] md:text-xs">Foco</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScreenshot}
              disabled={capturing}
              className="h-8 md:h-9 gap-1.5 rounded-full border-border/60 bg-secondary/50 hover:bg-accent/60 px-2.5 md:px-3 shrink-0"
              title="Baixar print da tabela (PNG)"
            >
              <Camera className="h-3.5 w-3.5" />
              <span className="text-[11px] md:text-xs">{capturing ? "…" : "Print"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 md:h-9 gap-1.5 rounded-full border-border/60 bg-secondary/50 hover:bg-accent/60 px-2.5 md:px-3 shrink-0"
              title={isFullscreen ? "Sair da tela cheia (F)" : "Tela cheia (F)"}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="text-[11px] md:text-xs">{isFullscreen ? "Sair" : "Tela cheia"}</span>
            </Button>
            <div className="ml-auto text-[11px] text-muted-foreground tabular-nums">
              <span className="font-semibold text-foreground">{filtered.length}</span> OS ·
              <span className="ml-1 font-semibold text-foreground">{cidades}</span> cidades
            </div>
          </div>
        )}

        {focusTable && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <FiltersBar
                filters={filters}
                setFilters={setFilters}
                only={["contratante", "prestador", "cidade"]}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-[11px] text-muted-foreground tabular-nums">
                <span className="font-semibold text-foreground">{filtered.length}</span> OS ·
                <span className="ml-1 font-semibold text-foreground">{cidades}</span> cidades
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFocusTable(false)}
                className="h-8 md:h-9 gap-1.5 rounded-full border-primary/50 bg-primary/15 text-primary hover:bg-primary/20 px-2.5 md:px-3"
                title="Sair do modo foco"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="text-[11px] md:text-xs">Sair do foco</span>
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0">
          <PivotTable
            ref={tableRef}
            filters={filters}
            onCellClick={openDrawer}
            fullHeight
            zoom={zoom}
            compact={compact}
          />
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
