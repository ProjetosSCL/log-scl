// Mock operational data for the OS dashboard.
// Deterministic pseudo-random so the UI stays stable across renders.

export type Status = "Aberta" | "Em andamento" | "Aguardando peça" | "Concluída" | "Cancelada";
export type Criticality = "vencido" | "vence_hoje" | "proximo" | "saudavel";

export interface OS {
  id: string;
  numero: string;
  cliente: string;
  modelo: string;
  endereco: string;
  cidade: string;
  regiao: string;
  tecnico: string;
  contratante: string;
  prestador: string;
  sla: number; // 0..100
  criticidade: Criticality;
  status: Status;
  emergencial: boolean;
  observacoes: string;
  dataLimite: string; // ISO
  dataAtendimento?: string;
  dataAbertura: string;
  timeline: { ts: string; label: string; by: string }[];
}

const cidades = [
  { nome: "Limoeiro", regiao: "Nordeste" },
  { nome: "Morada Nova", regiao: "Nordeste" },
  { nome: "Russas", regiao: "Nordeste" },
  { nome: "Quixadá", regiao: "Sertão Central" },
  { nome: "Sobral", regiao: "Norte" },
  { nome: "Fortaleza", regiao: "Metropolitana" },
  { nome: "Crato", regiao: "Cariri" },
  { nome: "Juazeiro do Norte", regiao: "Cariri" },
  { nome: "Iguatu", regiao: "Centro-Sul" },
  { nome: "Maracanaú", regiao: "Metropolitana" },
];

const prestadores = [
  "TecField Brasil",
  "NorteServ",
  "AssistMax",
  "FieldOne",
  "Prestec",
  "ServiTech",
];
const contratantes = ["Stone", "Cielo", "GetNet", "Rede", "PagSeguro"];
const tecnicos = [
  "André Lima",
  "Bruno Souza",
  "Carla Mendes",
  "Diego Rocha",
  "Eduardo Pires",
  "Fernanda Alves",
  "Gabriel Nunes",
  "Helena Costa",
  "Igor Tavares",
  "Julia Ramos",
];
const modelos = ["S920", "D195", "D200", "L400", "Q92", "M8 Pro"];
const statusList: Status[] = [
  "Aberta",
  "Em andamento",
  "Aguardando peça",
  "Concluída",
  "Cancelada",
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

function dateOffset(days: number): Date {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + days);
  return base;
}

function fmtBR(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

// Generate 7 dates: -1, 0, +1 ... +5
export const DATES: { iso: string; label: string; offset: number }[] = Array.from(
  { length: 7 },
  (_, i) => {
    const offset = i - 1;
    const d = dateOffset(offset);
    return { iso: d.toISOString(), label: fmtBR(d), offset };
  },
);

function criticalityFromOffset(offset: number): Criticality {
  if (offset < 0) return "vencido";
  if (offset === 0) return "vence_hoje";
  if (offset <= 2) return "proximo";
  return "saudavel";
}

function slaFromCrit(c: Criticality) {
  if (c === "vencido") return Math.floor(rand() * 25);
  if (c === "vence_hoje") return 30 + Math.floor(rand() * 25);
  if (c === "proximo") return 55 + Math.floor(rand() * 25);
  return 80 + Math.floor(rand() * 20);
}

// Build the dataset
export const ALL_OS: OS[] = (() => {
  const out: OS[] = [];
  let n = 100000;
  for (const cidade of cidades) {
    for (const date of DATES) {
      // varying density per city/date
      const base = 1 + Math.floor(rand() * 9);
      for (let i = 0; i < base; i++) {
        const crit = criticalityFromOffset(date.offset);
        const status: Status =
          crit === "vencido" && rand() < 0.4 ? "Em andamento" : pick(statusList);
        const emergencial = rand() < 0.18;
        const dl = new Date(date.iso);
        const numero = `OS-${(n++).toString().padStart(6, "0")}`;
        const aberturaOffset = -3 - Math.floor(rand() * 5);
        out.push({
          id: numero,
          numero,
          cliente: `Cliente ${Math.floor(rand() * 9000 + 1000)}`,
          modelo: pick(modelos),
          endereco: `Rua ${pick(["das Flores", "do Comércio", "Central", "São José", "XV de Novembro"])}, ${Math.floor(rand() * 1500 + 1)} — ${cidade.nome}`,
          cidade: cidade.nome,
          regiao: cidade.regiao,
          tecnico: pick(tecnicos),
          contratante: pick(contratantes),
          prestador: pick(prestadores),
          sla: slaFromCrit(crit),
          criticidade: crit,
          status,
          emergencial,
          observacoes:
            rand() < 0.4
              ? "Cliente solicitou prioridade. Equipamento parado."
              : "Atendimento dentro da rota planejada.",
          dataLimite: dl.toISOString(),
          dataAtendimento:
            status === "Concluída"
              ? new Date(dl.getTime() - 86400000).toISOString()
              : undefined,
          dataAbertura: dateOffset(aberturaOffset).toISOString(),
          timeline: [
            { ts: dateOffset(aberturaOffset).toISOString(), label: "OS aberta", by: "Sistema" },
            {
              ts: dateOffset(aberturaOffset + 1).toISOString(),
              label: "Atribuída ao técnico",
              by: "Despacho",
            },
            ...(status !== "Aberta"
              ? [
                  {
                    ts: dateOffset(aberturaOffset + 2).toISOString(),
                    label: "Em deslocamento",
                    by: pick(tecnicos),
                  },
                ]
              : []),
            ...(status === "Concluída"
              ? [
                  {
                    ts: new Date(dl.getTime() - 86400000).toISOString(),
                    label: "Atendimento concluído",
                    by: pick(tecnicos),
                  },
                ]
              : []),
          ],
        });
      }
    }
  }
  return out;
})();

export interface Filters {
  contratante?: string[];
  prestador?: string[];
  cidade?: string[];
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
    if (f.regiao?.length && !f.regiao.includes(o.regiao)) return false;
    if (f.tecnico?.length && !f.tecnico.includes(o.tecnico)) return false;
    if (f.criticidade?.length && !f.criticidade.includes(o.criticidade)) return false;
    if (f.status?.length && !f.status.includes(o.status)) return false;
    if (f.emergencial === true && !o.emergencial) return false;
    return true;
  });
}

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
  const cities = [...new Set(data.map((o) => o.cidade))].sort();
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
  data.forEach((o) => byTec.set(o.tecnico, (byTec.get(o.tecnico) || 0) + 1));
  const topTec = [...byTec.entries()].sort((a, b) => b[1] - a[1])[0];

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
      title: "Emergenciais pendentes",
      value: String(k.emergencial),
      hint: "Tratamento prioritário",
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
    .sort((a, b) => b.value - a.value);
}

export function getRanking(data: OS[], key: "prestador" | "cidade" | "tecnico") {
  const m = new Map<string, { total: number; criticas: number }>();
  data.forEach((o) => {
    const k = o[key];
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

export const FACETS = {
  contratantes,
  prestadores,
  cidades: cidades.map((c) => c.nome),
  regioes: [...new Set(cidades.map((c) => c.regiao))],
  tecnicos,
  status: statusList,
};
