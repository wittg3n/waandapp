import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/features/auth/auth-context';
import type { AuthStatus } from '@/features/auth/types';

const destinationByStatus: Record<AuthStatus, string> = {
  unauthenticated: '/login',
  'needs-onboarding': '/onboarding',
  onboarded: '/dashboard',
};

export function AuthGuard({ allowed }: { allowed: readonly AuthStatus[] }) {
  const { status } = useAuth();

  if (allowed.includes(status)) return <Outlet />;

  return <Navigate replace to={destinationByStatus[status]} />;
}

export function AuthHomeRedirect() {
  const { status } = useAuth();
  return <Navigate replace to={destinationByStatus[status]} />;
}
