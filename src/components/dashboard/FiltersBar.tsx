import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDataset, type Filters, type Criticality, type Status } from "@/lib/mock-data";

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
            "h-8 gap-1.5 rounded-sm border border-border bg-surface hover:bg-green-100/60 px-3 text-ink-900 transition-colors",
            selected.length > 0 && "border-green-600 bg-green-100 text-green-900 font-medium",
          )}
        >
          <span className="text-xs font-sans">{label}</span>
          {selected.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-green-700 text-white font-mono font-semibold">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-3 w-3 opacity-60 text-ink-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] p-0 rounded-sm border border-border bg-surface shadow-card"
        align="start"
      >
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
                        "mr-2 h-4 w-4 rounded-sm border border-border grid place-items-center",
                        sel && "bg-green-700 border-green-700 text-white",
                      )}
                    >
                      {sel && <Check className="h-3 w-3" />}
                    </div>
                    <span className="text-ink-900 text-xs font-sans">{opt}</span>
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
  only?: Key[];
  dense?: boolean;
}

export function FiltersBar({ filters, setFilters, only, dense = false }: Props) {
  const show = (k: Key) => !only || only.includes(k);
  const { facets: FACETS } = useDataset();
  const set = <K extends Key>(k: K, v: Filters[K]) => setFilters({ ...filters, [k]: v });

  const activeChips: { key: Key; values: string[] }[] = [];
  (
    [
      "contratante",
      "prestador",
      "cidade",
      "bairro",
      "estado",
      "regiao",
      "tecnico",
      "criticidade",
      "status",
    ] as Key[]
  ).forEach((k) => {
    const v = filters[k] as string[] | undefined;
    if (v && v.length) activeChips.push({ key: k, values: v });
  });

  const totalActive =
    activeChips.reduce((a, b) => a + b.values.length, 0) + (filters.emergencial ? 1 : 0);

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface shadow-card flex flex-wrap items-center",
        dense ? "p-2 gap-1.5" : "p-3.5 gap-2",
      )}
    >
      {show("contratante") && (
        <MultiFilter
          label="Contratante"
          options={FACETS.contratantes}
          value={filters.contratante}
          onChange={(v) => set("contratante", v)}
        />
      )}
      {show("prestador") && (
        <MultiFilter
          label="Prestador"
          options={FACETS.prestadores}
          value={filters.prestador}
          onChange={(v) => set("prestador", v)}
        />
      )}
      {show("cidade") && (
        <MultiFilter
          label="Cidade"
          options={FACETS.cidades}
          value={filters.cidade}
          onChange={(v) => set("cidade", v)}
        />
      )}
      {show("bairro") && (
        <MultiFilter
          label="Bairro"
          options={FACETS.bairros}
          value={filters.bairro}
          onChange={(v) => set("bairro", v)}
        />
      )}
      {show("estado") && (
        <MultiFilter
          label="Estado"
          options={FACETS.estados}
          value={filters.estado}
          onChange={(v) => set("estado", v)}
        />
      )}
      {show("regiao") && (
        <MultiFilter
          label="Região"
          options={FACETS.regioes}
          value={filters.regiao}
          onChange={(v) => set("regiao", v)}
        />
      )}
      {show("tecnico") && (
        <MultiFilter
          label="Técnico"
          options={FACETS.tecnicos}
          value={filters.tecnico}
          onChange={(v) => set("tecnico", v)}
        />
      )}
      {show("criticidade") && (
        <MultiFilter
          label="Criticidade"
          options={["vencido", "vence_hoje", "proximo", "saudavel"]}
          value={filters.criticidade as string[] | undefined}
          onChange={(v) => set("criticidade", v as Criticality[])}
        />
      )}
      {show("status") && (
        <MultiFilter
          label="Status"
          options={FACETS.status}
          value={filters.status as string[] | undefined}
          onChange={(v) => set("status", v as Status[])}
        />
      )}
      {show("emergencial") && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => set("emergencial", filters.emergencial ? null : true)}
          className={cn(
            "h-8 rounded-sm border border-border bg-surface hover:bg-green-100/60 px-3 text-xs gap-1.5 text-ink-900",
            filters.emergencial && "border-danger text-danger bg-danger/10 font-semibold",
          )}
        >
          <span
            className={cn("h-2 w-2 rounded-full", filters.emergencial ? "bg-danger" : "bg-ink-400")}
          />
          Emergencial
        </Button>
      )}

      {totalActive > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({})}
          className="h-8 rounded-sm px-3 text-xs text-ink-600 hover:text-ink-900 gap-1"
        >
          <X className="h-3 w-3" />
          Limpar ({totalActive})
        </Button>
      )}
    </div>
  );
}
