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
  Trophy,
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
  { to: "/ranking-vencimentos", label: "Ranking de Vencimentos", icon: Trophy },
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
    <aside className="hidden md:flex w-[260px] h-[529.317px] shrink-0 flex-col bg-surface border border-border shadow-card rounded-md m-3 mr-0 p-4 sticky top-3 self-start">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-3 mt-[7px]">
        <div className="relative h-[45px] w-[44px] -mt-[12px] ml-0 leading-[60px] text-[28px] rounded-sm bg-green-700 grid place-items-center text-white">
          <Zap className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="text-[30px] -mt-[15px] ml-0 font-display font-bold tracking-tight text-ink-900">
            Flow
          </div>
          <div className="-mt-[4px] text-[11px] text-ink-600 font-sans">
            Sertão, Cerrado e Litoral
          </div>
        </div>
      </div>

      <div className="mt-2 h-px bg-border" />

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1">
        <div className="px-2 pb-2 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ink-600">
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
                "hover:bg-green-100 hover:text-green-900",
                active ? "bg-green-100 text-green-900 font-semibold" : "text-ink-600",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-green-700" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-green-700" : "text-ink-600 group-hover:text-green-900",
                )}
              />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="rounded-sm bg-bg border border-border p-3 mt-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-green-700" />
          <span className="text-ink-900 font-semibold font-sans">Sistema operacional</span>
        </div>
        <div className="mt-1 text-[11px] text-ink-600 font-sans">Todos os serviços online</div>
      </div>
    </aside>
  );
}
