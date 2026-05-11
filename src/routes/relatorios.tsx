import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderRoute } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios · FieldOps" },
      { name: "description", content: "Relatórios operacionais exportáveis por período e dimensão." },
      { property: "og:title", content: "Relatórios · FieldOps" },
      { property: "og:description", content: "Relatórios operacionais exportáveis por período e dimensão." },
    ],
  }),
  component: () => (
    <PlaceholderRoute title="Relatórios" description="Relatórios operacionais exportáveis por período e dimensão." />
  ),
});
