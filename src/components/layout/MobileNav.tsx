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
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/tabela-operacional", label: "Tabela Operacional", icon: Table2 },
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
          className="md:hidden h-9 w-9 rounded-sm border-border bg-surface hover:bg-green-100/50 text-ink-900"
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-4 bg-surface border-border">
        <div className="flex items-center gap-3 px-1 py-2">
          <div className="relative h-9 w-9 rounded-sm bg-green-700 text-white grid place-items-center shadow-sm">
            <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="text-base font-display font-bold tracking-tight text-ink-900">
              FieldOps
            </div>
            <div className="text-[11px] text-ink-600 font-sans">Operações · Log-SCL</div>
          </div>
        </div>
        <div className="mt-3 h-px bg-border" />
        <nav className="mt-3 space-y-1">
          {items.map((it) => {
            const active = it.exact ? path === it.to : path.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to as "/"}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-all font-sans",
                  active
                    ? "bg-green-100 text-green-900 font-semibold"
                    : "text-ink-600 hover:bg-green-100/50 hover:text-ink-900",
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-green-700" : "text-ink-600")} />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
