import { Router } from 'express';

import { requirePermission } from './authorization.js';
import { requireAdminAuthenticatedUser } from './auth-authorization.js';
import { validateBody } from '../middleware/errors.js';
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  administrativeRolesForUser,
  rolesAssignableBy,
} from './permissions.js';
import {
  assignAdminRoles,
  getNormalUser,
  listAdminAuditLogs,
  listAdminUsers,
  resetNormalUserVerification,
  revokeAdminUserSessions,
  updateNormalUser,
  updateAdminUserStatus,
} from './service.js';
import {
  auditQuerySchema,
  objectIdSchema,
  revokeSessionsBodySchema,
  rolesBodySchema,
  userUpdateBodySchema,
  usersQuerySchema,
  userStatusBodySchema,
  verificationChannelSchema,
} from './validation.js';

function validateQuery(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      next(result.error);
      return;
    }
    request.validatedQuery = result.data;
    next();
  };
}

function validatedUserId(request) {
  return objectIdSchema.parse(request.params.userId);
}

export function createAdminRouter({ requireAdminTrustedMutation, cmsRouter } = {}) {
  const router = Router();

  router.use((_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.use(requireAdminAuthenticatedUser);

  router.get('/roles', requirePermission(PERMISSIONS.usersRolesRead), (request, response) => {
    response.json({
      data: {
        currentRoles: administrativeRolesForUser(request.adminAuth.user),
        assignableRoles: rolesAssignableBy(request.adminAuth.user),
        roles: Object.entries(ROLE_PERMISSIONS)
          .filter(([role]) => role !== 'USER')
          .map(([role, permissions]) => ({ role, permissions })),
      },
    });
  });

  router.get(
    '/users',
    requirePermission(PERMISSIONS.usersRead),
    validateQuery(usersQuerySchema),
    async (request, response) => {
      response.json({ data: await listAdminUsers(request.validatedQuery) });
    },
  );

  router.get(
    '/users/:userId',
    requirePermission(PERMISSIONS.usersRead),
    async (request, response) => {
      response.json({ data: { user: await getNormalUser(validatedUserId(request)) } });
    },
  );

  router.patch(
    '/users/:userId',
    requireAdminTrustedMutation,
    requirePermission(PERMISSIONS.usersUpdate),
    validateBody(userUpdateBodySchema),
    async (request, response) => {
      const user = await updateNormalUser({
        request,
        userId: validatedUserId(request),
        ...request.validatedBody,
      });
      response.json({ data: { user } });
    },
  );

  router.post(
    '/users/:userId/verification/:channel/reset',
    requireAdminTrustedMutation,
    requirePermission(PERMISSIONS.usersUpdate),
    validateBody(revokeSessionsBodySchema),
    async (request, response) => {
      const user = await resetNormalUserVerification({
        request,
        userId: validatedUserId(request),
        channel: verificationChannelSchema.parse(request.params.channel),
        ...request.validatedBody,
      });
      response.json({ data: { user } });
    },
  );

  router.patch(
    '/users/:userId/roles',
    requireAdminTrustedMutation,
    requirePermission(PERMISSIONS.usersRolesAssign),
    validateBody(rolesBodySchema),
    async (request, response) => {
      const user = await assignAdminRoles({
        request,
        userId: validatedUserId(request),
        ...request.validatedBody,
      });
      response.json({ data: { user } });
    },
  );

  router.patch(
    '/users/:userId/status',
    requireAdminTrustedMutation,
    requirePermission(PERMISSIONS.usersSuspend),
    validateBody(userStatusBodySchema),
    async (request, response) => {
      const user = await updateAdminUserStatus({
        request,
        userId: validatedUserId(request),
        ...request.validatedBody,
      });
      response.json({ data: { user } });
    },
  );

  router.post(
    '/users/:userId/sessions/revoke',
    requireAdminTrustedMutation,
    requirePermission(PERMISSIONS.usersSessionsRevoke),
    validateBody(revokeSessionsBodySchema),
    async (request, response) => {
      await revokeAdminUserSessions({
        request,
        userId: validatedUserId(request),
        ...request.validatedBody,
      });
      response.status(204).end();
    },
  );

  router.get(
    '/audit',
    requirePermission(PERMISSIONS.auditRead),
    validateQuery(auditQuerySchema),
    async (request, response) => {
      response.json({ data: await listAdminAuditLogs(request.validatedQuery) });
    },
  );

  if (cmsRouter) router.use('/blog', cmsRouter);
  return router;
}
