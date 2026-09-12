import { createContext, useContext } from 'react';
import type { AdminSnapshot } from './admin-api';
export const SessionContext = createContext<{
  data: AdminSnapshot | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} | null>(null);
export function useAdminSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('Admin session provider is required.');
  return session;
}
