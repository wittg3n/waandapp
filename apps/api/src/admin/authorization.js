import { ApiError } from '../middleware/errors.js';
import { PERMISSION_VALUES } from './permissions.js';
import { PERMISSION_RULES } from '../authorization/ability.js';

export function requirePermission(permission) {
  if (!PERMISSION_VALUES.includes(permission)) {
    throw new TypeError('Unknown permission: ' + permission);
  }

  return (request, _response, next) => {
    if (!request.adminAuth?.user) {
      next(new ApiError(401, 'AUTH_UNAUTHORIZED', 'Authentication is required.'));
      return;
    }
    // A conditional "read own User" ability is not permission to list all users.
    if (
      !request.adminAuth.user.authorization?.permissions.includes(permission) ||
      !request.ability?.can(
        PERMISSION_RULES[permission].action,
        PERMISSION_RULES[permission].subject,
      )
    ) {
      next(new ApiError(403, 'AUTH_FORBIDDEN', 'The required permission is missing.'));
      return;
    }
    next();
  };
}
