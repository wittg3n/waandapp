import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useListPage() {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => {
    const value = new URLSearchParams(params);
    if (!value.has('page')) value.set('page', '1');
    if (!value.has('pageSize')) value.set('pageSize', '20');
    return value.toString();
  }, [params]);

  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  }

  return {
    params: new URLSearchParams(query),
    query,
    change,
    reset: () => setParams({}),
    changePage: (page: number) => change('page', String(page)),
  };
}
