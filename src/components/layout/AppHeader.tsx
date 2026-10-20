import { useEffect, useState } from "react";
import { Bell, CloudCheck, Database, RefreshCcw, Search, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/MobileNav";
import { useDataset, refreshDataset } from "@/lib/mock-data";
import { toast } from "sonner";

export function AppHeader({ title = "Central Operacional" }: { title?: string }) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [spinning, setSpinning] = useState(false);
  const { importedAt, source, isSyncing, rowCount } = useDataset();

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const refresh = async () => {
    setSpinning(true);
    try {
      const ok = await refreshDataset();
      if (ok) {
        toast.success("Base central sincronizada", {
          description: "Dados atualizados com o servidor compartilhado.",
        });
      } else {
        toast.info("Conexão verificada", {
          description: "Você já está visualizando os dados mais recentes.",
        });
      }
    } catch {
      toast.error("Erro ao sincronizar com o servidor.");
    } finally {
      setSpinning(false);
    }
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

  const formattedUpdate =
    mounted && importedAt
      ? new Date(importedAt).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Base inicial";

  return (
    <header className="bg-surface rounded-md border border-border shadow-card mt-2 mx-2 md:mt-3 md:mx-3 p-2.5 sm:p-3 md:p-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <MobileNav />
          <div className="min-w-0">
            <h1 className="text-sm md:text-lg font-display font-bold text-ink-900 tracking-tight leading-tight truncate">
              {title}
            </h1>
            <div className="text-[10px] md:text-[11px] text-ink-600 capitalize font-mono truncate">
              {dateStr} · <span className="text-ink-900 font-semibold tabular-nums">{timeStr}</span>
            </div>
          </div>
        </div>

        <div className="flex sm:hidden items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={isSyncing || spinning}
            className="h-11 w-11 min-h-[44px] min-w-[44px] border-border bg-bg hover:bg-green-100 hover:text-green-900 text-ink-900 rounded-sm touch-manipulation shadow-xs"
            aria-label="Sincronizar base central"
          >
            <RefreshCcw
              className={`h-4 w-4 ${spinning || isSyncing ? "animate-spin text-green-700" : ""}`}
            />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 min-h-[44px] min-w-[44px] border-border bg-bg hover:bg-green-100 hover:text-green-900 text-ink-900 rounded-sm relative touch-manipulation shadow-xs"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
          </Button>
        </div>
      </div>

      {/* Mobile update timestamp badge */}
      <div className="sm:hidden flex items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-bg border border-border text-[11px] font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <span className="h-2 w-2 rounded-full bg-green-700 shrink-0" />
          <span className="text-ink-600 truncate">Atualizado:</span>
          <span className="text-ink-900 font-semibold truncate">{formattedUpdate}</span>
        </div>
        <span className="text-[10px] font-mono font-medium text-green-800 bg-green-100 px-1.5 py-0.5 rounded shrink-0">
          Base Central
        </span>
      </div>

      <div className="w-full relative sm:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
        <Input
          placeholder="Buscar OS, cliente, cidade…"
          className="pl-9 min-h-[44px] h-11 bg-bg border-border text-sm text-ink-900 placeholder:text-ink-400 focus-visible:ring-green-700/40 rounded-sm"
        />
      </div>

      <div className="hidden sm:block md:ml-auto flex-1 md:flex-initial md:w-[300px] lg:w-[320px] relative order-3 md:order-none">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
        <Input
          placeholder="Buscar OS, cliente, técnico, cidade…"
          className="pl-9 h-9 bg-bg border-border text-sm text-ink-900 placeholder:text-ink-400 focus-visible:ring-green-700/40 rounded-sm"
        />
      </div>

      <div className="hidden sm:flex items-center gap-1.5 md:gap-2 ml-auto md:ml-0">
        {/* Prominent central dataset status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg border border-border text-[11px] font-mono">
          <span className="h-2 w-2 rounded-full bg-green-700 shrink-0 animate-pulse" />
          <span className="text-ink-600">Dados atualizados em:</span>
          <span className="text-ink-900 font-semibold tabular-nums">{formattedUpdate}</span>
          <span className="hidden xl:inline-block text-[10px] font-medium text-green-800 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">
            {mounted && source === "import" ? "Central Compartilhada" : "Padrão"}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={refresh}
          disabled={isSyncing || spinning}
          className="h-9 w-9 border-border bg-bg hover:bg-green-100 hover:text-green-900 text-ink-900 rounded-sm shadow-xs"
          aria-label="Sincronizar dados centrais"
          title="Sincronizar com base central"
        >
          <RefreshCcw
            className={`h-4 w-4 ${spinning || isSyncing ? "animate-spin text-green-700" : ""}`}
          />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-border bg-bg hover:bg-green-100 hover:text-green-900 text-ink-900 rounded-sm relative shadow-xs"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
        </Button>
        <div
          className="h-9 w-9 rounded-full bg-green-100 text-green-700 grid place-items-center"
          title="Usuário operacional"
        >
          <UserRound className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
