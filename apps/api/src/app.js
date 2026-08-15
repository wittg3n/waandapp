import { randomUUID } from 'node:crypto';

import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { RedisStore } from 'rate-limit-redis';

import { config } from './config/index.js';
import { logger } from './logger.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';

export function createApp(redis) {
  const app = express();

  app.disable('x-powered-by');
  app.set('json escape', true);
  app.set('query parser', 'simple');
  app.set('trust proxy', config.trustProxyHops);

  app.use(
    pinoHttp({
      logger,
      genReqId: (_request, response) => {
        const requestId = randomUUID();
        response.setHeader('X-Request-ID', requestId);
        return requestId;
      },
    }),
  );
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, !origin || origin === config.corsOrigin);
      },
      credentials: false,
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
      maxAge: 600,
    }),
  );
  app.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      limit: config.rateLimitMax,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      passOnStoreError: false,
      store: new RedisStore({
        sendCommand: (...args) => redis.sendCommand(args),
        prefix: 'waandapp:rate-limit:',
      }),
    }),
  );
  app.use(express.json({ limit: '100kb', strict: true }));

  app.use('/api/v1/health', createHealthRouter(redis));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
