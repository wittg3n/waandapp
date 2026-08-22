import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

import { config } from './index.js';

const SESSION_COLLECTION = 'sessions';

export function sessionCookieOptions(settings = config) {
  return {
    httpOnly: true,
    secure: settings.nodeEnvironment === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: settings.sessionIdleTtlMs,
  };
}

export function createSessionMiddleware(settings = config, mongoClient) {
  const client = mongoClient ?? mongoose.connection.getClient();

  const store = MongoStore.create({
    client,
    dbName: mongoose.connection.db?.databaseName,
    collectionName: SESSION_COLLECTION,
    ttl: Math.ceil(settings.sessionIdleTtlMs / 1000),
    // The TTL index is created and awaited by the explicit index lifecycle.
    // connect-mongo's native mode starts an untracked createIndex promise that
    // can race with MongoDB shutdown when HTTP startup fails.
    autoRemove: 'disabled',
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
