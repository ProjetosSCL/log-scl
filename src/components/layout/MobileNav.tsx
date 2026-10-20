import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Table2,
  GaugeCircle,
  AlertTriangle,
  Users,
  FileBarChart,
  Activity,
  Settings,
  Zap,
  Menu,
  Trophy,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/tabela-operacional", label: "Tabela Operacional", icon: Table2 },
  { to: "/ranking-vencimentos", label: "Ranking de Vencimentos", icon: Trophy },
  { to: "/sla", label: "SLA", icon: GaugeCircle },
  { to: "/os-criticas", label: "OS Críticas", icon: AlertTriangle },
  { to: "/prestadores", label: "Prestadores", icon: Users },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/indicadores", label: "Indicadores", icon: Activity },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden h-11 w-11 min-h-[44px] min-w-[44px] p-2.5 border-border bg-bg hover:bg-green-100 hover:text-green-900 text-ink-900 rounded-sm touch-manipulation shadow-xs"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] max-w-[85vw] p-4 bg-surface border-r border-border flex flex-col justify-between overflow-y-auto overscroll-contain"
      >
        <div>
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="relative h-10 w-10 rounded-sm bg-green-700 grid place-items-center text-white shrink-0 shadow-xs">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-base font-display font-bold tracking-tight text-ink-900 truncate">
                Flow
              </div>
              <div className="text-xs text-ink-600 font-sans truncate">
                Sertão, Cerrado e Litoral
              </div>
            </div>
          </div>
          <div className="mt-3 h-px bg-border" />
          <nav className="mt-3 space-y-1.5" aria-label="Navegação móvel">
            {items.map((it) => {
              const active = it.exact ? path === it.to : path.startsWith(it.to);
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to as "/"}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-sm px-3.5 py-3 min-h-[44px] text-sm transition-colors font-sans touch-manipulation",
                    active
                      ? "bg-green-100 text-green-900 font-semibold"
                      : "text-ink-600 hover:bg-green-100/60 hover:text-green-900 active:bg-green-100/80",
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5 shrink-0", active ? "text-green-700" : "text-ink-600")}
                  />
                  <span className="truncate">{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 pt-3 border-t border-border">
          <div className="flex items-center gap-2 px-2 py-2 text-xs font-mono text-ink-600">
            <span className="h-2.5 w-2.5 rounded-full bg-green-700 shrink-0" />
            <span className="truncate">Modo Campo Ativo</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
