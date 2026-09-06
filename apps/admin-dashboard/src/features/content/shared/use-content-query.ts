import { useCallback, useEffect, useState } from 'react';

export function useContentQuery<T>(load: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    load(controller.signal).then(
      (value) => {
        setData(value);
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
  }, [enabled, load, version]);

  return {
    data,
    error,
    loading: enabled && data === null && error === null,
    refetch: useCallback(() => setVersion((value) => value + 1), []),
  };
}
