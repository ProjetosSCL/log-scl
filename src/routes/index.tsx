import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertOctagon,
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  Flame,
  Focus,
  Gauge,
  ListChecks,
  MapPin,
  Minimize2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { KpiCard } from "@/components/dashboard/KpiCard";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { PivotTable } from "@/components/dashboard/PivotTable";
import { OsDrawer } from "@/components/dashboard/OsDrawer";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import {
  DueByDayLine,
  OsByCityBar,
  RankingList,
  StatusDonut,
} from "@/components/dashboard/charts";
import {
  applyFilters,
  type Filters,
  getDueByDay,
  getInsights,
  getKpis,
  getOsByCity,
  getRanking,
  getStatusDistribution,
  useDataset,
  type OS,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · FieldOps" },
      {
        name: "description",
        content:
          "Visão consolidada de OS, SLA, criticidade e performance operacional do dia.",
      },
      { property: "og:title", content: "Dashboard · FieldOps" },
      {
        property: "og:description",
        content: "Central operacional para reuniões diárias de field service.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCity, setDrawerCity] = useState<string | null>(null);
  const [drawerDate, setDrawerDate] = useState<string | null>(null);
  const [drawerItems, setDrawerItems] = useState<OS[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusTable, setFocusTable] = useState(false);

  const { all } = useDataset();
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);
  const kpis = useMemo(() => getKpis(filtered), [filtered]);
  const insights = useMemo(() => getInsights(filtered), [filtered]);
  const byCity = useMemo(() => getOsByCity(filtered), [filtered]);
  const dueByDay = useMemo(() => getDueByDay(filtered), [filtered]);
  const statusDist = useMemo(() => getStatusDistribution(filtered), [filtered]);
  const rankPrest = useMemo(() => getRanking(filtered, "prestador"), [filtered]);
  const rankCidade = useMemo(() => getRanking(filtered, "cidade"), [filtered]);
  const rankTec = useMemo(() => getRanking(filtered, "tecnico"), [filtered]);

  const openDrawer = (city: string, dateLabel: string, items: OS[]) => {
    setDrawerCity(city);
    setDrawerDate(dateLabel);
    setDrawerItems(items);
    setSelectedId(items[0]?.id ?? null);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        {!focusTable && (
          <div className="flex-1 min-w-0">
            <FiltersBar filters={filters} setFilters={setFilters} />
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFocusTable((v) => !v)}
          className={
            "h-9 gap-1.5 rounded-full px-3 shrink-0 ml-auto " +
            (focusTable
              ? "border-primary/50 bg-primary/15 text-primary hover:bg-primary/20"
              : "border-border/60 bg-secondary/50 hover:bg-accent/60")
          }
          title="Foco na tabela: recolhe filtros e painéis laterais"
          aria-pressed={focusTable}
        >
          {focusTable ? <Minimize2 className="h-3.5 w-3.5" /> : <Focus className="h-3.5 w-3.5" />}
          <span className="text-xs">{focusTable ? "Sair do foco" : "Foco na tabela"}</span>
        </Button>
      </div>

      {/* KPIs */}
      {!focusTable && (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total de OS"
          value={kpis.total.toLocaleString("pt-BR")}
          delta={3.2}
          icon={ListChecks}
          tone="primary"
          hint="Janela de 7 dias"
        />
        <KpiCard
          label="OS vencidas"
          value={kpis.vencidas}
          delta={-1.4}
          icon={AlertOctagon}
          tone="critical"
          invertDelta
          hint="Ação imediata"
        />
        <KpiCard
          label="Vence hoje"
          value={kpis.venceHoje}
          delta={2.1}
          icon={CalendarClock}
          tone="warning"
          invertDelta
          hint="Prioridade do dia"
        />
        <KpiCard
          label="OS da semana"
          value={kpis.semana.toLocaleString("pt-BR")}
          delta={4.8}
          icon={CalendarDays}
          tone="primary"
          hint="Total semanal"
        />
        <KpiCard
          label="SLA"
          value={`${kpis.slaPct}%`}
          delta={1.2}
          icon={Gauge}
          tone="primary"
          hint="Alvo: 85%"
        />
        <KpiCard
          label="Emergenciais"
          value={kpis.emergencial}
          delta={0.7}
          icon={Flame}
          tone="critical"
          invertDelta
          hint="Pendentes"
        />
        <KpiCard
          label="Prestador crítico"
          value={kpis.prestadorCritico}
          icon={Users}
          tone="warning"
          hint="Maior backlog"
        />
        <KpiCard
          label="Cidade crítica"
          value={kpis.cidadeCritica}
          icon={MapPin}
          tone="warning"
          hint="Foco operacional"
        />
      </div>
      )}

      {/* Main grid */}
      <div className={focusTable ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3"}>
        <div className="space-y-3 min-w-0">
          <PivotTable filters={filters} onCellClick={openDrawer} />

          {!focusTable && (<>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <OsByCityBar data={byCity} />
            <DueByDayLine data={dueByDay} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <StatusDonut data={statusDist} />
            <RankingList
              title="Ranking de prestadores"
              subtitle="Críticas / Total"
              data={rankPrest}
            />
            <RankingList
              title="Ranking de cidades"
              subtitle="Pressão operacional"
              data={rankCidade}
            />
          </div>

          <RankingList
            title="Técnicos com mais OS"
            subtitle="Distribuição de carga"
            data={rankTec}
          />
        </div>

        <div className="space-y-3">
          <InsightsPanel insights={insights} />
          <div className="rounded-2xl glass p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Status do turno
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full bg-primary/15 grid place-items-center">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-status-warning animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {kpis.vencidas + kpis.venceHoje} ações prioritárias
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Distribuídas em {new Set(filtered.map((o) => o.cidade)).size} cidades
                </div>
              </div>
            </div>
          </div>
        </div>
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
