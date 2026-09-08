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
    <aside className="hidden md:flex md:w-[260px] lg:w-[272px] shrink-0 flex-col rounded-md border border-border bg-surface shadow-card m-3 mr-0 p-4 sticky top-3 self-start h-[calc(100dvh-1.5rem)]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-3">
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

      <div className="mt-2 h-px bg-border" />

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1">
        <div className="px-2 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-400">
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
                "group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-all font-sans",
                active
                  ? "bg-green-100 text-green-900 font-semibold"
                  : "text-ink-600 hover:bg-green-100/50 hover:text-ink-900",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-green-700" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-green-700" : "text-ink-600 group-hover:text-ink-900",
                )}
              />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="rounded-sm border border-border bg-surface p-3 mt-3">
        <div className="flex items-center gap-2 text-xs font-sans">
          <span className="h-2 w-2 rounded-full bg-green-700" />
          <span className="text-ink-900 font-medium">Sistema operacional</span>
        </div>
        <div className="mt-1 text-[11px] text-ink-600 font-sans">Todos os serviços online</div>
      </div>
    </aside>
  );
}
