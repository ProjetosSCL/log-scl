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
    <aside className="hidden md:flex w-[260px] min-h-[calc(100vh-24px)] shrink-0 flex-col bg-[#FFFFFF] border border-[#DFE7E4] rounded-[28px] m-3 mr-0 p-4 sticky top-3 self-start shadow-[0_1px_2px_rgba(16,48,36,0.04),0_10px_28px_rgba(16,48,36,0.06)]">
      {/* Brand - StoneCo DS styling */}
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="relative h-10 w-10 rounded-full bg-[#103024] grid place-items-center text-[#94EA62] shadow-sm shrink-0">
          {/* Stone brand-inspired insignia mark */}
          <span className="block h-3.5 w-3.5 rounded-full bg-[#94EA62]" />
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-2xl font-display font-extrabold tracking-tight text-[#103024] truncate">
            Flow
          </div>
          <div className="text-[11px] text-[#666D6A] font-sans truncate">
            StoneCo Operations · SCL
          </div>
        </div>
      </div>

      <div className="mt-2 h-px bg-[#DFE7E4]" />

      {/* Nav items */}
      <nav className="mt-4 flex-1 space-y-1.5 overflow-y-auto pr-1">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#666D6A]">
          Navegação Principal
        </div>
        {items.map((it) => {
          const active = it.exact ? path === it.to : path.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to as "/"}
              className={cn(
                "group relative flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 font-sans",
                active
                  ? "bg-[#103024] text-[#94EA62] font-bold shadow-sm"
                  : "text-[#2B2D2C] hover:bg-[#F4F7F6] hover:text-[#103024]",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors shrink-0",
                  active ? "text-[#94EA62]" : "text-[#666D6A] group-hover:text-[#103024]",
                )}
              />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer status card */}
      <div className="rounded-[20px] bg-[#F4F7F6] border border-[#DFE7E4] p-3.5 mt-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-[#41D600] animate-pulse" />
          <span className="text-[#103024] font-bold font-sans">StoneCo DS Ativo</span>
        </div>
        <div className="mt-1 text-[11px] text-[#666D6A] font-sans">
          brand.stone.br · ABC Gravity & Roobert
        </div>
      </div>
    </aside>
  );
}
