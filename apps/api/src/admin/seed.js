import { User } from '../auth/models/user.js';
import { hashPassword } from '../auth/password.js';
import { createRegisterSchema } from '../auth/schemas.js';
import { recordAdminAudit } from './audit.js';

export const DEVELOPMENT_ADMIN_IDENTITY = Object.freeze({
  firstName: 'Waand',
  lastName: 'Administrator',
  username: 'waand-local-admin',
  email: 'admin@waand.test',
  phone: '+989120000001',
});

const DEVELOPMENT_ADMIN_ROLES = Object.freeze(['SUPER_ADMIN']);

function auditSnapshot(user) {
  return {
    status: user.status,
    role: user.role,
    adminRoles: [...user.adminRoles],
    emailVerified: Boolean(user.emailVerifiedAt),
    phoneVerified: Boolean(user.phoneVerifiedAt),
    sessionVersion: user.sessionVersion,
  };
}

function sameSeedIdentity(user, identity) {
  return (
    user.usernameNormalized === identity.username &&
    user.emailNormalized === identity.email &&
    user.phoneNormalized === identity.phone
  );
}

export async function seedDevelopmentSuperAdmin({ settings, password }) {
  if (settings?.nodeEnvironment !== 'development') {
    throw new Error(
      'The development Super Admin seed is only available when NODE_ENV=development.',
    );
  }

  const account = createRegisterSchema(settings.authTermsVersion).parse({
    ...DEVELOPMENT_ADMIN_IDENTITY,
    password,
    passwordConfirmation: password,
    termsAccepted: true,
    termsVersion: settings.authTermsVersion,
  });
  const existing = await User.findOne({
    $or: [
      { usernameNormalized: account.username },
      { emailNormalized: account.email },
      { phoneNormalized: account.phone },
    ],
  }).select('+sessionVersion +usernameNormalized +emailNormalized +phoneNormalized');

  if (existing && !sameSeedIdentity(existing, account)) {
    throw new Error('Development admin seed identity conflicts with another account.');
  }

  const now = new Date();
  const passwordHash = await hashPassword(account.password, settings);
  const before = existing ? auditSnapshot(existing) : null;
  let user;

  if (existing) {
    existing.set({
      firstName: account.firstName,
      lastName: account.lastName,
      username: account.username,
      email: account.email,
      phone: account.phone,
      passwordHash,
      emailVerifiedAt: now,
      phoneVerifiedAt: now,
      role: 'admin',
      adminRoles: [...DEVELOPMENT_ADMIN_ROLES],
      status: 'active',
      passwordChangedAt: now,
      sessionVersion: existing.sessionVersion + 1,
      security: {
        failedLoginCount: 0,
        lastFailedLoginAt: null,
        lockedUntil: null,
      },
      deletedAt: null,
    });
    user = await existing.save();
  } else {
    user = await User.create({
      firstName: account.firstName,
      lastName: account.lastName,
      username: account.username,
      usernameNormalized: account.username,
      email: account.email,
      emailNormalized: account.email,
      phone: account.phone,
      phoneNormalized: account.phone,
      passwordHash,
      emailVerifiedAt: now,
      phoneVerifiedAt: now,
      role: 'admin',
      adminRoles: [...DEVELOPMENT_ADMIN_ROLES],
      status: 'active',
      passwordChangedAt: now,
      sessionVersion: 0,
    });
  }

  await recordAdminAudit({
    actorType: 'SYSTEM',
    actorUserId: null,
    action: 'DEVELOPMENT_SUPER_ADMIN_SEEDED',
    resourceType: 'USER',
    resourceId: user._id,
    before,
    after: auditSnapshot(user),
    reason: 'Explicit development seed command',
  });

  return {
    created: !existing,
    user: {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      phone: user.phone,
      status: user.status,
      adminRoles: [...user.adminRoles],
    },
    sessionVersion: user.sessionVersion,
  };
}
