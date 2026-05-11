import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  resetDataset,
  setDataset,
  useDataset,
  type RawRow,
} from "@/lib/mock-data";
import { parseRelatorioCsv, type ParseResult } from "@/lib/csv-import";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios · FieldOps" },
      { name: "description", content: "Importação de relatórios CSV de OS para atualizar a operação." },
      { property: "og:title", content: "Relatórios · FieldOps" },
      { property: "og:description", content: "Atualize sua base operacional importando relatórios CSV." },
    ],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dataset = useDataset();
  const [pending, setPending] = useState<{
    fileName: string;
    parsed: ParseResult;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = parseRelatorioCsv(text);
      setPending({ fileName: file.name, parsed });
      if (parsed.errors.length) {
        toast.warning("Arquivo lido com avisos", { description: parsed.errors.join(" · ") });
      } else {
        toast.success(`${parsed.rows.length} linhas prontas para aplicar`);
      }
    } catch (e) {
      toast.error("Não foi possível ler o arquivo", { description: String(e) });
    } finally {
      setBusy(false);
    }
  };

  const apply = (rows: RawRow[]) => {
    setDataset(rows);
    setPending(null);
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Base operacional atualizada", {
      description: `${rows.length} OS carregadas. O dashboard agora reflete o novo arquivo.`,
    });
  };

  const reset = () => {
    resetDataset();
    setPending(null);
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Base restaurada para o dataset inicial");
  };

  const importedAt = dataset.importedAt
    ? new Date(dataset.importedAt).toLocaleString("pt-BR")
    : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl glass p-5 flex flex-wrap items-start gap-4 justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Relatórios
          </div>
          <h1 className="text-xl font-semibold tracking-tight mt-1">
            Importação de Base Operacional
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Importe seu CSV de OS sempre que precisar atualizar os dados. O arquivo é
            processado localmente e fica salvo no navegador para todas as visualizações.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={
                "h-2 w-2 rounded-full " +
                (dataset.source === "import"
                  ? "bg-primary shadow-[0_0_8px_var(--primary)]"
                  : "bg-muted-foreground/50")
              }
            />
            <span className="text-muted-foreground">
              Fonte: {dataset.source === "import" ? "CSV importado" : "Dataset inicial"}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground tabular-nums">
            {dataset.rowCount.toLocaleString("pt-BR")} OS na base
            {importedAt ? ` · atualizado em ${importedAt}` : ""}
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={
            "rounded-2xl glass p-10 text-center transition-all border-2 border-dashed " +
            (dragOver
              ? "border-primary/60 bg-primary/5 shadow-[0_0_0_4px_var(--primary)/10]"
              : "border-border/60")
          }
        >
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center glow-primary">
            <Upload className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="mt-4 text-base font-semibold">Arraste o arquivo CSV aqui</div>
          <div className="text-xs text-muted-foreground mt-1">
            ou selecione manualmente · separadores aceitos: ; , tab |
          </div>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Selecionar arquivo CSV
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            Colunas reconhecidas: Chamado, Status, Contratante, Cliente, Cidade, UF,
            Prestador, Técnico, Data Abertura, Data Limite, Data Atendimento,
            Emergencial, etc.
          </div>
        </div>

        <div className="rounded-2xl glass p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">Base ativa</div>
          </div>
          <div className="text-[11px] text-muted-foreground space-y-1.5">
            <Row label="OS" value={dataset.rowCount.toLocaleString("pt-BR")} />
            <Row label="Cidades" value={String(dataset.facets.cidades.length)} />
            <Row label="Prestadores" value={String(dataset.facets.prestadores.length)} />
            <Row label="Contratantes" value={String(dataset.facets.contratantes.length)} />
            <Row label="UFs" value={String(dataset.facets.estados.length)} />
            <Row
              label="Referência"
              value={dataset.refToday.toLocaleDateString("pt-BR")}
            />
          </div>
          {dataset.source === "import" && (
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="w-full gap-2 mt-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar dataset inicial
            </Button>
          )}
        </div>
      </div>

      {/* Pending preview */}
      {pending && (
        <div className="rounded-2xl glass p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                {pending.parsed.errors.length ? (
                  <AlertCircle className="h-4 w-4 text-status-warning" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-status-healthy" />
                )}
                Pré-visualização — {pending.fileName}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {pending.parsed.rows.length} linhas válidas detectadas
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPending(null)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={!pending.parsed.rows.length}
                onClick={() => apply(pending.parsed.rows)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Aplicar atualização
              </Button>
            </div>
          </div>

          {pending.parsed.errors.length > 0 && (
            <div className="rounded-xl border border-status-warning/40 bg-status-warning/10 p-3 text-xs text-status-warning">
              {pending.parsed.errors.map((e, i) => (
                <div key={i}>· {e}</div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px]">
            {Object.entries(pending.parsed.detectedColumns).map(([k, v]) => (
              <div
                key={k}
                className="rounded-lg border border-border/60 bg-secondary/40 px-2.5 py-1.5"
              >
                <div className="text-muted-foreground">{k}</div>
                <div className="font-medium truncate">{v}</div>
              </div>
            ))}
          </div>

          <div className="overflow-auto rounded-xl border border-border/60 max-h-[280px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-background/70 backdrop-blur">
                <tr className="text-left text-muted-foreground">
                  {["Chamado", "Status", "Contratante", "Prestador", "Cliente", "Cidade", "UF", "Limite"].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.parsed.rows.slice(0, 25).map((r) => (
                  <tr key={r.numero} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono">{r.numero}</td>
                    <td className="px-3 py-1.5">{r.status}</td>
                    <td className="px-3 py-1.5">{r.contratante}</td>
                    <td className="px-3 py-1.5">{r.prestador}</td>
                    <td className="px-3 py-1.5 truncate max-w-[160px]">{r.cliente}</td>
                    <td className="px-3 py-1.5">{r.cidade}</td>
                    <td className="px-3 py-1.5">{r.estado}</td>
                    <td className="px-3 py-1.5 tabular-nums">
                      {r.dataLimite ? new Date(r.dataLimite).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 last:border-0 py-1">
      <span>{label}</span>
      <span className="font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}
