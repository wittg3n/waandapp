import session from 'express-session';
import { TrackedRedisStore } from '../auth/session-store.js';

import { config } from './index.js';

export function sessionCookieOptions(settings = config) {
  return {
    httpOnly: true,
    secure: settings.nodeEnvironment === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: settings.sessionIdleTtlMs,
  };
}

export function adminSessionCookieOptions(settings = config) {
  return {
    httpOnly: true,
    secure: settings.nodeEnvironment === 'production',
    sameSite: 'strict',
    path: '/api/v1/admin',
    maxAge: settings.adminSessionIdleTtlMs,
  };
}

export function createSessionMiddleware(settings = config, redis) {
  const store = new TrackedRedisStore({
    redis,
    settings,
    scope: 'user',
    idleTtlMs: settings.sessionIdleTtlMs,
    absoluteTtlMs: settings.sessionAbsoluteTtlMs,
  });

  return session({
    name: settings.sessionCookieName,
    secret: settings.sessionSecret,
    store,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    unset: 'destroy',
    cookie: sessionCookieOptions(settings),
  });
}

export function createAdminSessionMiddleware(settings = config, redis) {
  const middleware = session({
    name: settings.adminSessionCookieName,
    secret: settings.adminSessionSecret,
    store: new TrackedRedisStore({
      redis,
      settings,
      scope: 'admin',
      absoluteTtlMs: settings.adminSessionAbsoluteTtlMs,
      idleTtlMs: settings.adminSessionIdleTtlMs,
    }),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    unset: 'destroy',
    cookie: adminSessionCookieOptions(settings),
  });

  return (request, response, next) => {
    middleware(request, response, (error) => {
      if (!error) request.adminSession = request.session;
      next(error);
    });
  };
}
