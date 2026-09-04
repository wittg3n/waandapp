import { ADMIN_ROLES } from '@waandapp/shared';
import mongoose from 'mongoose';
import { z } from 'zod';

const trimmed = (maximum) => z.string().trim().min(1).max(maximum);
export const objectIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.isObjectIdOrHexString(value), 'Invalid resource identifier.');

export const usersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().trim().max(120).optional(),
    status: z.enum(['pending_verification', 'active', 'suspended', 'deleted']).optional(),
    adminRole: z.enum(ADMIN_ROLES).optional(),
    emailVerified: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    phoneVerified: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    profileCompleted: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    registeredFrom: z.iso.date().optional(),
    registeredTo: z.iso.date().optional(),
    sortBy: z
      .enum(['createdAt', 'lastLoginAt', 'firstName', 'email', 'status'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .refine(
    ({ registeredFrom, registeredTo }) =>
      !registeredFrom || !registeredTo || registeredFrom <= registeredTo,
    { path: ['registeredTo'], message: 'Registration end date must follow the start date.' },
  );

export const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  action: z.string().trim().max(120).optional(),
  resourceType: z.string().trim().max(80).optional(),
  resourceId: z.string().trim().max(180).optional(),
  actorUserId: objectIdSchema.optional(),
});

export const userUpdateBodySchema = z
  .object({
    firstName: trimmed(80).optional(),
    lastName: trimmed(120).optional(),
    reason: trimmed(500),
  })
  .refine((value) => value.firstName !== undefined || value.lastName !== undefined, {
    message: 'At least one editable user field is required.',
  });

export const verificationChannelSchema = z.enum(['email', 'phone']);

export const rolesBodySchema = z.object({
  roles: z
    .array(z.enum(ADMIN_ROLES.exclude ? ADMIN_ROLES.exclude(['USER']) : ADMIN_ROLES))
    .max(6)
    .transform((roles) => [...new Set(roles.filter((role) => role !== 'USER'))]),
  reason: trimmed(500),
});

export const userStatusBodySchema = z.object({
  status: z.enum(['active', 'suspended']),
  reason: trimmed(500),
});

export const revokeSessionsBodySchema = z.object({
  reason: trimmed(500),
});
