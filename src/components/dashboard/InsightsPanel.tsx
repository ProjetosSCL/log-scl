import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface Insight {
  tone: "primary" | "warning" | "critical";
  title: string;
  value: string;
  hint: string;
}

const toneStyles: Record<Insight["tone"], { border: string; dot: string }> = {
  primary: {
    border: "border-l-4 border-l-green-700",
    dot: "bg-green-700",
  },
  warning: {
    border: "border-l-4 border-l-amber-500",
    dot: "bg-amber-500",
  },
  critical: {
    border: "border-l-4 border-l-danger",
    dot: "bg-danger",
  },
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="rounded-md border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-7 w-7 grid place-items-center rounded-sm bg-green-100 text-green-900">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="text-base font-display font-bold text-ink-900">Insights inteligentes</div>
          <div className="text-xs text-ink-600 font-sans">Sinais operacionais em tempo real</div>
        </div>
      </div>
      <div className="space-y-2.5">
        {insights.map((it, i) => (
          <div
            key={i}
            className={cn(
              "rounded-sm border border-border bg-surface p-3.5 transition-colors hover:bg-green-100/25",
              toneStyles[it.tone].border,
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-600">
                  {it.title}
                </div>
                <div className="text-sm font-semibold mt-0.5 truncate text-ink-900">{it.value}</div>
                <div className="text-xs text-ink-600 mt-0.5 font-sans">{it.hint}</div>
              </div>
              <span className={cn("h-2 w-2 rounded-full mt-2 shrink-0", toneStyles[it.tone].dot)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
