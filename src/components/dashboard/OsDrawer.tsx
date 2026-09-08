import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type OS } from "@/lib/mock-data";
import {
  AlertTriangle,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  ScrollText,
  User,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  city: string | null;
  dateLabel: string | null;
  items: OS[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const critBadge: Record<OS["criticidade"], string> = {
  vencido: "bg-danger/15 text-danger border-danger/30 font-semibold",
  vence_hoje: "bg-amber-500/20 text-amber-600 border-amber-500/30 font-semibold",
  proximo: "bg-green-600/15 text-green-700 border-green-600/30 font-semibold",
  saudavel: "bg-green-100 text-green-900 border-green-700/20 font-semibold",
};

const critLabel: Record<OS["criticidade"], string> = {
  vencido: "Vencido",
  vence_hoje: "Vence hoje",
  proximo: "Próximo",
  saudavel: "Saudável",
};

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OsDrawer({
  open,
  onOpenChange,
  city,
  dateLabel,
  items,
  selectedId,
  setSelectedId,
}: Props) {
  const selected = items.find((o) => o.id === selectedId) ?? items[0] ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[96vw] sm:w-full sm:max-w-[640px] bg-surface border-l border-border p-0 flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden"
      >
        <SheetHeader className="p-4 md:p-5 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-green-100 text-green-900 border border-green-700/20 hover:bg-green-100 rounded-sm font-mono text-xs">
              {items.length} OS
            </Badge>
            <Badge
              variant="outline"
              className="border-border text-ink-600 uppercase tracking-wide rounded-sm font-sans text-xs"
            >
              <MapPin className="h-3 w-3 mr-1" />
              {city}
            </Badge>
            <Badge
              variant="outline"
              className="border-border text-ink-600 capitalize rounded-sm font-sans text-xs"
            >
              <Calendar className="h-3 w-3 mr-1" />
              {dateLabel}
            </Badge>
          </div>
          <SheetTitle className="text-left text-base md:text-lg font-display font-bold text-ink-900">
            Detalhamento operacional
          </SheetTitle>
          <SheetDescription className="text-left text-xs text-ink-600 font-sans">
            Lista completa das OS para a célula selecionada. Clique em uma OS para inspecionar.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-0 overflow-hidden">
          {/* List */}
          <div className="border-b lg:border-b-0 lg:border-r border-border max-h-[35vh] lg:max-h-none overflow-y-auto overscroll-contain">
            {items.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={cn(
                  "w-full text-left p-3 border-b border-border hover:bg-green-100/30 transition-colors font-sans",
                  selected?.id === o.id &&
                    "bg-green-100/60 font-semibold border-l-2 border-l-green-700",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-ink-600">{o.numero}</span>
                  {o.emergencial && <AlertTriangle className="h-3.5 w-3.5 text-danger" />}
                </div>
                <div className="text-sm font-medium mt-0.5 truncate text-ink-900">{o.cliente}</div>
                <div className="mt-1.5 flex items-center gap-1.5 font-sans">
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-sm border",
                      critBadge[o.criticidade],
                    )}
                  >
                    {critLabel[o.criticidade]}
                  </span>
                  <span className="text-[10px] text-ink-600">{o.status}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="p-4 md:p-5 space-y-4 overflow-y-auto overscroll-contain min-h-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono text-ink-600">{selected.numero}</div>
                  <div className="text-lg font-display font-bold mt-0.5 text-ink-900">
                    {selected.cliente}
                  </div>
                  <div className="text-xs text-ink-600 mt-1 font-sans">
                    Modelo {selected.modelo}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge className={cn("border rounded-sm", critBadge[selected.criticidade])}>
                    {critLabel[selected.criticidade]}
                  </Badge>
                  {selected.emergencial && (
                    <Badge className="bg-danger/15 text-danger border-danger/30 border rounded-sm font-semibold">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Emergencial
                    </Badge>
                  )}
                </div>
              </div>

              {/* SLA */}
              <div className="rounded-sm border border-border bg-surface p-3.5 shadow-sm">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-ink-600">SLA</span>
                  <span className="font-bold font-mono text-ink-900 tabular-nums">
                    {selected.sla}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-green-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      selected.sla >= 70
                        ? "bg-green-700"
                        : selected.sla >= 40
                          ? "bg-amber-500"
                          : "bg-danger",
                    )}
                    style={{ width: `${selected.sla}%` }}
                  />
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 gap-3">
                <Info icon={MapPin} label="Endereço" value={`${selected.endereco}`} />
                <Info
                  icon={MapPin}
                  label="Cidade / UF"
                  value={`${selected.cidade} · ${selected.estado}`}
                />
                <Info icon={User} label="Técnico" value={selected.tecnico} />
                <Info icon={Wrench} label="Prestador" value={selected.prestador} />
                <Info icon={ScrollText} label="Contratante" value={selected.contratante} />
                <Info
                  icon={ScrollText}
                  label="Serviço"
                  value={`${selected.grupoServico} · ${selected.servico}`}
                />
                <Info icon={Calendar} label="Data limite" value={fmt(selected.dataLimite)} />
                <Info icon={Clock} label="Atendimento" value={fmt(selected.dataAtendimento)} />
              </div>

              <div className="rounded-sm border border-border bg-surface p-3.5 shadow-sm">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-400 mb-1">
                  Observações
                </div>
                <div className="text-sm font-sans text-ink-900">{selected.observacoes}</div>
              </div>

              {/* Timeline */}
              <div className="rounded-sm border border-border bg-surface p-4 shadow-sm">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-400 mb-3">
                  Histórico operacional
                </div>
                <ol className="relative border-l border-border pl-4 space-y-3">
                  {selected.timeline.map((t, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-green-700" />
                      <div className="text-sm font-sans font-medium text-ink-900">{t.label}</div>
                      <div className="text-xs text-ink-600 font-sans">
                        {fmt(t.ts)} · {t.by}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-green-700 text-white hover:bg-green-800 rounded-sm gap-1.5 font-medium">
                  <ExternalLink className="h-4 w-4" />
                  Abrir OS
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border bg-surface hover:bg-green-100/50 rounded-sm text-ink-900"
                >
                  Ver detalhes
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-400">
        <Icon className="h-3 w-3 text-green-700" />
        {label}
      </div>
      <div className="text-sm font-sans text-ink-900 mt-1 truncate" title={value}>
        {value}
      </div>
    </div>
  );
}
