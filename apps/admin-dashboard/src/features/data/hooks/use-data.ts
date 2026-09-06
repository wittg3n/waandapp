import { useCallback, useEffect, useState } from 'react';

interface QueryState<T> {
  data: T | null;
  error: string | null;
}

export function useDataQuery<T>(load: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<QueryState<T>>({ data: null, error: null });

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

  return {
    ...state,
    loading: enabled && state.data === null && state.error === null,
    refetch: useCallback(() => setVersion((value) => value + 1), []),
  };
}
