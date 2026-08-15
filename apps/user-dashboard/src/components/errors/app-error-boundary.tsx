import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorState } from '@/components/errors/error-state';
import { type AppError } from '@/errors/app-error';
import { getErrorDefinition } from '@/errors/error-catalog';
import { ERROR_CODES } from '@/errors/error-codes';
import { errorReporter } from '@/errors/error-reporter';
import { normalizeError } from '@/errors/normalize-error';

export interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: AppError, reset: () => void) => ReactNode;
  onError?: (error: AppError, info: ErrorInfo) => void;
}

interface AppErrorBoundaryState {
  error: AppError | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      error: normalizeError(error, {
        code: ERROR_CODES.CLIENT_ERROR,
        source: 'client',
        context: { boundary: 'AppErrorBoundary' },
      }),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const appError = this.state.error ?? normalizeError(error, { code: ERROR_CODES.CLIENT_ERROR });
    errorReporter.captureError(appError, { componentStack: info.componentStack });
    this.props.onError?.(appError, info);
  }

  private reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (!error) return children;
    if (fallback) return fallback(error, this.reset);

    const definition = getErrorDefinition(error.code);

    return (
      <main className="grid min-h-[100svh] place-items-center bg-[#f7f8fa] p-4">
        <ErrorState
          description={error.userMessage}
          goHome={() => window.location.assign('/')}
          retry={error.retryable ? this.reset : undefined}
          title={definition.title}
          variant="critical"
        />
      </main>
    );
  }
}
