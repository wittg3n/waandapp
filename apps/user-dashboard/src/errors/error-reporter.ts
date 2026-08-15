import type { AppError } from '@/errors/app-error';

export type ErrorContext = Record<string, unknown>;

export interface ErrorReporter {
  captureError(error: AppError, context?: ErrorContext): void;
  captureMessage(message: string, context?: ErrorContext): void;
  setContext(context: ErrorContext): void;
}

class ConsoleErrorReporter implements ErrorReporter {
  private context: ErrorContext = {};

  captureError(error: AppError, context: ErrorContext = {}): void {
    console.error('[Waand]', error, { ...this.context, ...context });
  }

  captureMessage(message: string, context: ErrorContext = {}): void {
    console.error('[Waand]', message, { ...this.context, ...context });
  }

  setContext(context: ErrorContext): void {
    this.context = { ...this.context, ...context };
  }
}

const noopReporter: ErrorReporter = {
  captureError() {},
  captureMessage() {},
  setContext() {},
};

let activeReporter: ErrorReporter = import.meta.env.DEV ? new ConsoleErrorReporter() : noopReporter;

export const errorReporter: ErrorReporter = {
  captureError: (error, context) => activeReporter.captureError(error, context),
  captureMessage: (message, context) => activeReporter.captureMessage(message, context),
  setContext: (context) => activeReporter.setContext(context),
};

export function setErrorReporter(reporter: ErrorReporter): void {
  activeReporter = reporter;
}
