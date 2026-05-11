import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FACETS, type Filters, type Criticality, type Status } from "@/lib/mock-data";

type Key = keyof Filters;

interface MultiProps {
  label: string;
  options: string[];
  value: string[] | undefined;
  onChange: (v: string[]) => void;
}

function MultiFilter({ label, options, value, onChange }: MultiProps) {
  const [open, setOpen] = useState(false);
  const selected = value ?? [];
  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((s) => s !== v));
    else onChange([...selected, v]);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 rounded-full border-border/60 bg-secondary/50 hover:bg-accent/60 px-3",
            selected.length > 0 && "border-primary/40 text-foreground",
          )}
        >
          <span className="text-xs">{label}</span>
          {selected.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 glass-strong border-border/60" align="start">
        <Command>
          <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const sel = selected.includes(opt);
                return (
                  <CommandItem key={opt} onSelect={() => toggle(opt)}>
                    <div
                      className={cn(
                        "mr-2 h-4 w-4 rounded border border-border grid place-items-center",
                        sel && "bg-primary border-primary text-primary-foreground",
                      )}
                    >
                      {sel && <Check className="h-3 w-3" />}
                    </div>
                    {opt}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
}

export function FiltersBar({ filters, setFilters }: Props) {
  const set = <K extends Key>(k: K, v: Filters[K]) =>
    setFilters({ ...filters, [k]: v });

  const activeChips: { key: Key; values: string[] }[] = [];
  (["contratante", "prestador", "cidade", "estado", "regiao", "tecnico", "criticidade", "status"] as Key[]).forEach((k) => {
    const v = filters[k] as string[] | undefined;
    if (v && v.length) activeChips.push({ key: k, values: v });
  });

  const totalActive =
    activeChips.reduce((a, b) => a + b.values.length, 0) +
    (filters.emergencial ? 1 : 0);

  return (
    <div className="rounded-2xl glass p-3 flex flex-wrap items-center gap-2">
      <MultiFilter
        label="Contratante"
        options={FACETS.contratantes}
        value={filters.contratante}
        onChange={(v) => set("contratante", v)}
      />
      <MultiFilter
        label="Prestador"
        options={FACETS.prestadores}
        value={filters.prestador}
        onChange={(v) => set("prestador", v)}
      />
      <MultiFilter
        label="Cidade"
        options={FACETS.cidades}
        value={filters.cidade}
        onChange={(v) => set("cidade", v)}
      />
      <MultiFilter
        label="Estado"
        options={FACETS.estados}
        value={filters.estado}
        onChange={(v) => set("estado", v)}
      />
      <MultiFilter
        label="Região"
        options={FACETS.regioes}
        value={filters.regiao}
        onChange={(v) => set("regiao", v)}
      />
      <MultiFilter
        label="Técnico"
        options={FACETS.tecnicos}
        value={filters.tecnico}
        onChange={(v) => set("tecnico", v)}
      />
      <MultiFilter
        label="Criticidade"
        options={["vencido", "vence_hoje", "proximo", "saudavel"]}
        value={filters.criticidade as string[] | undefined}
        onChange={(v) => set("criticidade", v as Criticality[])}
      />
      <MultiFilter
        label="Status"
        options={FACETS.status}
        value={filters.status as string[] | undefined}
        onChange={(v) => set("status", v as Status[])}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => set("emergencial", filters.emergencial ? null : true)}
        className={cn(
          "h-8 rounded-full border-border/60 bg-secondary/50 hover:bg-accent/60 px-3 text-xs gap-1.5",
          filters.emergencial && "border-status-critical/50 text-status-critical bg-status-critical/10",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            filters.emergencial ? "bg-status-critical shadow-[0_0_8px_var(--status-critical)]" : "bg-muted-foreground/50",
          )}
        />
        Emergencial
      </Button>

      {totalActive > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({})}
          className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <X className="h-3 w-3" />
          Limpar ({totalActive})
        </Button>
      )}
    </div>
  );
}
