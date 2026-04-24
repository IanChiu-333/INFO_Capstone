import { useEffect, useState } from 'react';
import { internService } from '../services';
import type { ProgramMetrics } from '../services';

export function useMetrics() {
  const [metrics, setMetrics]   = useState<ProgramMetrics | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<Error | null>(null);

  useEffect(() => {
    internService.getMetrics()
      .then(setMetrics)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  return { metrics, loading, error };
}
