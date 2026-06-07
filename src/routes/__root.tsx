import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { TrackingProvider } from "@/components/TrackingProvider";
import { SeoProvider } from "@/components/SeoProvider";
import { trackEvent } from "@/lib/tracking";
import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useRouter().state.location;

  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Si on est sur le sous-domaine admin mais pas sur la route /admin ni /login, on redirige
    if (hostname.startsWith('admin.') && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/login')) {
      window.location.replace('/admin');
      return;
    }
    
    // Si on est sur le domaine principal et qu'on essaie d'accéder à /admin, on redirige vers le sous-domaine
    if ((hostname === 'technovalearning.com' || hostname === 'www.technovalearning.com') && location.pathname.startsWith('/admin')) {
      window.location.replace(`https://admin.technovalearning.com${location.pathname}`);
      return;
    }

    if (!location.pathname.startsWith('/admin')) {
      trackEvent('PageView');
    }
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <TrackingProvider />
      <SeoProvider />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
