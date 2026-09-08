import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #DEE7E1",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 12,
  color: "#10241D",
  boxShadow: "0 1px 2px rgba(16, 36, 29, 0.04), 0 8px 24px -12px rgba(16, 36, 29, 0.12)",
  fontFamily: "Inter, sans-serif",
};

const axisTick = { fill: "#4B5B54", fontSize: 11, fontFamily: "Manrope, sans-serif" };
const gridStroke = "#DEE7E1";

export function OsByCityBar({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ChartCard title="OS por cidade" subtitle="Distribuição de volume">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B6E4F" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#128A61" stopOpacity={0.75} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="name"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(11, 110, 79, 0.05)" }} />
          <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DueByDayLine({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ChartCard title="Vencimentos por dia" subtitle="Linha temporal · 7 dias">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0B6E4F"
            strokeWidth={2.5}
            dot={{ fill: "#0B6E4F", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#128A61" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const PIE_COLORS = [
  "#0B6E4F", // green-700
  "#128A61", // green-600
  "#FFC857", // amber-500
  "#C4432B", // danger
  "#0B3D2C", // green-900
];

export function StatusDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ChartCard title="Distribuição por status" subtitle="Estado atual das OS">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            stroke="#FFFFFF"
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-2 justify-center">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[11px] font-mono">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="text-ink-600 font-sans">{d.name}</span>
            <span className="text-ink-900 font-bold tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function RankingList({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: { name: string; total: number; criticas: number }[];
}) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div className="space-y-2.5">
        {data.map((d, i) => {
          const pct = (d.total / max) * 100;
          const critPct = d.total > 0 ? (d.criticas / d.total) * 100 : 0;
          return (
            <div key={d.name}>
              <div className="flex items-center justify-between text-xs mb-1 font-sans">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-ink-400 font-mono tabular-nums w-4">{i + 1}</span>
                  <span className="truncate font-medium text-ink-900">{d.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-danger font-semibold tabular-nums">{d.criticas}</span>
                  <span className="text-ink-400">/</span>
                  <span className="tabular-nums font-bold text-ink-900">{d.total}</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-green-100 overflow-hidden flex">
                <div className="h-full bg-danger" style={{ width: `${(critPct / 100) * pct}%` }} />
                <div
                  className="h-full bg-green-700"
                  style={{ width: `${pct - (critPct / 100) * pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-5 shadow-card">
      <div className="mb-3">
        <div className="text-base font-display font-bold text-ink-900 tracking-tight">{title}</div>
        {subtitle && <div className="text-xs text-ink-600 font-sans mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}
