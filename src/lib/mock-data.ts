// Operational data layer — initial seed from src/data/os-data.json,
// can be overridden at runtime via CSV import (persisted to localStorage).

import { useSyncExternalStore } from "react";
import seed from "@/data/os-data.json";

export type Status = string;
export type Criticality = "vencido" | "vence_hoje" | "proximo" | "saudavel";

export interface OS {
  id: string;
  numero: string;
  cliente: string;
  modelo: string;
  tipoEquipamento: string;
  servico: string;
  grupoServico: string;
  endereco: string;
  cidade: string;
  estado: string;
  regiao: string;
  regiaoCode: string;
  tecnico: string;
  contratante: string;
  prestador: string;
  sla: number;
  criticidade: Criticality;
  status: Status;
  emergencial: boolean;
  agendamento: boolean;
  observacoes: string;
  dataLimite: string;
  dataAtendimento?: string;
  dataAbertura: string;
  timeline: { ts: string; label: string; by: string }[];
}

interface RawRow {
  numero: string;
  status: string;
  contratante: string;
  cliente: string;
  modelo: string;
  tipoEquipamento: string;
  servico: string;
  grupoServico: string;
  endereco: string;
  cidade: string;
  estado: string;
  regiao: string;
  regiaoCode: string;
  tecnico: string;
  prestador: string;
  emergencial: boolean;
  agendamento: boolean;
  observacoes: string;
  dataAbertura: string | null;
  dataLimite: string | null;
  dataAtendimento: string | null;
  dataModificacao: string | null;
}

// ---------- Reference "today" ----------
// The dataset's window is May 11–18, 2026. We anchor "today" to the
// most recent "Data Abertura" so criticidade buckets stay meaningful.
const REF_TODAY: Date = (() => {
  const aberturas = (raw as RawRow[])
    .map((r) => (r.dataAbertura ? new Date(r.dataAbertura).getTime() : 0))
    .filter((t) => t > 0);
  const max = Math.max(...aberturas);
  const d = new Date(max);
  d.setHours(0, 0, 0, 0);
  return d;
})();

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dayDiff(a: Date, b: Date) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000);
}

function fmtBR(d: Date) {
  return d
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");
}

function classifyCriticality(limit: Date, status: string): Criticality {
  if (status === "CONCLUIDA" || status === "CONCLUÍDA" || status === "FINALIZADA")
    return "saudavel";
  const diff = dayDiff(limit, REF_TODAY);
  if (diff < 0) return "vencido";
  if (diff === 0) return "vence_hoje";
  if (diff <= 2) return "proximo";
  return "saudavel";
}

function slaFromCrit(c: Criticality, limit: Date, abertura: Date) {
  const total = Math.max(1, dayDiff(limit, abertura));
  const used = Math.max(0, dayDiff(REF_TODAY, abertura));
  const remaining = Math.max(0, 100 - Math.round((used / total) * 100));
  if (c === "vencido") return Math.min(20, remaining);
  if (c === "vence_hoje") return Math.max(25, Math.min(45, remaining));
  if (c === "proximo") return Math.max(50, Math.min(75, remaining));
  return Math.max(80, Math.min(100, remaining));
}

// ---------- Build the 7-day window (centered on REF_TODAY) ----------
export const DATES: { iso: string; label: string; offset: number }[] = (() => {
  const arr: { iso: string; label: string; offset: number }[] = [];
  for (let i = -1; i <= 5; i++) {
    const d = new Date(REF_TODAY);
    d.setDate(d.getDate() + i);
    arr.push({ iso: d.toISOString(), label: fmtBR(d), offset: i });
  }
  return arr;
})();

