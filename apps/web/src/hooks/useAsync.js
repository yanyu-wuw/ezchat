import { useState, useCallback } from "react";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(asyncFunction: () => Promise<T>) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
      return response;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  }, [asyncFunction]);

  return { ...state, execute };
}
