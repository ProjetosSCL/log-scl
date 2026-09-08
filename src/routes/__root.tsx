import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center rounded-sm border border-border bg-surface p-8 shadow-card">
        <h1 className="text-6xl font-display font-extrabold text-green-700">404</h1>
        <h2 className="mt-4 text-xl font-display font-bold text-ink-900">Página não encontrada</h2>
        <p className="mt-2 text-sm text-ink-600 font-sans">
          A rota acessada não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center rounded-sm border border-border bg-surface p-8 shadow-card">
        <h1 className="text-xl font-display font-bold text-ink-900">Erro ao carregar a página</h1>
        <p className="mt-2 text-sm text-ink-600 font-sans">
          Algo deu errado. Tente novamente ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-sm bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-green-100/50"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FieldOps · Central Operacional de OS" },
      {
        name: "description",
        content:
          "Dashboard operacional premium para gestão de Ordens de Serviço, SLA e performance de campo.",
      },
      { name: "author", content: "FieldOps" },
      { property: "og:title", content: "FieldOps · Central Operacional de OS" },
      {
        property: "og:description",
        content: "Plataforma enterprise de field service com visão de SLA em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "FieldOps · Central Operacional de OS" },
      {
        name: "description",
        content:
          "A premium operational dashboard for managing Work Orders (OS) with a modern SaaS enterprise look.",
      },
      {
        property: "og:description",
        content:
          "A premium operational dashboard for managing Work Orders (OS) with a modern SaaS enterprise look.",
      },
      {
        name: "twitter:description",
        content:
          "A premium operational dashboard for managing Work Orders (OS) with a modern SaaS enterprise look.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/714e5699-ac78-4123-ab06-15126c6ca74b/id-preview-c465334c--b4d4e8fe-aef2-4036-95d9-87e5d8e0790f.lovable.app-1778540247962.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/714e5699-ac78-4123-ab06-15126c6ca74b/id-preview-c465334c--b4d4e8fe-aef2-4036-95d9-87e5d8e0790f.lovable.app-1778540247962.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700&family=Sora:wght@600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-full grid-bg">
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <AppHeader />
            <main className="flex-1 p-2 pt-2 md:p-3 md:pt-3">
              <Outlet />
            </main>
          </div>
        </div>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
