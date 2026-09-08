import { useEffect, useState } from "react";
import { Bell, RefreshCcw, Search, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/MobileNav";

export function AppHeader({ title = "Central Operacional" }: { title?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    setNow(new Date());
    setLastUpdate(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const refresh = () => {
    setSpinning(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setSpinning(false);
    }, 600);
  };

  const dateStr = now
    ? now.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
  const timeStr = now
    ? now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  const lastUpdateStr = lastUpdate
    ? lastUpdate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <header className="rounded-md border border-border bg-surface shadow-card mt-2 mx-2 md:mt-3 md:mx-3 p-3 md:p-4 flex items-center gap-2 md:gap-4 flex-wrap">
      <MobileNav />
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base md:text-xl font-display font-bold tracking-tight leading-none truncate text-ink-900">
            {title}
          </h1>
          <div className="mt-1 text-[11px] md:text-xs text-ink-600 capitalize font-sans">
            {dateStr} ·{" "}
            <span className="text-ink-900 font-mono font-semibold tabular-nums">{timeStr}</span>
          </div>
        </div>
      </div>

      <div className="hidden sm:block md:ml-auto flex-1 md:flex-initial md:w-[360px] relative order-3 md:order-none w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        <Input
          placeholder="Buscar OS, cliente, técnico, cidade…"
          className="pl-9 bg-surface border-border text-ink-900 placeholder:text-ink-400 focus-visible:ring-green-700 rounded-sm text-sm font-sans"
        />
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 ml-auto md:ml-0">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border bg-green-100/40 text-xs font-sans">
          <span className="h-2 w-2 rounded-full bg-green-700" />
          <span className="text-ink-600">Atualizado</span>
          <span className="text-ink-900 font-mono font-semibold tabular-nums">{lastUpdateStr}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={refresh}
          className="rounded-sm border border-border bg-surface hover:bg-green-100/50 text-ink-900"
          aria-label="Atualizar dados"
        >
          <RefreshCcw className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-sm border border-border bg-surface hover:bg-green-100/50 text-ink-900 relative"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
        </Button>
        <div className="h-9 w-9 rounded-sm border border-border bg-green-100 text-green-900 grid place-items-center font-medium">
          <UserRound className="h-4 w-4 text-green-900" />
        </div>
      </div>
    </header>
  );
}
