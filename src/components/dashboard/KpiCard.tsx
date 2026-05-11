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

const toneClass: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "from-primary/25 to-primary/0 text-primary",
  critical: "from-status-critical/25 to-status-critical/0 text-status-critical",
  warning: "from-status-warning/25 to-status-warning/0 text-status-warning",
  neutral: "from-foreground/15 to-foreground/0 text-foreground",
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
    <div className="group relative overflow-hidden rounded-2xl glass p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_oklch(0.78_0.21_148/0.35)]">
      {/* glow */}
      <div
        className={cn(
          "pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full blur-2xl opacity-60 bg-gradient-to-br",
          toneClass[tone],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <div
          className={cn(
            "h-8 w-8 grid place-items-center rounded-lg glass",
            tone === "primary" && "text-primary",
            tone === "critical" && "text-status-critical",
            tone === "warning" && "text-status-warning",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="relative mt-3 flex items-end justify-between">
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
        {typeof delta === "number" && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md",
              good
                ? "text-primary bg-primary/10"
                : "text-status-critical bg-status-critical/10",
            )}
          >
            {positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
      {hint && (
        <div className="relative mt-1 text-[11px] text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}
