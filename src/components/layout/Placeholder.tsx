import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";

export function PlaceholderRoute({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl glass p-10 text-center max-w-2xl mx-auto mt-10 animate-fade-in">
      <div className="h-12 w-12 mx-auto rounded-xl glass grid place-items-center text-primary glow-primary mb-4">
        <Construction className="h-5 w-5" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
        Em desenvolvimento · próxima release
      </div>
    </div>
  );
}

// Placeholder export to satisfy any direct import (not used by router)
export const _Route = createFileRoute;
