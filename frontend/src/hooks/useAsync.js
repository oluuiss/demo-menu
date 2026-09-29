import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async loader and tracks { data, status: 'loading' | 'ready' | 'error', error }.
 * Re-runs whenever `deps` change (e.g. the language, so localized API data is refetched).
 */
export function useAsync(loader, deps) {
  const [state, setState] = useState({ data: null, status: 'loading', error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: s.data ? s.status : 'loading', error: null }));
    loader()
      .then((data) => !cancelled && setState({ data, status: 'ready', error: null }))
      .catch((error) => !cancelled && setState({ data: null, status: 'error', error }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, setData: (data) => setState({ data, status: 'ready', error: null }), reload };
}
