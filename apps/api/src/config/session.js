import session from 'express-session';
import MongoStore from 'connect-mongo';

import { config } from './index.js';

const SESSION_COLLECTION = 'sessions';
const DEVELOPMENT_COOKIE_NAME = 'waand.sid';
const PRODUCTION_COOKIE_NAME = '__Host-waand.sid';

export function createSessionMiddleware() {
  const isProduction = config.nodeEnvironment === 'production';

  const store = MongoStore.create({
    mongoUrl: config.mongodbUri,
    collectionName: SESSION_COLLECTION,
    ttl: Math.ceil(config.sessionMaxAgeMs / 1000),
    autoRemove: 'native',
  });

  return session({
    name: isProduction ? PRODUCTION_COOKIE_NAME : DEVELOPMENT_COOKIE_NAME,

    secret: config.sessionSecret,
    store,

    resave: false,
    saveUninitialized: false,
    rolling: false,
    unset: 'destroy',

    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: config.sessionMaxAgeMs,
    },
  });
}
