import mongoose from 'mongoose';
import { createHash } from 'node:crypto';
import { administrativeRolesForUser } from '../admin/permissions.js';
import { authRedisKeys } from '../auth/redis-keys.js';
import { defineAbilityFor, PERMISSION_RULES } from './ability.js';
import { Role } from './roles.js';

export async function resolveAuthorization(user, redis, settings) {
  const roleKeys = administrativeRolesForUser(user);
  // Read full small role bundles once, so revisions and contents share a snapshot.
  const roles = await Role.find({
    key: mongoose.trusted({ $in: roleKeys }),
    deletedAt: null,
  }).lean();
  const revision = createHash('sha256')
    .update(JSON.stringify(roles.map((role) => [role.key, role.version]).sort()))
    .digest('hex');
  const key = authRedisKeys(settings).permissions(user._id, user.permissionsVersion ?? 0, revision);
  let permissions = null;
  const cached = await redis.get(key);
  if (cached) {
    try {
      permissions = JSON.parse(cached);
    } catch {
      /* Rebuild malformed entries. */
    }
    if (!Array.isArray(permissions) || permissions.some((p) => !PERMISSION_RULES[p]))
      permissions = null;
  }
  if (!permissions) {
    permissions = [...new Set(roles.flatMap((role) => role.permissions))].filter(
      (p) => PERMISSION_RULES[p],
    );
    await redis.set(key, JSON.stringify(permissions), { expiration: { type: 'EX', value: 60 } });
  }
  user.authorization = { permissions, ability: defineAbilityFor(user, permissions) };
  return user.authorization;
}
