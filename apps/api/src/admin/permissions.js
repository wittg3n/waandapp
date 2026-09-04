import {
  ADMIN_ROLES,
  PERMISSION_VALUES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission as sharedHasPermission,
  permissionsForRoles,
} from '@waandapp/shared';

export { ADMIN_ROLES, PERMISSION_VALUES, PERMISSIONS, ROLE_PERMISSIONS, permissionsForRoles };

export const ASSIGNABLE_ADMIN_ROLES = Object.freeze(ADMIN_ROLES.filter((role) => role !== 'USER'));

const legacyRoleMap = Object.freeze({
  admin: ['ADMIN'],
  staff: ['SUPPORT'],
});

export function administrativeRolesForUser(user) {
  const explicit = Array.isArray(user?.adminRoles) ? user.adminRoles : [];
  if (explicit.length > 0) return [...new Set(explicit)];
  return legacyRoleMap[user?.role] ?? [];
}

export function hasPermission(user, permission) {
  return sharedHasPermission(administrativeRolesForUser(user), permission);
}

export function rolesAssignableBy(user) {
  const actorRoles = administrativeRolesForUser(user);
  if (actorRoles.includes('SUPER_ADMIN')) return ASSIGNABLE_ADMIN_ROLES;
  if (actorRoles.includes('ADMIN')) {
    return ASSIGNABLE_ADMIN_ROLES.filter((role) => !['ADMIN', 'SUPER_ADMIN'].includes(role));
  }
  return [];
}
