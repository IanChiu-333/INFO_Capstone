import { useEffect, useState } from 'react';
import { internService } from '../services';
import type { PerformanceReview } from '../services';

export function usePerformanceReviews() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<Error | null>(null);

  useEffect(() => {
    internService.getPerformanceReviews()
      .then(setReviews)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  return { reviews, loading, error };
}
