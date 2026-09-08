import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface Insight {
  tone: "primary" | "warning" | "critical";
  title: string;
  value: string;
  hint: string;
}

const toneRing: Record<Insight["tone"], string> = {
  primary: "ring-primary/30 text-primary",
  warning: "ring-status-warning/30 text-status-warning",
  critical: "ring-status-critical/30 text-status-critical",
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="rounded-2xl glass p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 grid place-items-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="text-sm font-semibold">Insights inteligentes</div>
          <div className="text-[11px] text-muted-foreground">Sinais operacionais em tempo real</div>
        </div>
      </div>
      <div className="space-y-2">
        {insights.map((it, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl glass p-3 ring-1 hover:translate-x-0.5 transition-transform",
              toneRing[it.tone],
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {it.title}
                </div>
                <div className="text-sm font-semibold mt-0.5 truncate text-foreground">
                  {it.value}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{it.hint}</div>
              </div>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full mt-2",
                  it.tone === "primary" && "bg-primary shadow-[0_0_8px_var(--primary)]",
                  it.tone === "warning" &&
                    "bg-status-warning shadow-[0_0_8px_var(--status-warning)]",
                  it.tone === "critical" &&
                    "bg-status-critical shadow-[0_0_8px_var(--status-critical)]",
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
