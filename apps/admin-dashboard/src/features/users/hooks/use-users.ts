import { useCallback, useEffect, useState } from 'react';

import { usersRepository } from '@/features/users/services/users-repository';
import type { UserAuditResult, UserDetail, UsersResult } from '@/features/users/types/users.types';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
}

function useRequest<T>(load: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null });

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    load(controller.signal).then(
      (data) => setState({ data, error: null }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ data: null, error: error instanceof Error ? error.message : 'خطای ناشناخته' });
        }
      },
    );
    return () => controller.abort();
  }, [enabled, load, version]);

  const refetch = useCallback(() => setVersion((value) => value + 1), []);
  return { ...state, loading: enabled && state.data === null && state.error === null, refetch };
}

export { useAdminSession } from '@/features/authentication/admin-session-context';

export function useUsers(query: string, enabled: boolean) {
  const load = useCallback(
    (signal: AbortSignal) => usersRepository.list(new URLSearchParams(query), signal),
    [query],
  );
  return useRequest<UsersResult>(load, enabled);
}

export function useUserDetail(userId: string | undefined, enabled: boolean) {
  const load = useCallback(
    (signal: AbortSignal) => usersRepository.get(userId as string, signal),
    [userId],
  );
  return useRequest<UserDetail>(load, enabled && Boolean(userId));
}

export function useUserAudit(userId: string | undefined, enabled: boolean) {
  const load = useCallback(
    (signal: AbortSignal) => usersRepository.audit(userId as string, signal),
    [userId],
  );
  return useRequest<UserAuditResult>(load, enabled && Boolean(userId));
}
