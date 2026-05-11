import { useEffect, useState } from "react";
import { Bell, RefreshCcw, Search, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AppHeader({ title = "Central Operacional" }: { title?: string }) {
  const [now, setNow] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
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

  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const lastUpdateStr = lastUpdate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="glass rounded-2xl mt-3 mx-3 p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-semibold tracking-tight leading-none">
            {title}
          </h1>
          <div className="mt-1 text-[11px] text-muted-foreground capitalize">
            {dateStr} · <span className="text-foreground/80 tabular-nums">{timeStr}</span>
          </div>
        </div>
      </div>

      <div className="md:ml-auto flex-1 md:flex-initial md:w-[360px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar OS, cliente, técnico, cidade…"
          className="pl-9 bg-secondary/50 border-border/60 focus-visible:ring-primary/40"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
          <span className="text-muted-foreground">Atualizado</span>
          <span className="text-foreground/90 tabular-nums">{lastUpdateStr}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={refresh}
          className="border-border/60 bg-secondary/50 hover:bg-accent/60"
          aria-label="Atualizar dados"
        >
          <RefreshCcw className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="border-border/60 bg-secondary/50 hover:bg-accent/60 relative"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-status-warning shadow-[0_0_8px_var(--status-warning)]" />
        </Button>
        <div className="h-9 w-9 rounded-full glass grid place-items-center">
          <UserRound className="h-4 w-4 text-foreground/80" />
        </div>
      </div>
    </header>
  );
}
