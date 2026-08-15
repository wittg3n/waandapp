import { useEffect, useMemo } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';

import { ErrorState, type ErrorStateVariant } from '@/components/errors/error-state';
import { getErrorDefinition } from '@/errors/error-catalog';
import { ERROR_CODES, type ErrorCode } from '@/errors/error-codes';
import { errorReporter } from '@/errors/error-reporter';
import { normalizeError } from '@/errors/normalize-error';

export interface RouteErrorPageProps {
  error?: unknown;
  homePath?: string;
  retry?: () => void;
}

function getVariant(code: ErrorCode): ErrorStateVariant {
  if (code === ERROR_CODES.NOT_FOUND) return 'not-found';
  if (code === ERROR_CODES.NETWORK_ERROR || code === ERROR_CODES.NETWORK_TIMEOUT) {
    return 'network';
  }
  if (code === ERROR_CODES.CLIENT_ERROR || code === ERROR_CODES.SERVER_ERROR) return 'critical';
  return 'default';
}

export function RouteErrorPage({ error, homePath = '/', retry }: RouteErrorPageProps) {
  const routeError = useRouteError();
  const navigate = useNavigate();
  const appError = useMemo(
    () => normalizeError(error ?? routeError, { source: 'route' }),
    [error, routeError],
  );
  const definition = getErrorDefinition(appError.code);

  useEffect(() => {
    if (appError.code !== ERROR_CODES.NOT_FOUND) errorReporter.captureError(appError);
  }, [appError]);

  return (
    <main className="grid min-h-[100svh] place-items-center bg-[#f7f8fa] p-4">
      <ErrorState
        description={appError.userMessage}
        goBack={() => navigate(-1)}
        goHome={() => navigate(homePath)}
        retry={appError.retryable ? (retry ?? (() => window.location.reload())) : undefined}
        title={definition.title}
        variant={getVariant(appError.code)}
      />
    </main>
  );
}
