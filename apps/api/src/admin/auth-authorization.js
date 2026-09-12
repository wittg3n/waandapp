import { authenticatedPrincipal } from '../auth/principal.js';
import { ApiError } from '../middleware/errors.js';
import { regenerateAdminSession } from '../middleware/session.js';
import { administrativeRolesForUser } from './permissions.js';

async function loadAdminUser(request) {
  const session = request.adminSession;
  if (
    !session?.adminAuthenticated ||
    !session.userId ||
    !Number.isFinite(session.authTime) ||
    !Number.isFinite(session.secondStepAt)
  ) {
    return null;
  }

  const user = await authenticatedPrincipal(request, session, 'adminSessionInvalidReason');
  const valid = user && administrativeRolesForUser(user).length > 0;
  if (valid) {
    request.adminAuth = { user };
    return user;
  }

  request.adminSessionInvalidReason ??= 'revoked';
  await regenerateAdminSession(request);
  return null;
}

export function optionalAdminAuthenticatedUser(request, _response, next) {
  loadAdminUser(request).then(() => next(), next);
}

export function requireAdminAuthenticatedUser(request, _response, next) {
  loadAdminUser(request)
    .then((user) => {
      if (user) {
        next();
        return;
      }
      if (request.adminSessionInvalidReason === 'suspended') {
        next(new ApiError(403, 'AUTH_ACCOUNT_SUSPENDED', 'The account is suspended.'));
        return;
      }
      if (request.adminSessionInvalidReason) {
        next(new ApiError(401, 'AUTH_SESSION_EXPIRED', 'The session is no longer valid.'));
        return;
      }
      next(new ApiError(401, 'AUTH_UNAUTHORIZED', 'Authentication is required.'));
    })
    .catch(next);
}
