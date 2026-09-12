import { z } from 'zod';
import { PERMISSION_VALUES } from '@waandapp/shared';
import { User } from '../auth/models/user.js';
import { ApiError } from '../middleware/errors.js';
import { recordAdminAudit } from '../admin/audit.js';
import { administrativeRolesForUser } from '../admin/permissions.js';
import { Role } from './roles.js';

export const roleKey = z.string().regex(/^[A-Z][A-Z0-9_]{1,63}$/);
export const roleBody = z.strictObject({
  key: roleKey,
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(''),
  permissions: z.array(z.enum(PERMISSION_VALUES)).max(PERMISSION_VALUES.length),
  reason: z.string().trim().min(1).max(500),
});
export const roleUpdateBody = roleBody.omit({ key: true });
export const roleDeleteBody = z.strictObject({ reason: z.string().trim().min(1).max(500) });

function securityAdministrator(request) {
  // Exceptional platform policy: role-management permission alone cannot mint stronger authority.
  if (!administrativeRolesForUser(request.adminAuth.user).includes('SUPER_ADMIN'))
    throw new ApiError(403, 'AUTH_FORBIDDEN', 'A security administrator is required.');
}

export async function listRoles() {
  return Role.find({ deletedAt: null }).sort({ key: 1 }).lean();
}

export async function assignableRoles(user) {
  const roles = await listRoles();
  const superAdmin = administrativeRolesForUser(user).includes('SUPER_ADMIN');
  const permissions = new Set(user.authorization?.permissions ?? []);
  return roles
    .filter(
      (role) =>
        role.key !== 'USER' &&
        (superAdmin ||
          (!['ADMIN', 'SUPER_ADMIN'].includes(role.key) &&
            role.permissions.every((p) => permissions.has(p)))),
    )
    .map((role) => role.key);
}

export async function mutateRole(request, operation, key, input) {
  securityAdministrator(request);
  if (['USER', 'SUPER_ADMIN'].includes(key))
    throw new ApiError(
      403,
      'AUTH_FORBIDDEN',
      'Root system policies cannot be changed through the API.',
    );
  const before = await Role.findOne({ key });
  if (operation !== 'create' && (!before || before.deletedAt))
    throw new ApiError(404, 'ROLE_NOT_FOUND', 'Role not found.');
  if (operation === 'delete' && before.system)
    throw new ApiError(409, 'ROLE_SYSTEM_PROTECTED', 'System roles cannot be deleted.');
  if (operation === 'create' && before)
    throw new ApiError(409, 'ROLE_EXISTS', 'Role key is reserved.');
  let role;
  if (operation === 'create') {
    role = await Role.create({
      key,
      name: input.name,
      description: input.description,
      permissions: [...new Set(input.permissions)],
    });
  } else {
    role = await Role.findOneAndUpdate(
      { key, version: before.version, deletedAt: null },
      {
        $set:
          operation === 'delete'
            ? { deletedAt: new Date(), permissions: [] }
            : {
                name: input.name,
                description: input.description,
                permissions: [...new Set(input.permissions)],
              },
        $inc: { version: 1 },
      },
      { returnDocument: 'after', runValidators: true },
    );
    if (!role) throw new ApiError(409, 'ROLE_CONFLICT', 'Role changed; reload before retrying.');
    // Cache keys also include role.version, so revocation is immediate even if this update is interrupted.
    await User.updateMany({ adminRoles: key }, { $inc: { permissionsVersion: 1 } });
  }
  await recordAdminAudit({
    request,
    action: `ROLE_${operation.toUpperCase()}D`,
    resourceType: 'ROLE',
    resourceId: role._id,
    before: before
      ? { name: before.name, description: before.description, permissions: before.permissions }
      : null,
    after: {
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      deleted: Boolean(role.deletedAt),
    },
    reason: input.reason,
  });
  return role;
}
