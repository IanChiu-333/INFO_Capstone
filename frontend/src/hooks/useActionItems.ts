import { useEffect, useState } from 'react';
import { internService } from '../services';
import type { ActionItem } from '../services';

export function useActionItems() {
  const [items, setItems]     = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<Error | null>(null);

  useEffect(() => {
    internService.getActionItems()
      .then(setItems)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}
