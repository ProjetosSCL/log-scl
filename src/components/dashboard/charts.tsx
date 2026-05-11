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
  background: "oklch(0.18 0.025 155 / 0.92)",
  border: "1px solid oklch(1 0 0 / 0.1)",
  borderRadius: 10,
  padding: "8px 10px",
  fontSize: 12,
  backdropFilter: "blur(12px)",
  color: "oklch(0.97 0.01 150)",
};

export function OsByCityBar({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ChartCard title="OS por cidade" subtitle="Distribuição de volume">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.85 0.22 148)" stopOpacity={0.95} />
              <stop offset="100%" stopColor="oklch(0.78 0.21 148)" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "oklch(0.7 0.02 155)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fill: "oklch(0.7 0.02 155)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} />
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
          <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "oklch(0.7 0.02 155)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fill: "oklch(0.7 0.02 155)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="oklch(0.85 0.22 148)"
            strokeWidth={2.5}
            dot={{ fill: "oklch(0.85 0.22 148)", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "oklch(0.85 0.22 148)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const PIE_COLORS = [
  "oklch(0.78 0.21 148)",
  "oklch(0.7 0.15 200)",
  "oklch(0.75 0.18 55)",
  "oklch(0.65 0.22 25)",
  "oklch(0.7 0.18 290)",
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
            stroke="oklch(0.16 0.025 155)"
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
          <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="text-foreground font-semibold tabular-nums">{d.value}</span>
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
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-muted-foreground tabular-nums w-4">
                    {i + 1}
                  </span>
                  <span className="truncate">{d.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-status-critical tabular-nums">
                    {d.criticas}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="tabular-nums font-semibold">{d.total}</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden flex">
                <div
                  className="h-full bg-status-critical/80"
                  style={{ width: `${(critPct / 100) * pct}%` }}
                />
                <div
                  className="h-full bg-primary/70"
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
    <div className="rounded-2xl glass p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold">{title}</div>
        {subtitle && (
          <div className="text-[11px] text-muted-foreground">{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}
