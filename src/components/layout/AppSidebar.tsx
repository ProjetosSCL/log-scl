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
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const items: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/tabela-operacional", label: "Tabela Operacional", icon: Table2 },
  { to: "/sla", label: "SLA", icon: GaugeCircle },
  { to: "/os-criticas", label: "OS Críticas", icon: AlertTriangle },
  { to: "/prestadores", label: "Prestadores", icon: Users },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/indicadores", label: "Indicadores", icon: Activity },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex md:w-[260px] lg:w-[272px] shrink-0 flex-col glass-strong rounded-2xl m-3 mr-0 p-4 sticky top-3 self-start h-[calc(100dvh-1.5rem)]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center glow-primary">
          <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">FieldOps</div>
          <div className="text-[11px] text-muted-foreground">
            Operações · Enterprise
          </div>
        </div>
      </div>

      <div className="mt-2 h-px bg-border/60" />

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1">
        <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
          Operação
        </div>
        {items.map((it) => {
          const active = it.exact ? path === it.to : path.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to as "/"}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                "hover:bg-accent/60 hover:translate-x-[1px]",
                active
                  ? "bg-accent/70 text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary shadow-[0_0_12px_var(--primary)]" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-primary" : "group-hover:text-foreground",
                )}
              />
              <span className="font-medium">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="rounded-xl glass p-3 mt-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
          <span className="text-muted-foreground">Sistema operacional</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground/80">
          Todos os serviços online
        </div>
      </div>
    </aside>
  );
}
