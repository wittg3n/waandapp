import { AppError, type AppErrorOptions, type ErrorSource } from '@/errors/app-error';
import { ERROR_CODES, isErrorCode, type ErrorCode } from '@/errors/error-codes';

type UnknownRecord = Record<string, unknown>;

export type NormalizeErrorOptions = AppErrorOptions & {
  code?: ErrorCode;
};

const statusCodeMap: Record<number, ErrorCode> = {
  400: ERROR_CODES.BAD_REQUEST,
  401: ERROR_CODES.UNAUTHORIZED,
  403: ERROR_CODES.FORBIDDEN,
  404: ERROR_CODES.NOT_FOUND,
  409: ERROR_CODES.CONFLICT,
  422: ERROR_CODES.VALIDATION_ERROR,
  429: ERROR_CODES.RATE_LIMITED,
  500: ERROR_CODES.SERVER_ERROR,
  502: ERROR_CODES.SERVER_ERROR,
  503: ERROR_CODES.SERVICE_UNAVAILABLE,
  504: ERROR_CODES.NETWORK_TIMEOUT,
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function readStatusCode(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;

  const status = error.statusCode ?? error.status;
  return typeof status === 'number' && Number.isInteger(status) ? status : undefined;
}

function codeFromStatus(statusCode: number | undefined): ErrorCode | undefined {
  if (statusCode === undefined) return undefined;
  return statusCodeMap[statusCode] ?? (statusCode >= 500 ? ERROR_CODES.SERVER_ERROR : undefined);
}

function readZodFieldErrors(error: unknown): Record<string, string[]> | undefined {
  if (!isRecord(error) || !Array.isArray(error.issues)) return undefined;

  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    if (!isRecord(issue) || !Array.isArray(issue.path) || typeof issue.message !== 'string') {
      continue;
    }

    const field = issue.path
      .filter((segment): segment is string | number =>
        ['string', 'number'].includes(typeof segment),
      )
      .join('.');

    if (field) (fieldErrors[field] ??= []).push(issue.message);
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

function readTechnicalMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (isRecord(error) && typeof error.message === 'string') return error.message;
  if (isRecord(error) && typeof error.statusText === 'string') return error.statusText;
  return 'Unknown error';
}

function detectCode(
  error: unknown,
  statusCode: number | undefined,
  source: ErrorSource | undefined,
  hasFieldErrors: boolean,
): ErrorCode {
  if (isRecord(error) && isErrorCode(error.code)) return error.code;

  const httpCode = codeFromStatus(statusCode);
  if (httpCode) return httpCode;

  if (hasFieldErrors) return ERROR_CODES.VALIDATION_ERROR;

  if (error instanceof Error) {
    if (error.name === 'AbortError') return ERROR_CODES.REQUEST_ABORTED;
    if (error.name === 'TimeoutError' || /timed?\s*out/i.test(error.message)) {
      return ERROR_CODES.NETWORK_TIMEOUT;
    }
    if (
      (typeof navigator !== 'undefined' && navigator.onLine === false) ||
      /failed to fetch|fetch failed|network\s*error|load failed/i.test(error.message)
    ) {
      return ERROR_CODES.NETWORK_ERROR;
    }
    return source === 'route' ? ERROR_CODES.ROUTE_ERROR : ERROR_CODES.CLIENT_ERROR;
  }

  return source === 'route' ? ERROR_CODES.ROUTE_ERROR : ERROR_CODES.UNKNOWN_ERROR;
}

export function normalizeError(error: unknown, options: NormalizeErrorOptions = {}): AppError {
  const { code: preferredCode, ...overrides } = options;

  if (error instanceof AppError) {
    if (Object.keys(options).length === 0) return error;

    return new AppError(preferredCode ?? error.code, {
      message: overrides.message ?? error.message,
      userMessage: overrides.userMessage ?? error.userMessage,
      severity: overrides.severity ?? error.severity,
      source: overrides.source ?? error.source,
      statusCode: overrides.statusCode ?? error.statusCode,
      fieldErrors: overrides.fieldErrors ?? error.fieldErrors,
      retryable: overrides.retryable ?? error.retryable,
      cause: overrides.cause ?? error.cause ?? error,
      context: { ...error.context, ...overrides.context },
      timestamp: overrides.timestamp ?? error.timestamp,
    });
  }

  const statusCode = overrides.statusCode ?? readStatusCode(error);
  const fieldErrors = overrides.fieldErrors ?? readZodFieldErrors(error);
  const code =
    preferredCode ?? detectCode(error, statusCode, overrides.source, fieldErrors !== undefined);

  return new AppError(code, {
    ...overrides,
    message: overrides.message ?? readTechnicalMessage(error),
    statusCode,
    fieldErrors,
    cause: overrides.cause ?? error,
  });
}
