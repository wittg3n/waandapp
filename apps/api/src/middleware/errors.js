import { ZodError } from 'zod';

import { logger } from '../logger.js';

export class ApiError extends Error {
  constructor(statusCode, code, message, options = {}) {
    super(message, { cause: options.cause });
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = options.details;
    this.headers = options.headers;
  }
}

export function validateBody(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    request.validatedBody = result.data;
    next();
  };
}

export function notFoundHandler(request, response) {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found.',
      requestId: request.id,
    },
  });
}

function validationDetails(error) {
  const fields = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'body';
    fields[path] ??= issue.message;
  }

  return { fields };
}

function normalizeError(error) {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    return new ApiError(400, 'VALIDATION_ERROR', 'The request body is invalid.', {
      details: validationDetails(error),
    });
  }

  if (error?.type === 'entity.parse.failed') {
    return new ApiError(400, 'INVALID_JSON', 'The request body must contain valid JSON.');
  }

  if (error?.type === 'entity.too.large' || error?.status === 413) {
    return new ApiError(413, 'PAYLOAD_TOO_LARGE', 'The request body is too large.');
  }

  return new ApiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred.', { cause: error });
}

function safeErrorLog(error, requestId) {
  return {
    err: error,
    requestId,
    ...(error?.code === 11_000 || error?.codeName === 'DuplicateKey'
      ? { errorKind: 'duplicate_key' }
      : {}),
  };
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const normalized = normalizeError(error);

  if (normalized.statusCode >= 500) {
    logger.error(safeErrorLog(error, request.id), 'Unhandled request error');
  }

  for (const [name, value] of Object.entries(normalized.headers ?? {})) {
    response.setHeader(name, value);
  }

  response.status(normalized.statusCode).json({
    error: {
      code: normalized.code,
      message: normalized.message,
      requestId: request.id,
      ...(normalized.details ? { details: normalized.details } : {}),
    },
  });
}
