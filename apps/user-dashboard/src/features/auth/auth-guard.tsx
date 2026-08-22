import { LoaderCircle } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/features/auth/auth-context';
import {
  destinationForAuthState,
  resolveAuthRoute,
  type AuthRouteArea,
} from '@/features/auth/auth-routing';

function AuthLoadingScreen() {
  return (
    <main
      aria-live="polite"
      className="grid min-h-dvh place-items-center bg-background text-muted-foreground"
      dir="rtl"
      lang="fa"
      role="status"
    >
      <span className="inline-flex items-center gap-2">
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-primary" />
        در حال بررسی نشست…
      </span>
    </main>
  );
}

export function AuthGuard({ area }: { area: AuthRouteArea }) {
  const { state } = useAuth();
  const resolution = resolveAuthRoute(state, area);

  if (resolution.type === 'loading') return <AuthLoadingScreen />;
  if (resolution.type === 'allow') return <Outlet />;

  return <Navigate replace to={resolution.to} />;
}

export function AuthHomeRedirect() {
  const { state } = useAuth();
  if (state.status === 'loading') return <AuthLoadingScreen />;
  return <Navigate replace to={destinationForAuthState(state)} />;
}
