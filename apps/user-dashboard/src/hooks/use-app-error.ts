import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { AppError } from '@/errors/app-error';
import { errorReporter } from '@/errors/error-reporter';
import { normalizeError, type NormalizeErrorOptions } from '@/errors/normalize-error';

export interface UseAppErrorOptions {
  onError?: (error: AppError) => void;
  report?: boolean;
}

export function useAppError({ onError, report = true }: UseAppErrorOptions = {}) {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback(
    (cause: unknown, options?: NormalizeErrorOptions): AppError => {
      const appError = normalizeError(cause, options);
      setError(appError);
      if (report) errorReporter.captureError(appError);
      onError?.(appError);
      return appError;
    },
    [onError, report],
  );

  const clearError = useCallback(() => setError(null), []);

  const showErrorToast = useCallback(
    (cause: unknown, options?: NormalizeErrorOptions): AppError => {
      const appError = handleError(cause, options);
      toast.error(appError.userMessage);
      return appError;
    },
    [handleError],
  );

  return { clearError, error, handleError, showErrorToast } as const;
}
