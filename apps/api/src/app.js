import { randomUUID } from 'node:crypto';

import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { RedisStore } from 'rate-limit-redis';

import { createAdminAuthRouter } from './admin/auth-router.js';
import { createAdminAuthService } from './admin/auth-service.js';
import { createAdminRouter } from './admin/routes.js';
import { createAuthRouter } from './auth/router.js';
import { createAuthService } from './auth/service.js';
import { createDeliverySenders } from './auth/delivery.js';
import { createBlogRouter } from './blog/routes.js';
import { createCmsAdminRouter } from './cms/admin-routes.js';
import { config } from './config/index.js';
import { createAdminSessionMiddleware, createSessionMiddleware } from './config/session.js';
import { createHealthRouter } from './health/router.js';
import { logger } from './logger.js';
import { ApiError, errorHandler, notFoundHandler } from './middleware/errors.js';
import {
  enforceAbsoluteSessionLifetime,
  enforceAdminAbsoluteSessionLifetime,
  requireAdminTrustedMutation,
  requireTrustedMutation,
} from './middleware/session.js';

function adminOriginGuard(settings) {
  return (request, response, next) => {
    const origin = request.get('origin');
    if (!origin) {
      next();
      return;
    }
    if (origin !== settings.adminDashboardOrigin) {
      next(new ApiError(403, 'AUTH_CSRF_INVALID', 'The request origin is not allowed.'));
      return;
    }

    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.vary('Origin');
    if (request.method === 'OPTIONS') {
      response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
      response.setHeader('Access-Control-Max-Age', '600');
      response.status(204).end();
      return;
    }
    next();
  };
}

export function createApp(redis, options = {}) {
  const settings = options.settings ?? config;
  const senders = options.senders ?? createDeliverySenders(settings);
  const sessionMiddleware = options.sessionMiddleware ?? createSessionMiddleware(settings);
  const adminSessionMiddleware =
    options.adminSessionMiddleware ?? createAdminSessionMiddleware(settings);
  const authService =
    options.authService ??
    createAuthService({
      redis,
      settings,
      ...senders,
      codeVerifier: options.codeVerifier,
      codeGenerator: options.codeGenerator,
    });
  const adminAuthService =
    options.adminAuthService ??
    createAdminAuthService({
      redis,
      settings,
      ...senders,
      codeVerifier: options.codeVerifier,
      codeGenerator: options.codeGenerator,
      verifyPrimaryCredentials: authService.verifyPrimaryCredentials,
    });
  const app = express();
  const trustedMutation = requireTrustedMutation(settings);
  const adminTrustedMutation = requireAdminTrustedMutation(settings);

  app.disable('x-powered-by');
  app.set('json escape', true);
  app.set('query parser', 'simple');
  app.set('trust proxy', settings.trustProxyHops);

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
  app.use('/api/v1/admin', adminOriginGuard(settings));
  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, !origin || settings.corsOrigins.includes(origin));
      },
      credentials: true,
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
      exposedHeaders: ['X-Request-ID', 'Retry-After'],
      maxAge: 600,
    }),
  );
  app.use('/api/v1/health', createHealthRouter(redis));
  app.use(
    rateLimit({
      windowMs: settings.rateLimitWindowMs,
      limit: settings.rateLimitMax,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      passOnStoreError: false,
      store: new RedisStore({
        sendCommand: (...args) => redis.sendCommand(args),
        prefix: settings.globalRateLimitPrefix ?? 'waandapp:rate-limit:',
      }),
      handler: (request, _response, next) => {
        const remainingMs = request.rateLimit?.resetTime
          ? request.rateLimit.resetTime.getTime() - Date.now()
          : settings.rateLimitWindowMs;
        const retryAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1_000));
        next(
          new ApiError(429, 'RATE_LIMITED', 'Too many requests.', {
            details: { retryAfterSeconds },
            headers: { 'Retry-After': String(retryAfterSeconds) },
          }),
        );
      },
    }),
  );
  app.use(express.json({ limit: '32kb', strict: true }));
  app.use('/api/v1/blog', createBlogRouter(options.blogService, { settings }));
  app.use(
    '/api/v1/admin',
    adminSessionMiddleware,
    enforceAdminAbsoluteSessionLifetime(settings),
    createAdminAuthRouter({
      redis,
      settings,
      service: adminAuthService,
      requireAdminTrustedMutation: adminTrustedMutation,
    }),
    createAdminRouter({
      requireAdminTrustedMutation: adminTrustedMutation,
      cmsRouter:
        options.cmsRouter ??
        createCmsAdminRouter({
          settings,
          requireTrustedMutation: adminTrustedMutation,
        }),
    }),
    notFoundHandler,
  );
  app.use(sessionMiddleware);
  app.use(enforceAbsoluteSessionLifetime(settings));

  app.use(
    '/api/v1/auth',
    createAuthRouter({
      redis,
      settings,
      service: authService,
      requireTrustedMutation: trustedMutation,
    }),
  );
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
