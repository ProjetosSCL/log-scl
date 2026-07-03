import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import {
  Camera,
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Share2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PivotTable } from "@/components/dashboard/PivotTable";
import { applyFilters, useDataset, type Filters, type OS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Pair {
  contratante: string;
  prestador: string;
  count: number;
  key: string;
  filename: string;
}

interface Generated extends Pair {
  dataUrl: string;
  blob: Blob;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  filters: Filters;
}

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function BatchExportDialog({ open, onOpenChange, filters }: Props) {
  const { all } = useDataset();
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);

  const pairs = useMemo<Pair[]>(() => {
    const m = new Map<string, Pair>();
    filtered.forEach((o) => {
      if (!o.contratante || !o.prestador) return;
      const key = `${o.contratante}||${o.prestador}`;
      const cur = m.get(key);
      if (cur) cur.count++;
      else
        m.set(key, {
          contratante: o.contratante,
          prestador: o.prestador,
          count: 1,
          key,
          filename: `${slug(o.contratante)}-${slug(o.prestador)}-${today()}.png`,
        });
    });
    return [...m.values()].sort(
      (a, b) =>
        a.contratante.localeCompare(b.contratante) ||
        a.prestador.localeCompare(b.prestador),
    );
  }, [filtered]);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<{ i: number; n: number } | null>(null);
  const [generated, setGenerated] = useState<Generated[]>([]);
  const [renderPair, setRenderPair] = useState<Pair | null>(null);
  const [shareStep, setShareStep] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  // Initialize selection when pairs change or dialog opens
  useEffect(() => {
    if (open) {
      const init: Record<string, boolean> = {};
      pairs.forEach((p) => (init[p.key] = true));
      setSelected(init);
      setGenerated([]);
      setProgress(null);
      setShareStep(null);
    }
  }, [open, pairs]);

  const selectedPairs = pairs.filter((p) => selected[p.key]);

  const capture = async (pair: Pair): Promise<Generated | null> => {
    setRenderPair(pair);
    // wait 2 frames for layout
    await new Promise<void>((res) => {
      resolveRef.current = res;
      requestAnimationFrame(() => requestAnimationFrame(() => res()));
    });
    // extra tick for fonts/images
    await new Promise((r) => setTimeout(r, 60));
    const el = captureRef.current;
    if (!el) return null;
    try {
      const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: bg,
      });
      const blob = await (await fetch(dataUrl)).blob();
      return { ...pair, dataUrl, blob };
    } catch (e) {
      console.error("Falha capturando", pair, e);
      return null;
    }
  };

  const runGenerate = async () => {
    setGenerated([]);
    const out: Generated[] = [];
    for (let i = 0; i < selectedPairs.length; i++) {
      setProgress({ i: i + 1, n: selectedPairs.length });
      const g = await capture(selectedPairs[i]);
      if (g) out.push(g);
    }
    setRenderPair(null);
    setProgress(null);
    setGenerated(out);
  };

  const canWebShareFiles = () => {
    if (typeof navigator === "undefined") return false;
    if (!("canShare" in navigator) || !navigator.share) return false;
    try {
      const testFile = new File(["x"], "x.png", { type: "image/png" });
      return navigator.canShare({ files: [testFile] });
    } catch {
      return false;
    }
  };

  const shareWhatsApp = async () => {
    if (generated.length === 0) return;
    const files = generated.map(
      (g) => new File([g.blob], g.filename, { type: "image/png" }),
    );
    if (canWebShareFiles()) {
      try {
        await navigator.share({
          files,
          title: "Prints operacionais",
          text: `Prints diários — ${today()}`,
        });
        return;
      } catch (e) {
        // user cancelled or share failed → fallback
        console.warn("Share cancelado/erro", e);
      }
    }
    // Desktop: step-by-step assistant
    setShareStep(0);
    await copyToClipboard(0);
  };

  const copyToClipboard = async (idx: number) => {
    const g = generated[idx];
    if (!g) return;
    try {
      const item = new ClipboardItem({ "image/png": g.blob });
      await navigator.clipboard.write([item]);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((v) => (v === idx ? null : v)), 1500);
    } catch (e) {
      console.error("Clipboard falhou", e);
    }
  };

  const downloadOne = (g: Generated) => {
    const link = document.createElement("a");
    link.download = g.filename;
    link.href = g.dataUrl;
    link.click();
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    generated.forEach((g) => zip.file(g.filename, g.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `prints-${today()}.zip`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const captureFilters: Filters = renderPair
    ? {
        ...filters,
        contratante: [renderPair.contratante],
        prestador: [renderPair.prestador],
      }
    : filters;

  const busy = progress !== null;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Prints diários por Contratante × Prestador
            </DialogTitle>
            <DialogDescription>
              {pairs.length} combinações detectadas nos dados filtrados. Desmarque as que
              não quiser exportar.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-auto -mx-6 px-6">
            {shareStep === null ? (
              <div className="space-y-1.5">
                {pairs.length === 0 && (
                  <div className="text-sm text-muted-foreground py-8 text-center">
                    Nenhuma combinação encontrada com os filtros atuais.
                  </div>
                )}
                {pairs.map((p) => {
                  const g = generated.find((x) => x.key === p.key);
                  const sel = !!selected[p.key];
                  return (
                    <label
                      key={p.key}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 cursor-pointer transition-colors",
                        sel ? "bg-secondary/60" : "bg-transparent opacity-60",
                        busy && "cursor-wait",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={sel}
                        disabled={busy}
                        onChange={(e) =>
                          setSelected((s) => ({ ...s, [p.key]: e.target.checked }))
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {p.contratante}{" "}
                          <span className="text-muted-foreground">—</span>{" "}
                          {p.prestador}
                        </div>
                        <div className="text-[11px] text-muted-foreground tabular-nums">
                          {p.count} OS · {p.filename}
                        </div>
                      </div>
                      {g && (
                        <img
                          src={g.dataUrl}
                          alt=""
                          className="h-10 w-16 object-cover rounded border border-border/60"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              <ShareAssistant
                generated={generated}
                step={shareStep}
                setStep={setShareStep}
                copyToClipboard={copyToClipboard}
                downloadOne={downloadOne}
                copiedIdx={copiedIdx}
              />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/60">
            {progress ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando {progress.i} de {progress.n}…
              </div>
            ) : shareStep !== null ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareStep(null)}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Voltar
              </Button>
            ) : generated.length === 0 ? (
              <>
                <div className="text-xs text-muted-foreground flex-1">
                  {selectedPairs.length} selecionado(s)
                </div>
                <Button
                  onClick={runGenerate}
                  disabled={selectedPairs.length === 0}
                  className="gap-1.5"
                  size="sm"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Gerar prints
                </Button>
              </>
            ) : (
              <>
                <div className="text-xs text-muted-foreground flex-1">
                  {generated.length} imagem(ns) prontas
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadZip}
                  className="gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Baixar .zip
                </Button>
                <Button size="sm" onClick={shareWhatsApp} className="gap-1.5">
                  <Share2 className="h-3.5 w-3.5" />
                  Compartilhar no WhatsApp
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Off-screen render target for capture */}
      {renderPair &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: -100000,
              top: 0,
              width: 1280,
              pointerEvents: "none",
            }}
            aria-hidden
          >
            <div
              ref={captureRef}
              style={{ width: 1280, background: "var(--background)", padding: 16 }}
            >
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {renderPair.contratante} — {renderPair.prestador}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {today()} · {renderPair.count} OS
                </div>
              </div>
              <PivotTable
                filters={captureFilters}
                onCellClick={() => {}}
                zoom={100}
                compact={false}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function ShareAssistant({
  generated,
  step,
  setStep,
  copyToClipboard,
  downloadOne,
  copiedIdx,
}: {
  generated: Generated[];
  step: number;
  setStep: (n: number | null) => void;
  copyToClipboard: (i: number) => void;
  downloadOne: (g: Generated) => void;
  copiedIdx: number | null;
}) {
  const g = generated[step];
  if (!g) return null;
  const isLast = step === generated.length - 1;
  return (
    <div className="space-y-4 py-2">
      <div className="text-sm text-muted-foreground">
        Imagem {step + 1} de {generated.length} — copiada para a área de transferência.
        Abra o WhatsApp Web, entre no chat e cole com{" "}
        <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">Ctrl</kbd>
        +
        <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">V</kbd>.
      </div>

      <div className="rounded-lg border border-border/60 p-3 bg-secondary/40">
        <div className="text-sm font-semibold mb-2">
          {g.contratante} — {g.prestador}
        </div>
        <img
          src={g.dataUrl}
          alt={g.filename}
          className="w-full rounded border border-border/60 bg-background"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => copyToClipboard(step)}
          className="gap-1.5"
        >
          {copiedIdx === step ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copiado
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copiar novamente
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => downloadOne(g)}
          className="gap-1.5"
        >
          <Download className="h-3.5 w-3.5" /> Baixar
        </Button>
        <a
          href="https://web.whatsapp.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Abrir WhatsApp Web
        </a>
        <div className="flex-1" />
        {step > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setStep(step - 1)}>
            Anterior
          </Button>
        )}
        {!isLast ? (
          <Button
            size="sm"
            onClick={() => {
              setStep(step + 1);
              copyToClipboard(step + 1);
            }}
          >
            Próxima →
          </Button>
        ) : (
          <Button size="sm" onClick={() => setStep(null)}>
            Concluir
          </Button>
        )}
      </div>
    </div>
  );
}
