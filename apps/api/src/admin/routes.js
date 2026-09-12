import mongoose from 'mongoose';
import { z } from 'zod';
import { User } from '../auth/models/user.js';
import { normalizeEmail } from '../auth/normalization.js';
import { ApiError } from '../middleware/errors.js';
import { PERMISSION_VALUES } from '@waandapp/shared';
import { listUserSessions, revokeSingleSession } from '../auth/session-management.js';
import { recordAdminAudit } from './audit.js';
import {
  listRoles,
  assignableRoles,
  mutateRole,
  roleBody,
  roleUpdateBody,
  roleDeleteBody,
  roleKey,
} from '../authorization/role-service.js';
import { Router } from 'express';

import { requirePermission } from './authorization.js';
import { requireAdminAuthenticatedUser } from './auth-authorization.js';
import { validateBody } from '../middleware/errors.js';
import { PERMISSIONS, administrativeRolesForUser } from './permissions.js';
import {
  assignAdminRoles,
  assertCanManageTarget,
  getNormalUser,
  getAdministrativeAccount,
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

  router.get('/permissions', requirePermission(PERMISSIONS.usersRolesRead), (_request, response) =>
    response.json({ data: { permissions: PERMISSION_VALUES } }),
  );
  router.post(
    '/accounts/grant',
    requireAdminTrustedMutation,
    requirePermission(PERMISSIONS.usersRolesAssign),
    validateBody(
      z.strictObject({
        email: z.string().email().transform(normalizeEmail),
        roles: z.array(roleKey).max(6),
        reason: z.string().trim().min(1).max(500),
      }),
    ),
    async (request, response) => {
      const target = await User.findOne({
        emailNormalized: request.validatedBody.email,
        status: 'active',
      });
      if (!target?.emailVerifiedAt || !target?.phoneVerifiedAt)
        throw new ApiError(
          409,
          'ADMIN_VERIFIED_ACCOUNT_REQUIRED',
          'An existing verified account is required.',
        );
      const user = await assignAdminRoles({
        request,
        userId: String(target._id),
        roles: request.validatedBody.roles,
        reason: request.validatedBody.reason,
      });
      response.json({ data: { user } });
    },
  );
  router.get(
    '/accounts',
    requirePermission(PERMISSIONS.usersRolesRead),
    validateQuery(usersQuerySchema),
    async (request, response) => {
      response.json({
        data: await listAdminUsers(request.validatedQuery, {
          'adminRoles.0': mongoose.trusted({ $exists: true }),
        }),
      });
    },
  );
  router.get(
    '/accounts/:userId',
    requirePermission(PERMISSIONS.usersRolesRead),
    async (request, response) => {
      response.json({ data: { user: await getAdministrativeAccount(validatedUserId(request)) } });
    },
  );
  router.get(
    '/users/:userId/sessions',
    requirePermission(PERMISSIONS.usersSessionsRevoke),
    async (request, response) => {
      response.json({
        data: {
          sessions: await listUserSessions(
            request.app.locals.redis,
            request.app.locals.settings,
            validatedUserId(request),
          ),
        },
      });
    },
  );
  router.delete(
    '/users/:userId/sessions/:sessionId',
    requireAdminTrustedMutation,
    requirePermission(PERMISSIONS.usersSessionsRevoke),
    validateBody(revokeSessionsBodySchema),
    async (request, response) => {
      const target = await User.findById(validatedUserId(request));
      if (!target) throw new ApiError(404, 'ADMIN_USER_NOT_FOUND', 'User not found.');
      assertCanManageTarget(request.adminAuth.user, target);
      await revokeSingleSession(
        request.app.locals.redis,
        request.app.locals.settings,
        target._id,
        request.params.sessionId,
      );
      await recordAdminAudit({
        request,
        action: 'USER_SESSION_REVOKED',
        resourceType: 'USER',
        resourceId: validatedUserId(request),
        reason: request.validatedBody.reason,
      });
      response.status(204).end();
    },
  );
  router.get('/roles', requirePermission(PERMISSIONS.usersRolesRead), async (request, response) => {
    response.json({
      data: {
        currentRoles: administrativeRolesForUser(request.adminAuth.user),
        assignableRoles: await assignableRoles(request.adminAuth.user),
        roles: await Promise.all(
          (await listRoles())
            .filter((role) => role.key !== 'USER')
            .map(async (role) => ({
              ...role,
              id: String(role._id),
              role: role.key,
              adminCount: await User.countDocuments({ adminRoles: role.key }),
            })),
        ),
      },
    });
  });
  router.post(
    '/roles',
    requireAdminTrustedMutation,
    requirePermission(PERMISSIONS.rolesCreate),
    validateBody(roleBody),
    async (request, response) => {
      response.status(201).json({
        data: {
          role: await mutateRole(
            request,
            'create',
            request.validatedBody.key,
            request.validatedBody,
          ),
        },
      });
    },
  );
  router.patch(
    '/roles/:key',
    requireAdminTrustedMutation,
    requirePermission(PERMISSIONS.rolesUpdate),
    validateBody(roleUpdateBody),
    async (request, response) => {
      response.json({
        data: {
          role: await mutateRole(
            request,
            'update',
            roleKey.parse(request.params.key),
            request.validatedBody,
          ),
        },
      });
    },
  );
  router.delete(
    '/roles/:key',
    requireAdminTrustedMutation,
    requirePermission(PERMISSIONS.rolesDelete),
    validateBody(roleDeleteBody),
    async (request, response) => {
      await mutateRole(request, 'delete', roleKey.parse(request.params.key), request.validatedBody);
      response.status(204).end();
    },
  );

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