// ---------- Normalize the dataset ----------
export const ALL_OS: OS[] = (raw as RawRow[]).map((r) => {
  const abertura = r.dataAbertura ? new Date(r.dataAbertura) : new Date(REF_TODAY);
  const limite = r.dataLimite ? new Date(r.dataLimite) : new Date(REF_TODAY);
  const crit = classifyCriticality(limite, r.status);
  const sla = slaFromCrit(crit, limite, abertura);

  const timeline: OS["timeline"] = [
    { ts: abertura.toISOString(), label: "OS aberta", by: "Sistema" },
  ];
  if (r.dataModificacao) {
    timeline.push({
      ts: r.dataModificacao,
      label: `Status atualizado: ${r.status}`,
      by: r.prestador || "Operação",
    });
  }
  if (r.dataAtendimento) {
    timeline.push({
      ts: r.dataAtendimento,
      label: "Atendimento realizado",
      by: r.tecnico || "Técnico",
    });
  }

  return {
    id: r.numero,
    numero: r.numero,
    cliente: r.cliente,
    modelo: r.modelo,
    tipoEquipamento: r.tipoEquipamento,
    servico: r.servico,
    grupoServico: r.grupoServico,
    endereco: r.endereco || `${r.cidade} · ${r.estado}`,
    cidade: r.cidade,
    estado: r.estado,
    regiao: r.regiao,
    regiaoCode: r.regiaoCode,
    tecnico: r.tecnico,
    contratante: r.contratante,
    prestador: r.prestador,
    sla,
    criticidade: crit,
    status: r.status,
    emergencial: r.emergencial,
    agendamento: r.agendamento,
    observacoes: r.observacoes || "Sem observações registradas.",
    dataLimite: limite.toISOString(),
    dataAtendimento: r.dataAtendimento ?? undefined,
    dataAbertura: abertura.toISOString(),
    timeline,
  };
});

// ---------- Filters ----------
export interface Filters {
  contratante?: string[];
  prestador?: string[];
  cidade?: string[];
  estado?: string[];
  regiao?: string[];
  tecnico?: string[];
  criticidade?: Criticality[];
  status?: Status[];
  emergencial?: boolean | null;
}

export function applyFilters(data: OS[], f: Filters): OS[] {
  return data.filter((o) => {
    if (f.contratante?.length && !f.contratante.includes(o.contratante)) return false;
    if (f.prestador?.length && !f.prestador.includes(o.prestador)) return false;
    if (f.cidade?.length && !f.cidade.includes(o.cidade)) return false;
    if (f.estado?.length && !f.estado.includes(o.estado)) return false;
    if (f.regiao?.length && !f.regiao.includes(o.regiao)) return false;
    if (f.tecnico?.length && !f.tecnico.includes(o.tecnico)) return false;
    if (f.criticidade?.length && !f.criticidade.includes(o.criticidade)) return false;
    if (f.status?.length && !f.status.includes(o.status)) return false;
    if (f.emergencial === true && !o.emergencial) return false;
    return true;
  });
}

