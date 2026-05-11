import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderRoute } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/indicadores")({
  head: () => ({
    meta: [
      { title: "Indicadores · FieldOps" },
      { name: "description", content: "Painel completo de KPIs operacionais e de campo." },
      { property: "og:title", content: "Indicadores · FieldOps" },
      { property: "og:description", content: "Painel completo de KPIs operacionais e de campo." },
    ],
  }),
  component: () => (
    <PlaceholderRoute title="Indicadores" description="Painel completo de KPIs operacionais e de campo." />
  ),
});
