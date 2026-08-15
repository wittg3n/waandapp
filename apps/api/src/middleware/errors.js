import { logger } from '../logger.js';

export function notFoundHandler(request, response) {
  response.status(404).json({
    statusCode: 404,
    error: 'Not Found',
    requestId: request.id,
  });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const isInvalidJson = error instanceof SyntaxError && 'body' in error;
  const statusCode = isInvalidJson ? 400 : 500;

  if (statusCode === 500) {
    logger.error({ err: error, requestId: request.id }, 'Unhandled request error');
  }

  response.status(statusCode).json({
    statusCode,
    error: isInvalidJson ? 'Invalid JSON' : 'Internal Server Error',
    requestId: request.id,
  });
}
