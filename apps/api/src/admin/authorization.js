import { ApiError } from '../middleware/errors.js';
import { PERMISSION_VALUES, hasPermission } from './permissions.js';

export function requirePermission(permission) {
  if (!PERMISSION_VALUES.includes(permission)) {
    throw new TypeError('Unknown permission: ' + permission);
  }

  return (request, _response, next) => {
    if (!request.adminAuth?.user) {
      next(new ApiError(401, 'AUTH_UNAUTHORIZED', 'Authentication is required.'));
      return;
    }
    if (!hasPermission(request.adminAuth.user, permission)) {
      next(new ApiError(403, 'AUTH_FORBIDDEN', 'The required permission is missing.'));
      return;
    }
    next();
  };
}
