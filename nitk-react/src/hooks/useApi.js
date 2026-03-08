import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for data fetching with loading/error states.
 * @param {Function} fetchFn  – async function returning data
 * @param {Array} deps        – dependency array (re-fetches when deps change)
 * @param {object} opts       – { immediate: true } to fetch on mount (default true)
 */
export function useApi(fetchFn, deps = [], opts = {}) {
  const { immediate = true } = opts;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      if (mountedRef.current) setData(result);
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.response?.data?.error || err.message || 'Something went wrong');
      }
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) fetch();
    return () => { mountedRef.current = false; };
  }, [fetch, immediate]);

  return { data, loading, error, refetch: fetch, setData };
}

/**
 * Hook for mutation operations (POST, PATCH, DELETE) — no auto-fetch.
 */
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(...args);
      return result;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Operation failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, loading, error };
}
