import { useCallback, useEffect, useState } from 'react';

import {
  dashboardRepository,
  type DashboardSnapshot,
} from '@/features/dashboard/services/dashboard-repository';

export function useDashboard() {
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    dashboardRepository.get(controller.signal).then(
      (snapshot) => {
        setData(snapshot);
        setError(null);
      },
      (reason: unknown) => {
        if (!controller.signal.aborted) {
          setData(null);
          setError(reason instanceof Error ? reason.message : 'خطای ناشناخته');
        }
      },
    );
    return () => controller.abort();
  }, [version]);

  return {
    data,
    error,
    loading: data === null && error === null,
    refetch: useCallback(() => setVersion((value) => value + 1), []),
  };
}
