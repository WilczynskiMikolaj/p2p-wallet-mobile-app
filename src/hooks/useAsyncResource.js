import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { userError } from '../utils/errors';


export function useAsyncResource(key, load, keepDataOnReload = false) {
  const identity = useMemo(() => ({ key, load }), [key, load]);
  const [result, setResult] = useState(
     (null),
  );
  const version = useRef(0);

  const request = useCallback(() => {
    const current = ++version.current;
    if (key === null) return Promise.resolve();
    return load(key).then((data) => {
      if (version.current === current) setResult({ identity, data, error: '', loading: false });
    }).catch((cause) => {
      if (version.current === current) setResult({ identity, data: null, error: userError(cause), loading: false });
    });
  }, [key, load, identity]);

  useEffect(() => {
    void request();
    return () => { version.current += 1; };
  }, [request]);

  const reload = useCallback(async () => {
    if (key === null) return;
    setResult((previous) => ({
      identity,
      data: keepDataOnReload && previous?.identity === identity ? previous.data : null,
      error: '',
      loading: true,
    }));
    await request();
  }, [key, identity, keepDataOnReload, request]);

  const visible = key !== null && result?.identity === identity ? result : null;
  return {
    data: visible?.data ?? null,
    error: visible?.error ?? '',
    loading: key !== null && (!visible || visible.loading),
    reload,
  };
}
