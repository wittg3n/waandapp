import mongoose from 'mongoose';
import { User } from './models/user.js';
import { resolveAuthorization } from '../authorization/cache.js';

export async function authenticatedPrincipal(request, session, invalidReasonField) {
  if (
    !session?.userId ||
    !Number.isFinite(session.authTime) ||
    !Number.isFinite(session.secondStepAt)
  )
    return null;
  const user = await User.findById(session.userId).select('+sessionVersion');
  if (
    !user ||
    user.status !== 'active' ||
    user.sessionVersion !== session.sessionVersion ||
    !user.emailVerifiedAt ||
    !user.phoneVerifiedAt ||
    (user.security?.lockedUntil && user.security.lockedUntil > new Date())
  ) {
    request[invalidReasonField] = user?.status === 'suspended' ? 'suspended' : 'revoked';
    return null;
  }
  if (
    !(await User.exists({
      _id: user._id,
      passwordHash: mongoose.trusted({ $regex: /^\$argon2id\$/ }),
      usernameNormalized: mongoose.trusted({ $type: 'string' }),
      emailNormalized: mongoose.trusted({ $type: 'string' }),
      phoneNormalized: mongoose.trusted({ $type: 'string' }),
    }))
  )
    return null;
  const authorization = await resolveAuthorization(
    user,
    request.app.locals.redis,
    request.app.locals.settings,
  );
  request.user = user;
  request.ability = authorization.ability;
  return user;
}