// ---------- Aggregations ----------
export function getKpis(data: OS[]) {
  const total = data.length;
  const vencidas = data.filter((o) => o.criticidade === "vencido").length;
  const venceHoje = data.filter((o) => o.criticidade === "vence_hoje").length;
  const semana = data.length;
  const slaPct =
    Math.round((data.filter((o) => o.sla >= 70).length / Math.max(1, total)) * 1000) / 10;
  const emergencial = data.filter((o) => o.emergencial).length;

  const byPrest = new Map<string, number>();
  data
    .filter((o) => o.criticidade === "vencido" || o.criticidade === "vence_hoje")
    .forEach((o) => byPrest.set(o.prestador, (byPrest.get(o.prestador) || 0) + 1));
  const prestadorCritico =
    [...byPrest.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const byCity = new Map<string, number>();
  data
    .filter((o) => o.criticidade === "vencido" || o.criticidade === "vence_hoje")
    .forEach((o) => byCity.set(o.cidade, (byCity.get(o.cidade) || 0) + 1));
  const cidadeCritica = [...byCity.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return {
    total,
    vencidas,
    venceHoje,
    semana,
    slaPct,
    emergencial,
    prestadorCritico,
    cidadeCritica,
  };
}

export function getPivot(data: OS[]) {
  // Build the full set of cities present in the filtered data, sorted by total volume desc.
  const totals = new Map<string, number>();
  data.forEach((o) => totals.set(o.cidade, (totals.get(o.cidade) || 0) + 1));
  const cities = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);

  const dates = DATES;
  const matrix: Record<string, Record<string, OS[]>> = {};
  for (const c of cities) {
    matrix[c] = {};
    for (const d of dates) matrix[c][d.label] = [];
  }
  for (const o of data) {
    const lbl = fmtBR(new Date(o.dataLimite));
    if (!matrix[o.cidade]) {
      matrix[o.cidade] = {};
      for (const d of dates) matrix[o.cidade][d.label] = [];
    }
    if (!matrix[o.cidade][lbl]) matrix[o.cidade][lbl] = [];
    matrix[o.cidade][lbl].push(o);
  }
  return { cities, dates, matrix };
}

export function cellCriticality(items: OS[]): Criticality {
  if (!items.length) return "saudavel";
  if (items.some((i) => i.criticidade === "vencido")) return "vencido";
  if (items.some((i) => i.criticidade === "vence_hoje")) return "vence_hoje";
  if (items.some((i) => i.criticidade === "proximo")) return "proximo";
  return "saudavel";
}

export function getInsights(data: OS[]) {
  const k = getKpis(data);
  const byRegion = new Map<string, number>();
  data.forEach((o) => byRegion.set(o.regiao, (byRegion.get(o.regiao) || 0) + 1));
  const topRegion = [...byRegion.entries()].sort((a, b) => b[1] - a[1])[0];

  const byTec = new Map<string, number>();
  data
    .filter((o) => o.tecnico && o.tecnico !== "Não Atribuído" && o.tecnico !== "Não atribuído")
    .forEach((o) => byTec.set(o.tecnico, (byTec.get(o.tecnico) || 0) + 1));
  const topTec = [...byTec.entries()].sort((a, b) => b[1] - a[1])[0];

  const semTec = data.filter(
    (o) => !o.tecnico || o.tecnico === "Não atribuído" || o.tecnico === "Não Atribuído",
  ).length;

  return [
    {
      tone: "critical" as const,
      title: "Cidade mais crítica",
      value: k.cidadeCritica,
      hint: "Concentração de OS vencidas / vence hoje",
    },
    {
      tone: "warning" as const,
      title: "Prestador com maior backlog",
      value: k.prestadorCritico,
      hint: "Atenção operacional imediata",
    },
    {
      tone: "primary" as const,
      title: "SLA geral",
      value: `${k.slaPct}%`,
      hint: k.slaPct >= 85 ? "Saudável" : "Abaixo do alvo (85%)",
    },
    {
      tone: "warning" as const,
      title: "OS sem técnico",
      value: String(semTec),
      hint: "Aguardando despacho",
    },
    {
      tone: "primary" as const,
      title: "Maior volume por região",
      value: topRegion?.[0] ?? "—",
      hint: `${topRegion?.[1] ?? 0} OS`,
    },
    {
      tone: "primary" as const,
      title: "Técnico com mais OS",
      value: topTec?.[0] ?? "—",
      hint: `${topTec?.[1] ?? 0} OS atribuídas`,
    },
  ];
}

export function getStatusDistribution(data: OS[]) {
  const m = new Map<string, number>();
  data.forEach((o) => m.set(o.status, (m.get(o.status) || 0) + 1));
  return [...m.entries()].map(([name, value]) => ({ name, value }));
}

export function getDueByDay(data: OS[]) {
  const m = new Map<string, number>();
  for (const d of DATES) m.set(d.label, 0);
  data.forEach((o) => {
    const lbl = fmtBR(new Date(o.dataLimite));
    m.set(lbl, (m.get(lbl) || 0) + 1);
  });
  return [...m.entries()].map(([name, value]) => ({ name, value }));
}

export function getOsByCity(data: OS[]) {
  const m = new Map<string, number>();
  data.forEach((o) => m.set(o.cidade, (m.get(o.cidade) || 0) + 1));
  return [...m.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);
}

export function getRanking(
  data: OS[],
  key: "prestador" | "cidade" | "tecnico",
) {
  const m = new Map<string, { total: number; criticas: number }>();
  data.forEach((o) => {
    const k = o[key];
    if (!k) return;
    if (key === "tecnico" && (k === "Não atribuído" || k === "Não Atribuído")) return;
    const cur = m.get(k) || { total: 0, criticas: 0 };
    cur.total++;
    if (o.criticidade === "vencido" || o.criticidade === "vence_hoje") cur.criticas++;
    m.set(k, cur);
  });
  return [...m.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.criticas - a.criticas || b.total - a.total)
    .slice(0, 8);
}

// ---------- Facets (for filter options) ----------
function uniq(arr: string[]): string[] {
  return [...new Set(arr.filter(Boolean))].sort();
}

export const FACETS = {
  contratantes: uniq(ALL_OS.map((o) => o.contratante)),
  prestadores: uniq(ALL_OS.map((o) => o.prestador)),
  cidades: uniq(ALL_OS.map((o) => o.cidade)),
  estados: uniq(ALL_OS.map((o) => o.estado)),
  regioes: uniq(ALL_OS.map((o) => o.regiao)),
  tecnicos: uniq(
    ALL_OS.map((o) => o.tecnico).filter(
      (t) => t && t !== "Não atribuído" && t !== "Não Atribuído",
    ),
  ),
  status: uniq(ALL_OS.map((o) => o.status)),
};

export const REFERENCE_TODAY = REF_TODAY.toISOString();
