import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * usePolling — repeatedly calls fetchFn on a given interval.
 *
 * @param {Function} fetchFn   — async function returning data
 * @param {number}   interval  — poll interval in ms (default 30000)
 * @returns {{ data, loading, error, lastUpdated, refetch }}
 */
const usePolling = (fetchFn, interval = 30000) => {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef  = useRef(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    try {
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result);
        setError(null);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn]);

  useEffect(() => {
    mountedRef.current = true;

    // First fetch immediately
    execute();

    // Then poll
    timerRef.current = setInterval(execute, interval);

    return () => {
      mountedRef.current = false;
      clearInterval(timerRef.current);
    };
  }, [execute, interval]);

  return { data, loading, error, lastUpdated, refetch: execute };
};

export default usePolling;
