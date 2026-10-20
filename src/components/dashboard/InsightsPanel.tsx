import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface Insight {
  tone: "primary" | "warning" | "critical";
  title: string;
  value: string;
  hint: string;
}

const toneBorder: Record<Insight["tone"], string> = {
  primary: "border-l-green-700",
  warning: "border-l-amber-500",
  critical: "border-l-danger",
};

const toneDot: Record<Insight["tone"], string> = {
  primary: "bg-green-700",
  warning: "bg-amber-500",
  critical: "bg-danger",
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="rounded-md bg-surface p-4 border border-border shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 grid place-items-center rounded-sm bg-green-100 text-green-700">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="text-sm font-display font-bold text-ink-900">Insights Inteligentes</div>
          <div className="text-[11px] text-ink-600 font-sans">
            Sinais operacionais em tempo real
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {insights.map((it, i) => (
          <div
            key={i}
            className={cn(
              "rounded-sm bg-surface p-3 border border-border border-l-4 shadow-sm hover:translate-x-0.5 transition-transform",
              toneBorder[it.tone],
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-600">
                  {it.title}
                </div>
                <div className="text-sm font-display font-bold mt-0.5 truncate text-ink-900">
                  {it.value}
                </div>
                <div className="text-[11px] text-ink-600 font-sans mt-0.5">{it.hint}</div>
              </div>
              <span className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", toneDot[it.tone])} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
