import { useEffect, useState } from 'react';
import { internService } from '../services';
import type { Intern } from '../services';

export function useInterns() {
  const [interns, setInterns]   = useState<Intern[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<Error | null>(null);

  useEffect(() => {
    internService.getInterns()
      .then(setInterns)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  return { interns, loading, error };
}
