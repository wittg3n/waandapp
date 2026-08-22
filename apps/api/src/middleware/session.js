import { randomBytes, timingSafeEqual } from 'node:crypto';

import { sessionCookieOptions } from '../config/session.js';
import { ApiError } from './errors.js';

function callbackPromise(register) {
  return new Promise((resolve, reject) => {
    register((error) => (error ? reject(error) : resolve()));
  });
}

export async function regenerateSession(request) {
  await callbackPromise((done) => request.session.regenerate(done));
}

export async function saveSession(request) {
  await callbackPromise((done) => request.session.save(done));
}

export async function destroySession(request) {
  await callbackPromise((done) => request.session.destroy(done));
}

export function ensureSessionState(request) {
  request.session.createdAt ??= Date.now();
  request.session.csrfToken ??= randomBytes(32).toString('base64url');
  return request.session.csrfToken;
}

export function clearSessionCookie(response, settings) {
  const options = sessionCookieOptions(settings);
  delete options.maxAge;
  response.clearCookie(settings.sessionCookieName, options);
}

export function enforceAbsoluteSessionLifetime(settings) {
  return async (request, response, next) => {
    try {
      const now = Date.now();
      const createdAt = Number(request.session?.createdAt);
      const isAnonymousWithoutLifetime = !Number.isFinite(createdAt) && !request.session?.userId;
      const isWithinLifetime =
        Number.isFinite(createdAt) &&
        createdAt <= now &&
        now - createdAt <= settings.sessionAbsoluteTtlMs;
      if (isAnonymousWithoutLifetime || isWithinLifetime) {
        next();
        return;
      }

      await regenerateSession(request);
      clearSessionCookie(response, settings);
      request.authSessionInvalidReason = 'expired';
      next();
    } catch (error) {
      next(error);
    }
  };
}

function tokensMatch(actual, expected) {
  if (typeof actual !== 'string' || typeof expected !== 'string') return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function requireTrustedMutation(settings) {
  const allowedOrigins = new Set(settings.authMutationOrigins);

  return (request, _response, next) => {
    if (request.authSessionInvalidReason === 'expired') {
      next(new ApiError(401, 'AUTH_SESSION_EXPIRED', 'The session has expired.'));
      return;
    }

    if (!allowedOrigins.has(request.get('origin') ?? '')) {
      next(new ApiError(403, 'AUTH_CSRF_INVALID', 'The request origin is not allowed.'));
      return;
    }

    const fetchSite = request.get('sec-fetch-site');
    if (fetchSite && !['same-origin', 'same-site', 'none'].includes(fetchSite)) {
      next(new ApiError(403, 'AUTH_CSRF_INVALID', 'Cross-site mutation requests are not allowed.'));
      return;
    }

    if (!tokensMatch(request.get('x-csrf-token'), request.session?.csrfToken)) {
      next(new ApiError(403, 'AUTH_CSRF_INVALID', 'The CSRF token is invalid.'));
      return;
    }

    next();
  };
}
