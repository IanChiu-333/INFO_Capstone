import { useEffect, useState, useCallback } from 'react';
import { internService } from '../services';
import type { Intern } from '../services';

export function useInterns() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<Error | null>(null);

  useEffect(() => {
    internService.getInterns()
      .then(setInterns)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  const addIntern = useCallback(async (intern: Intern) => {
    await internService.addIntern(intern);
    setInterns(prev => [intern, ...prev]);
  }, []);

  const updateIntern = useCallback(async (updated: Intern) => {
    await internService.updateIntern(updated);
    setInterns(prev => prev.map(i => i.internId === updated.internId ? updated : i));
  }, []);

  const deleteIntern = useCallback(async (id: string) => {
    await internService.deleteIntern(id);
    setInterns(prev => prev.filter(i => i.internId !== id));
  }, []);

  return { interns, loading, error, addIntern, updateIntern, deleteIntern };
}
