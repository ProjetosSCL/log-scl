import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderRoute } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/os-criticas")({
  head: () => ({
    meta: [
      { title: "OS Críticas · FieldOps" },
      {
        name: "description",
        content: "Lista priorizada de OS vencidas, vence hoje e emergenciais.",
      },
      { property: "og:title", content: "OS Críticas · FieldOps" },
      {
        property: "og:description",
        content: "Lista priorizada de OS vencidas, vence hoje e emergenciais.",
      },
    ],
  }),
  component: () => (
    <PlaceholderRoute
      title="OS Críticas"
      description="Lista priorizada de OS vencidas, vence hoje e emergenciais."
    />
  ),
});
