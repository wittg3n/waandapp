import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getAdminSnapshot, type AdminSnapshot } from './admin-api';
import AdminLogin from './admin-login';
import { canAccessRoute } from './permissions';

import { SessionContext, useAdminSession } from './admin-session-context';

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const refetch = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    let current = true;
    getAdminSnapshot()
      .then(
        (snapshot) => {
          if (current) {
            setData(snapshot);
            setError(null);
          }
        },
        (cause: unknown) => {
          if (current) {
            setData(null);
            setError(cause instanceof Error ? cause.message : 'اتصال برقرار نشد.');
          }
        },
      )
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [version]);
  useEffect(() => {
    const expired = () => {
      setData({ user: null });
      refetch();
    };
    const visible = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    window.addEventListener('focus', refetch);
    window.addEventListener('waand-admin-refresh', refetch);
    window.addEventListener('waand-admin-expired', expired);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.removeEventListener('focus', refetch);
      window.removeEventListener('waand-admin-refresh', refetch);
      window.removeEventListener('waand-admin-expired', expired);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [refetch]);
  return (
    <SessionContext.Provider value={{ data, loading, error, refetch }}>
      {children}
    </SessionContext.Provider>
  );
}
export function AdminGate({ children }: { children: ReactNode }) {
  const session = useAdminSession();
  const { pathname } = useLocation();
  if (session.loading)
    return (
      <p className="p-8" role="status">
        در حال بررسی نشست…
      </p>
    );
  if (session.error)
    return (
      <div className="p-8" role="alert">
        {session.error}
        <button className="m-4 underline" onClick={session.refetch}>
          تلاش دوباره
        </button>
      </div>
    );
  if (!session.data?.user) return <AdminLogin />;
  if (!canAccessRoute(pathname, session.data.user.permissions))
    return (
      <div className="p-8" role="alert">
        به این صفحه دسترسی ندارید.{' '}
        <a className="underline" href="/dashboard">
          داشبورد
        </a>
      </div>
    );
  return children;
}
