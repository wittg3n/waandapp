import { getErrorDefinition } from '@/errors/error-catalog';
import type { ErrorCode } from '@/errors/error-codes';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export type ErrorSource =
  | 'validation'
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'server'
  | 'client'
  | 'route'
  | 'unknown';

export interface AppErrorOptions {
  message?: string;
  userMessage?: string;
  severity?: ErrorSeverity;
  source?: ErrorSource;
  statusCode?: number;
  fieldErrors?: Record<string, string[]>;
  retryable?: boolean;
  cause?: unknown;
  context?: Record<string, unknown>;
  timestamp?: string;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly userMessage: string;
  readonly severity: ErrorSeverity;
  readonly source: ErrorSource;
  readonly statusCode?: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly retryable: boolean;
  readonly context?: Record<string, unknown>;
  readonly timestamp: string;

  constructor(code: ErrorCode, options: AppErrorOptions = {}) {
    const definition = getErrorDefinition(code);

    super(options.message ?? code, { cause: options.cause });

    this.name = 'AppError';
    this.code = code;
    this.userMessage = options.userMessage ?? definition.userMessage;
    this.severity = options.severity ?? definition.severity;
    this.source = options.source ?? definition.source;
    this.statusCode = options.statusCode;
    this.fieldErrors = options.fieldErrors;
    this.retryable = options.retryable ?? definition.retryable;
    this.context = options.context;
    this.timestamp = options.timestamp ?? new Date().toISOString();
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
