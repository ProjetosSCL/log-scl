import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderRoute } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/prestadores")({
  head: () => ({
    meta: [
      { title: "Prestadores · FieldOps" },
      { name: "description", content: "Performance, backlog e ranking de prestadores ativos." },
      { property: "og:title", content: "Prestadores · FieldOps" },
      { property: "og:description", content: "Performance, backlog e ranking de prestadores ativos." },
    ],
  }),
  component: () => (
    <PlaceholderRoute title="Prestadores" description="Performance, backlog e ranking de prestadores ativos." />
  ),
});
