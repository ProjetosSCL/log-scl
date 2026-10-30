import { useEffect, useState } from "react";
import { Bell, RefreshCcw, Search, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeSwitcher } from "@/components/stone-ds/ThemeSwitcher";
import { useDataset, refreshDataset } from "@/lib/mock-data";
import { toast } from "sonner";

export function AppHeader({ title = "Central Operacional" }: { title?: string }) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [spinning, setSpinning] = useState(false);
  const { importedAt, source, isSyncing } = useDataset();

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
    <header className="bg-[#FFFFFF] rounded-[28px] border border-[#DFE7E4] shadow-[0_1px_2px_rgba(16,48,36,0.04),0_10px_28px_rgba(16,48,36,0.06)] mt-2 mx-2 md:mt-3 md:mx-3 p-3 sm:px-5 sm:py-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <MobileNav />
          <div className="min-w-0">
            <h1 className="text-base md:text-xl font-display font-bold text-[#103024] tracking-tight leading-tight truncate">
              {title}
            </h1>
            <div className="text-[11px] text-[#666D6A] capitalize font-sans truncate">
              {dateStr} · <span className="text-[#103024] font-bold num">{timeStr}</span>
            </div>
          </div>
        </div>

        <div className="flex sm:hidden items-center gap-1.5 shrink-0">
          <ThemeSwitcher />
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={isSyncing || spinning}
            className="h-9 w-9 rounded-full border-[#DFE7E4] bg-[#F4F7F6] hover:bg-[#DDFFE3] text-[#103024] touch-manipulation shadow-none"
            aria-label="Sincronizar base central"
          >
            <RefreshCcw
              className={`h-4 w-4 ${spinning || isSyncing ? "animate-spin text-[#103024]" : ""}`}
            />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-[#DFE7E4] bg-[#F4F7F6] hover:bg-[#DDFFE3] text-[#103024] relative touch-manipulation shadow-none"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#8A5A00]" />
          </Button>
        </div>
      </div>

      {/* Mobile update timestamp badge */}
      <div className="sm:hidden flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F7F6] text-[11px]">
        <div className="flex items-center gap-1.5 truncate">
          <span className="h-2 w-2 rounded-full bg-[#41D600] shrink-0" />
          <span className="text-[#666D6A] truncate">Atualizado:</span>
          <span className="text-[#103024] font-semibold truncate num">{formattedUpdate}</span>
        </div>
        <span className="text-[10px] font-semibold text-[#103024] bg-[#94EA62] px-2.5 py-0.5 rounded-full shrink-0">
          StoneCo DS
        </span>
      </div>

      <div className="w-full relative sm:hidden">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#666D6A] pointer-events-none" />
        <Input
          placeholder="Buscar OS, cliente, cidade…"
          className="pl-9 min-h-[40px] h-10 bg-[#F4F7F6] border-none text-xs text-[#2B2D2C] placeholder:text-[#666D6A] focus-visible:ring-2 focus-visible:ring-[#41D600] rounded-full shadow-none font-sans"
        />
      </div>

      <div className="hidden sm:block md:ml-auto flex-1 md:flex-initial md:w-[260px] lg:w-[320px] relative order-3 md:order-none">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#666D6A] pointer-events-none" />
        <Input
          placeholder="Buscar OS, cliente, técnico, cidade…"
          className="pl-9 h-9 bg-[#F4F7F6] border-none text-xs text-[#2B2D2C] placeholder:text-[#666D6A] focus-visible:ring-2 focus-visible:ring-[#41D600] rounded-full shadow-none font-sans"
        />
      </div>

      <div className="hidden sm:flex items-center gap-2 ml-auto md:ml-0">
        {/* Prominent central dataset status badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F7F6] border border-[#DFE7E4] text-[11px]">
          <span className="h-2 w-2 rounded-full bg-[#41D600] shrink-0 animate-pulse" />
          <span className="text-[#666D6A]">Base:</span>
          <span className="text-[#103024] font-bold num">{formattedUpdate}</span>
          <span className="hidden xl:inline-block text-[10px] font-bold text-[#103024] bg-[#94EA62] px-2 py-0.5 rounded-full">
            {mounted && source === "import" ? "Central Compartilhada" : "Padrão"}
          </span>
        </div>

        <ThemeSwitcher />

        <Button
          variant="outline"
          size="icon"
          onClick={refresh}
          disabled={isSyncing || spinning}
          className="h-9 w-9 rounded-full border-[#DFE7E4] bg-[#F4F7F6] hover:bg-[#DDFFE3] hover:text-[#103024] text-[#2B2D2C] shadow-none"
          aria-label="Sincronizar dados centrais"
          title="Sincronizar com base central"
        >
          <RefreshCcw
            className={`h-4 w-4 ${spinning || isSyncing ? "animate-spin text-[#103024]" : ""}`}
          />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border-[#DFE7E4] bg-[#F4F7F6] hover:bg-[#DDFFE3] hover:text-[#103024] text-[#2B2D2C] relative shadow-none"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#8A5A00]" />
        </Button>
        <div
          className="h-9 w-9 rounded-full bg-[#103024] text-[#94EA62] grid place-items-center font-bold text-xs shadow-sm"
          title="Operador StoneCo"
        >
          <UserRound className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
