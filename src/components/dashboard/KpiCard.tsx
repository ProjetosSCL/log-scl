import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number; // positive = up
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "critical" | "warning" | "neutral";
  invertDelta?: boolean; // when true, "up" is bad
}

const toneGlow: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "from-green-700/15 to-transparent",
  critical: "from-danger/15 to-transparent",
  warning: "from-amber-500/20 to-transparent",
  neutral: "from-ink-400/10 to-transparent",
};

const toneIcon: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "bg-green-100 text-green-700",
  critical: "bg-danger/10 text-danger",
  warning: "bg-amber-500/20 text-ink-900",
  neutral: "bg-muted text-ink-600",
};

export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  tone = "primary",
  invertDelta = false,
}: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  const good = invertDelta ? !positive : positive;

  return (
    <div className="group relative overflow-hidden rounded-md bg-surface p-4 border border-border shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* subtle radial glow */}
      <div
        className={cn(
          "pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl opacity-60 bg-gradient-to-br",
          toneGlow[tone],
        )}
      />

      <div className="relative flex items-start justify-between gap-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-ink-600 truncate">
          {label}
        </div>
        <div
          className={cn(
            "h-8 w-8 shrink-0 grid place-items-center rounded-sm transition-colors",
            toneIcon[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="relative mt-3 flex items-baseline justify-between gap-2">
        <div className="text-3xl font-display font-extrabold tracking-tight text-ink-900 tabular-nums">
          {value}
        </div>
        {typeof delta === "number" && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-sm",
              good ? "text-green-700 bg-green-100" : "text-danger bg-danger/10",
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>

      {hint && <div className="relative mt-1 text-[11px] text-ink-600 font-sans">{hint}</div>}
    </div>
  );
}
