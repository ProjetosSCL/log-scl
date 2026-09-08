import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number; // positive = up
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "featured" | "critical" | "warning" | "neutral";
  invertDelta?: boolean; // when true, "up" is bad
}

export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  tone = "neutral",
  invertDelta = false,
}: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  const good = invertDelta ? !positive : positive;
  const isFeatured = tone === "featured";

  if (isFeatured) {
    return (
      <div className="group relative overflow-hidden rounded-lg bg-green-900 text-white p-5 shadow-card transition-all hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-green-100/80">
            {label}
          </div>
          <div className="h-8 w-8 grid place-items-center rounded-sm bg-white/15 text-white">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div className="font-display text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums text-white">
            {value}
          </div>
          {typeof delta === "number" && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-mono font-semibold px-2 py-1 rounded-sm",
                good ? "text-green-100 bg-white/15" : "text-amber-500 bg-black/30",
              )}
            >
              {positive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {Math.abs(delta).toFixed(1)}%
            </div>
          )}
        </div>
        {hint && <div className="mt-2 text-xs text-green-100/70 font-sans">{hint}</div>}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-md border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-600">
          {label}
        </div>
        <div
          className={cn(
            "h-8 w-8 grid place-items-center rounded-sm",
            tone === "critical"
              ? "bg-danger/10 text-danger"
              : tone === "warning"
                ? "bg-amber-500/20 text-amber-600"
                : "bg-green-100 text-green-900",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3.5 flex items-end justify-between">
        <div className="font-display text-3xl font-bold tracking-tight tabular-nums text-ink-900">
          {value}
        </div>
        {typeof delta === "number" && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-mono font-semibold px-2 py-1 rounded-sm",
              good ? "text-green-700 bg-green-100" : "text-danger bg-danger/10",
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
      {hint && <div className="mt-1.5 text-xs text-ink-600 font-sans">{hint}</div>}
    </div>
  );
}
