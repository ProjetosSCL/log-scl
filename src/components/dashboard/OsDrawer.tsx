import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
  vencido: "bg-status-critical/15 text-status-critical border-status-critical/30",
  vence_hoje: "bg-status-warning/15 text-status-warning border-status-warning/30",
  proximo: "bg-status-attention/15 text-status-attention border-status-attention/30",
  saudavel: "bg-status-healthy/15 text-status-healthy border-status-healthy/30",
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
        className="w-[96vw] sm:w-full sm:max-w-[640px] glass-strong border-l border-border/60 p-0 flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden"
      >
        <SheetHeader className="p-4 md:p-5 border-b border-border/60 backdrop-blur-xl bg-background/40 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
              {items.length} OS
            </Badge>
            <Badge variant="outline" className="border-border/60 text-muted-foreground uppercase tracking-wide">
              <MapPin className="h-3 w-3 mr-1" />
              {city}
            </Badge>
            <Badge variant="outline" className="border-border/60 text-muted-foreground capitalize">
              <Calendar className="h-3 w-3 mr-1" />
              {dateLabel}
            </Badge>
          </div>
          <SheetTitle className="text-left text-base md:text-lg">Detalhamento operacional</SheetTitle>
          <SheetDescription className="text-left text-xs">
            Lista completa das OS para a célula selecionada. Clique em uma OS para inspecionar.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-0 overflow-hidden">
          {/* List */}
          <div className="border-b lg:border-b-0 lg:border-r border-border/60 max-h-[35vh] lg:max-h-none overflow-y-auto overscroll-contain">
            {items.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={cn(
                  "w-full text-left p-3 border-b border-border/40 hover:bg-accent/40 transition-colors",
                  selected?.id === o.id && "bg-accent/60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{o.numero}</span>
                  {o.emergencial && (
                    <AlertTriangle className="h-3 w-3 text-status-critical" />
                  )}
                </div>
                <div className="text-sm font-medium mt-0.5 truncate">{o.cliente}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded border",
                      critBadge[o.criticidade],
                    )}
                  >
                    {critLabel[o.criticidade]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{o.status}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="p-4 md:p-5 space-y-4 overflow-y-auto overscroll-contain min-h-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {selected.numero}
                  </div>
                  <div className="text-lg font-semibold mt-0.5">{selected.cliente}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Modelo {selected.modelo}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge className={cn("border", critBadge[selected.criticidade])}>
                    {critLabel[selected.criticidade]}
                  </Badge>
                  {selected.emergencial && (
                    <Badge className="bg-status-critical/15 text-status-critical border-status-critical/30 border">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Emergencial
                    </Badge>
                  )}
                </div>
              </div>

              {/* SLA */}
              <div className="rounded-xl glass p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">SLA</span>
                  <span className="font-semibold tabular-nums">{selected.sla}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      selected.sla >= 70
                        ? "bg-status-healthy"
                        : selected.sla >= 40
                          ? "bg-status-warning"
                          : "bg-status-critical",
                    )}
                    style={{ width: `${selected.sla}%` }}
                  />
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 gap-3">
                <Info icon={MapPin} label="Endereço" value={`${selected.endereco}`} />
                <Info icon={MapPin} label="Cidade / UF" value={`${selected.cidade} · ${selected.estado}`} />
                <Info icon={User} label="Técnico" value={selected.tecnico} />
                <Info icon={Wrench} label="Prestador" value={selected.prestador} />
                <Info icon={ScrollText} label="Contratante" value={selected.contratante} />
                <Info icon={ScrollText} label="Serviço" value={`${selected.grupoServico} · ${selected.servico}`} />
                <Info icon={Calendar} label="Data limite" value={fmt(selected.dataLimite)} />
                <Info icon={Clock} label="Atendimento" value={fmt(selected.dataAtendimento)} />
              </div>

              <div className="rounded-xl glass p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Observações
                </div>
                <div className="text-sm">{selected.observacoes}</div>
              </div>

              {/* Timeline */}
              <div className="rounded-xl glass p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
                  Histórico operacional
                </div>
                <ol className="relative border-l border-border/60 pl-4 space-y-3">
                  {selected.timeline.map((t, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                      <div className="text-sm">{t.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {fmt(t.ts)} · {t.by}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
                  <ExternalLink className="h-4 w-4" />
                  Abrir OS
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border/60 bg-secondary/50 hover:bg-accent/60"
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

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl glass p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-sm mt-1 truncate" title={value}>
        {value}
      </div>
    </div>
  );
}
