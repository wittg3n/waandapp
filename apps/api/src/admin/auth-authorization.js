import { User } from '../auth/models/user.js';
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

  const user = await User.findById(session.userId).select(
    '+sessionVersion +passwordHash +usernameNormalized +emailNormalized +phoneNormalized',
  );
  const valid = Boolean(
    user &&
    user.status === 'active' &&
    user.sessionVersion === session.sessionVersion &&
    user.passwordHash &&
    user.usernameNormalized &&
    user.emailNormalized &&
    user.phoneNormalized &&
    user.emailVerifiedAt &&
    user.phoneVerifiedAt &&
    administrativeRolesForUser(user).length > 0,
  );

  if (valid) {
    request.adminAuth = { user };
    return user;
  }

  request.adminSessionInvalidReason = user?.status === 'suspended' ? 'suspended' : 'revoked';
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
