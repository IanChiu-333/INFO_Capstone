import { useEffect, useState } from 'react';
import { internService } from '../services';
import type { FTEConversionRecord } from '../services';

export function useFTEConversions() {
  const [conversions, setConversions] = useState<FTEConversionRecord[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<Error | null>(null);

  useEffect(() => {
    internService.getFTEConversions()
      .then(setConversions)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  return { conversions, loading, error };
}
