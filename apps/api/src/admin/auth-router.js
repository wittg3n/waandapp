import { Router } from 'express';

import { recordAuthEvent } from '../auth/audit.js';
import { createAuthIpRateLimiter } from '../auth/rate-limit.js';
import {
  emptyBodySchema,
  loginSchema,
  secondStepRequestSchema,
  secondStepVerifySchema,
} from '../auth/schemas.js';
import { validateBody } from '../middleware/errors.js';
import { clearAdminSessionCookie, ensureAdminSessionState } from '../middleware/session.js';
import {
  optionalAdminAuthenticatedUser,
  requireAdminAuthenticatedUser,
} from './auth-authorization.js';

function withAdminCsrf(request, data) {
  return { data: { ...data, csrfToken: ensureAdminSessionState(request) } };
}

export function createAdminAuthRouter({ redis, settings, service, requireAdminTrustedMutation }) {
  const router = Router();
  const rateLimitPrefix = settings.adminAuthRateLimitPrefix ?? 'waandapp:admin-auth:';
  const limiter = (name, windowMs, limit, reason) =>
    createAuthIpRateLimiter({
      redis,
      windowMs,
      limit,
      prefix: `${rateLimitPrefix}${name}:`,
      onLimited: (request) =>
        recordAuthEvent({ settings, request, type: 'RATE_LIMIT_TRIGGERED', reason }),
    });
  const loginIpLimiter = limiter(
    'login-ip',
    settings.authLoginIpWindowMs,
    settings.authLoginIpLimit,
    'admin_login_ip',
  );
  const requestIpLimiter = limiter(
    'request-ip',
    settings.authRequestIpWindowMs,
    settings.authRequestIpLimit,
    'admin_request_ip',
  );
  const verifyIpLimiter = limiter(
    'verify-ip',
    settings.authVerifyIpWindowMs,
    settings.authVerifyIpLimit,
    'admin_verify_ip',
  );

  router.use((_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });

  router.get('/auth/me', optionalAdminAuthenticatedUser, async (request, response) => {
    const data = await service.getMe({ request, user: request.adminAuth?.user ?? null });
    response.json(withAdminCsrf(request, data));
  });

  router.post(
    '/auth/login',
    requireAdminTrustedMutation,
    loginIpLimiter,
    validateBody(loginSchema),
    async (request, response) => {
      const data = await service.login({ request, ...request.validatedBody });
      response.json(withAdminCsrf(request, data));
    },
  );

  router.post(
    '/auth/second-step/request',
    requireAdminTrustedMutation,
    requestIpLimiter,
    validateBody(secondStepRequestSchema),
    async (request, response) => {
      const data = await service.requestSecondStep({
        request,
        channel: request.validatedBody.channel,
      });
      response.json({ data });
    },
  );

  router.post(
    '/auth/second-step/verify',
    requireAdminTrustedMutation,
    verifyIpLimiter,
    validateBody(secondStepVerifySchema),
    async (request, response) => {
      const data = await service.verifySecondStep({ request, ...request.validatedBody });
      response.json(withAdminCsrf(request, data));
    },
  );

  router.post(
    '/auth/logout',
    requireAdminTrustedMutation,
    requireAdminAuthenticatedUser,
    validateBody(emptyBodySchema),
    async (request, response) => {
      await service.logout({ request, user: request.adminAuth.user });
      clearAdminSessionCookie(response, settings);
      response.json({ data: { success: true } });
    },
  );

  return router;
}
