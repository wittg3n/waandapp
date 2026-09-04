import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

import { config } from './index.js';

export const SESSION_COLLECTION = 'sessions';
export const ADMIN_SESSION_COLLECTION = 'admin_sessions';

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

function sessionStore({ client, collectionName, idleTtlMs }) {
  return MongoStore.create({
    client,
    dbName: mongoose.connection.db?.databaseName,
    collectionName,
    ttl: Math.ceil(idleTtlMs / 1_000),
    // Index creation is awaited by the explicit startup/index lifecycle.
    autoRemove: 'disabled',
  });
}

export function createSessionMiddleware(settings = config, mongoClient) {
  const client = mongoClient ?? mongoose.connection.getClient();

  const store = sessionStore({
    client,
    collectionName: SESSION_COLLECTION,
    idleTtlMs: settings.sessionIdleTtlMs,
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

export function createAdminSessionMiddleware(settings = config, mongoClient) {
  const client = mongoClient ?? mongoose.connection.getClient();
  const middleware = session({
    name: settings.adminSessionCookieName,
    secret: settings.adminSessionSecret,
    store: sessionStore({
      client,
      collectionName: ADMIN_SESSION_COLLECTION,
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
