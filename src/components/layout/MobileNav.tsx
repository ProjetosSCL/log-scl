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

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/tabela-operacional", label: "Tabela Operacional", icon: Table2 },
  { to: "/sla", label: "SLA", icon: GaugeCircle },
  { to: "/os-criticas", label: "OS Críticas", icon: AlertTriangle },
  { to: "/prestadores", label: "Prestadores", icon: Users },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/indicadores", label: "Indicadores", icon: Activity },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden h-9 w-9 border-border/60 bg-secondary/50 hover:bg-accent/60"
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-4 glass-strong border-border/60">
        <div className="flex items-center gap-3 px-1 py-2">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center glow-primary">
            <Zap className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">FieldOps</div>
            <div className="text-[11px] text-muted-foreground">Operações</div>
          </div>
        </div>
        <div className="mt-3 h-px bg-border/60" />
        <nav className="mt-3 space-y-1">
          {items.map((it) => {
            const active = it.exact ? path === it.to : path.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-accent/70 text-foreground"
                    : "text-muted-foreground hover:bg-accent/60",
                )}
              >
                <Icon
                  className={cn("h-4 w-4", active ? "text-primary" : "")}
                />
                <span className="font-medium">{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
