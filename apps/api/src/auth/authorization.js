import { ApiError } from '../middleware/errors.js';
import { regenerateSession } from '../middleware/session.js';
import { User } from './models/user.js';

async function loadAuthenticatedUser(request) {
  if (!request.session?.userId) return null;

  const user = await User.findById(request.session.userId).select(
    '+sessionVersion +passwordHash +usernameNormalized +emailNormalized +phoneNormalized',
  );
  const status = user?.status;
  const sessionVersionMatches = user?.sessionVersion === request.session.sessionVersion;
  const modernIdentity = Boolean(
    user?.passwordHash &&
    user?.usernameNormalized &&
    user?.emailNormalized &&
    user?.phoneNormalized &&
    user?.emailVerifiedAt &&
    user?.phoneVerifiedAt &&
    Number.isFinite(request.session.authTime) &&
    Number.isFinite(request.session.secondStepAt),
  );

  if (status === 'active' && sessionVersionMatches && modernIdentity) {
    request.auth = { user };
    return user;
  }

  request.authSessionInvalidReason = status === 'suspended' ? 'suspended' : 'revoked';
  await regenerateSession(request);
  return null;
}

export function optionalAuthenticatedUser(request, _response, next) {
  loadAuthenticatedUser(request).then(() => next(), next);
}

export function requireAuthenticatedUser(request, _response, next) {
  loadAuthenticatedUser(request)
    .then((user) => {
      if (user) {
        next();
        return;
      }

      if (request.authSessionInvalidReason === 'suspended') {
        next(new ApiError(403, 'AUTH_ACCOUNT_SUSPENDED', 'The account is suspended.'));
        return;
      }

      if (request.authSessionInvalidReason) {
        next(new ApiError(401, 'AUTH_SESSION_EXPIRED', 'The session is no longer valid.'));
        return;
      }

      next(new ApiError(401, 'AUTH_UNAUTHORIZED', 'Authentication is required.'));
    })
    .catch(next);
}

export function requireRole(...allowedRoles) {
  const roles = new Set(allowedRoles);

  return (request, _response, next) => {
    if (!request.auth?.user) {
      next(new ApiError(401, 'AUTH_UNAUTHORIZED', 'Authentication is required.'));
      return;
    }

    if (!roles.has(request.auth.user.role)) {
      next(new ApiError(403, 'AUTH_FORBIDDEN', 'The authenticated role is not allowed.'));
      return;
    }

    next();
  };
}

export function ownedByCurrentUserFilter(request, filter = {}) {
  if (!request.auth?.user?._id) {
    throw new ApiError(401, 'AUTH_UNAUTHORIZED', 'Authentication is required.');
  }

  return { ...filter, userId: request.auth.user._id };
}
