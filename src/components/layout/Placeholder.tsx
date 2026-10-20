import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";

export function PlaceholderRoute({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md bg-surface border border-border shadow-card p-6 sm:p-10 text-center max-w-2xl mx-auto mt-4 sm:mt-10 animate-fade-in">
      <div className="h-12 w-12 mx-auto rounded-sm bg-green-100 grid place-items-center text-green-700 mb-4">
        <Construction className="h-5 w-5" />
      </div>
      <h1 className="text-2xl font-display font-bold text-ink-900 tracking-tight">{title}</h1>
      <p className="mt-2 text-sm font-sans text-ink-600">{description}</p>
      <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg border border-border text-[11px] font-mono text-ink-600">
        <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
        Em desenvolvimento · próxima release
      </div>
    </div>
  );
}

// Placeholder export to satisfy any direct import (not used by router)
export const _Route = createFileRoute;
