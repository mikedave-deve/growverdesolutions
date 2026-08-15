import { useEffect, useState, useCallback } from "react";

// Standardizes loading / error / empty / data handling for any service
// call so every page gets consistent states for free.
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  const run = useCallback(() => {
    setState({ status: "loading", data: null, error: null });
    fn()
      .then((data) => setState({ status: "success", data, error: null }))
      .catch((error) => setState({ status: "error", data: null, error }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { ...state, retry: run };
}
