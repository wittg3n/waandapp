import { Router } from 'express';

import { ApiError, validateBody } from '../middleware/errors.js';
import { clearSessionCookie, destroySession, ensureSessionState } from '../middleware/session.js';
import { recordAuthEvent } from './audit.js';
import {
  optionalAuthenticatedUser,
  requireAuthenticatedUser,
  requireRole,
} from './authorization.js';
import { User } from './models/user.js';
import { createAuthIpRateLimiter } from './rate-limit.js';
import {
  codeVerifySchema,
  createRegisterSchema,
  emailChangeRequestSchema,
  emptyBodySchema,
  forgotPasswordSchema,
  loginSchema,
  passwordChangeSchema,
  passwordResetSchema,
  phoneChangeRequestSchema,
  profileSchema,
  reauthSchema,
  secondStepRequestSchema,
  secondStepVerifySchema,
} from './schemas.js';

function withCsrf(request, data) {
  return { data: { ...data, csrfToken: ensureSessionState(request) } };
}

export function createAuthRouter({ redis, settings, service, requireTrustedMutation }) {
  const router = Router();
  const rateLimitPrefix = settings.authRateLimitPrefix ?? 'waandapp:auth:';
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
    'login_ip',
  );
  const requestIpLimiter = limiter(
    'request-ip',
    settings.authRequestIpWindowMs,
    settings.authRequestIpLimit,
    'request_ip',
  );
  const verifyIpLimiter = limiter(
    'verify-ip',
    settings.authVerifyIpWindowMs,
    settings.authVerifyIpLimit,
    'verify_ip',
  );

  router.use((_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });

  router.get('/me', optionalAuthenticatedUser, async (request, response) => {
    const data = await service.getMe({ request, user: request.auth?.user ?? null });
    if (request.authSessionInvalidReason) {
      await recordAuthEvent({
        settings,
        request,
        type: 'SESSION_REVOKED',
        reason: request.authSessionInvalidReason,
      });
    }
    response.json(withCsrf(request, data));
  });

  router.use(requireTrustedMutation);

  router.post(
    '/register',
    requestIpLimiter,
    validateBody(createRegisterSchema(settings.authTermsVersion)),
    async (request, response) => {
      const data = await service.register({ request, input: request.validatedBody });
      response.status(201).json(withCsrf(request, data));
    },
  );

  for (const channel of ['email', 'phone']) {
    const internalChannel = channel === 'phone' ? 'sms' : 'email';
    router.post(
      `/register/${channel}/request`,
      requestIpLimiter,
      validateBody(emptyBodySchema),
      async (request, response) => {
        const data = await service.requestRegistrationCode({
          request,
          channel: internalChannel,
        });
        response.json({ data });
      },
    );
    router.post(
      `/register/${channel}/verify`,
      verifyIpLimiter,
      validateBody(codeVerifySchema),
      async (request, response) => {
        const data = await service.verifyRegistrationCode({
          request,
          channel: internalChannel,
          code: request.validatedBody.code,
        });
        response.json(withCsrf(request, data));
      },
    );
  }

  router.post('/login', loginIpLimiter, validateBody(loginSchema), async (request, response) => {
    const data = await service.login({ request, ...request.validatedBody });
    response.json(withCsrf(request, data));
  });

  router.post(
    '/second-step/request',
    requestIpLimiter,
    optionalAuthenticatedUser,
    validateBody(secondStepRequestSchema),
    async (request, response) => {
      const data = await service.requestSecondStep({
        request,
        channel: request.validatedBody.channel,
        authenticatedUser: request.auth?.user,
      });
      response.json({ data });
    },
  );

  router.post(
    '/second-step/verify',
    verifyIpLimiter,
    optionalAuthenticatedUser,
    validateBody(secondStepVerifySchema),
    async (request, response) => {
      const data = await service.verifySecondStep({
        request,
        authenticatedUser: request.auth?.user,
        ...request.validatedBody,
      });
      response.json(withCsrf(request, data));
    },
  );

  router.post(
    '/password/forgot',
    requestIpLimiter,
    validateBody(forgotPasswordSchema),
    async (request, response) => {
      const data = await service.forgotPassword({ request, ...request.validatedBody });
      response.json(withCsrf(request, data));
    },
  );

  for (const channel of ['email', 'phone']) {
    const internalChannel = channel === 'phone' ? 'sms' : 'email';
    router.post(
      `/password/recovery/${channel}/request`,
      requestIpLimiter,
      validateBody(emptyBodySchema),
      async (request, response) => {
        const data = await service.requestRecoveryCode({ request, channel: internalChannel });
        response.json({ data });
      },
    );
    router.post(
      `/password/recovery/${channel}/verify`,
      verifyIpLimiter,
      validateBody(codeVerifySchema),
      async (request, response) => {
        const data = await service.verifyRecoveryCode({
          request,
          channel: internalChannel,
          code: request.validatedBody.code,
        });
        response.json(withCsrf(request, data));
      },
    );
  }

  router.post('/password/reset', validateBody(passwordResetSchema), async (request, response) => {
    const data = await service.resetPassword({
      request,
      password: request.validatedBody.password,
    });
    clearSessionCookie(response, settings);
    response.json({ data });
  });

  router.post(
    '/reauth',
    requireAuthenticatedUser,
    loginIpLimiter,
    validateBody(reauthSchema),
    async (request, response) => {
      const data = await service.reauthenticate({
        request,
        user: request.auth.user,
        ...request.validatedBody,
      });
      response.json(withCsrf(request, data));
    },
  );

  router.post(
    '/password/change',
    requireAuthenticatedUser,
    validateBody(passwordChangeSchema),
    async (request, response) => {
      const data = await service.changePassword({
        request,
        user: request.auth.user,
        password: request.validatedBody.password,
      });
      response.json(withCsrf(request, data));
    },
  );

  router.post(
    '/email/change/request',
    requireAuthenticatedUser,
    requestIpLimiter,
    validateBody(emailChangeRequestSchema),
    async (request, response) => {
      const data = await service.requestContactChange({
        request,
        user: request.auth.user,
        channel: 'email',
        destination: request.validatedBody.email,
      });
      response.json({ data });
    },
  );
  router.post(
    '/email/change/verify',
    requireAuthenticatedUser,
    verifyIpLimiter,
    validateBody(codeVerifySchema),
    async (request, response) => {
      const data = await service.verifyContactChange({
        request,
        user: request.auth.user,
        channel: 'email',
        code: request.validatedBody.code,
      });
      response.json(withCsrf(request, data));
    },
  );
  router.post(
    '/phone/change/request',
    requireAuthenticatedUser,
    requestIpLimiter,
    validateBody(phoneChangeRequestSchema),
    async (request, response) => {
      const data = await service.requestContactChange({
        request,
        user: request.auth.user,
        channel: 'sms',
        destination: request.validatedBody.phone,
      });
      response.json({ data });
    },
  );
  router.post(
    '/phone/change/verify',
    requireAuthenticatedUser,
    verifyIpLimiter,
    validateBody(codeVerifySchema),
    async (request, response) => {
      const data = await service.verifyContactChange({
        request,
        user: request.auth.user,
        channel: 'sms',
        code: request.validatedBody.code,
      });
      response.json(withCsrf(request, data));
    },
  );

  router.post(
    '/logout',
    requireAuthenticatedUser,
    validateBody(emptyBodySchema),
    async (request, response) => {
      await recordAuthEvent({ settings, request, type: 'LOGOUT', userId: request.auth.user._id });
      await destroySession(request);
      clearSessionCookie(response, settings);
      response.json({ data: { success: true } });
    },
  );

  router.post(
    '/logout-all',
    requireAuthenticatedUser,
    validateBody(emptyBodySchema),
    async (request, response) => {
      const result = await User.updateOne(
        { _id: request.auth.user._id, status: 'active' },
        { $inc: { sessionVersion: 1 } },
      );
      if (result.matchedCount !== 1) {
        throw new ApiError(401, 'AUTH_SESSION_EXPIRED', 'The session is no longer valid.');
      }
      await recordAuthEvent({
        settings,
        request,
        type: 'LOGOUT_ALL',
        userId: request.auth.user._id,
      });
      await destroySession(request);
      clearSessionCookie(response, settings);
      response.json({ data: { success: true } });
    },
  );

  router.put(
    '/me/profile',
    requireAuthenticatedUser,
    requireRole('applicant'),
    validateBody(profileSchema),
    async (request, response) => {
      const data = await service.updateProfile({
        user: request.auth.user,
        profile: request.validatedBody,
      });
      response.json({ data });
    },
  );

  return router;
}
