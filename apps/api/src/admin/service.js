import mongoose from 'mongoose';
import { assignableRoles, listRoles } from '../authorization/role-service.js';
import { revokeUserSessions } from '../auth/session-store.js';

import { User } from '../auth/models/user.js';
import { ApplicantProfile } from '../auth/models/applicant-profile.js';
import { ApiError } from '../middleware/errors.js';
import { recordAdminAudit } from './audit.js';
import { AuditLog } from './models/audit-log.js';
import { administrativeRolesForUser } from './permissions.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
}

async function serializeUser(user, profileCompleted = false, definitions) {
  const roles = administrativeRolesForUser(user);
  const bundles = definitions ?? (await listRoles());
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    emailVerified: Boolean(user.emailVerifiedAt),
    phoneVerified: Boolean(user.phoneVerifiedAt),
    role: user.role,
    adminRoles: roles,
    permissions: [
      ...new Set(
        bundles.filter((role) => roles.includes(role.key)).flatMap((role) => role.permissions),
      ),
    ],
    status: user.status,
    profileCompletion: profileCompleted ? 100 : 0,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function serializeProfile(profile) {
  if (!profile) return null;
  return {
    id: String(profile._id),
    currentDegree: profile.currentDegree,
    educationCountryCode: profile.educationCountryCode,
    fieldId: profile.fieldId,
    universityId: profile.universityId,
    studyStatus: profile.studyStatus,
    gradeAverage: profile.gradeAverage,
    gradeScale: profile.gradeScale,
    targetFieldId: profile.targetFieldId,
    targetDegree: profile.targetDegree,
    targetCountries: profile.targetCountries,
    intake: profile.intake,
    hasLanguageCertificate: profile.hasLanguageCertificate,
    languageCertificates: profile.languageCertificates,
    annualBudget: profile.annualBudget,
    scholarshipImportance: profile.scholarshipImportance,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

const normalUserFilter = Object.freeze({
  role: 'applicant',
  adminRoles: mongoose.trusted({ $size: 0 }),
});

function assertDifferentUsers(actor, target) {
  if (String(actor._id) === String(target._id)) {
    throw new ApiError(409, 'ADMIN_SELF_MUTATION', 'You cannot change your own roles or status.');
  }
}

function isSuperAdmin(user) {
  return administrativeRolesForUser(user).includes('SUPER_ADMIN');
}

export function assertCanManageTarget(actor, target) {
  if (isSuperAdmin(target) && !isSuperAdmin(actor)) {
    throw new ApiError(
      403,
      'ADMIN_SUPER_ADMIN_REQUIRED',
      'Only a super administrator can manage this account.',
    );
  }
}

function protectActiveSecurityAdministrator(target) {
  if (!isSuperAdmin(target) || target.status !== 'active') return;
  // Counting another root then saving two separate users races on standalone
  // MongoDB. Root removal is an operator migration, never a concurrent web action.
  throw new ApiError(
    409,
    'ADMIN_SUPER_ADMIN_PROTECTED',
    'Active security administrators require an operator-reviewed removal.',
  );
}

async function saveSecurityChange(target) {
  target.$where = { sessionVersion: target.sessionVersion };
  target.sessionVersion += 1;
  try {
    await target.save();
  } catch (error) {
    if (
      error instanceof mongoose.Error.DocumentNotFoundError ||
      error instanceof mongoose.Error.VersionError
    ) {
      throw new ApiError(409, 'ADMIN_USER_CONFLICT', 'Account changed; reload before retrying.');
    }
    throw error;
  }
}

async function findUserForMutation(userId) {
  const user = await User.findById(userId).select('+sessionVersion');
  if (!user) throw new ApiError(404, 'ADMIN_USER_NOT_FOUND', 'User not found.');
  return user;
}

async function findNormalUserForMutation(userId) {
  const user = await User.findOne({ _id: userId, ...normalUserFilter }).select('+sessionVersion');
  if (!user) throw new ApiError(404, 'ADMIN_USER_NOT_FOUND', 'User not found.');
  return user;
}

export async function listAdminUsers(query, baseFilter = {}) {
  const filter = { ...baseFilter };
  if (query.status) filter.status = query.status;
  if (query.adminRole === 'USER') {
    Object.assign(filter, normalUserFilter);
  } else if (query.adminRole) {
    filter.adminRoles = query.adminRole;
  }
  if (query.search) {
    const search = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [
      { firstName: search },
      { lastName: search },
      { username: search },
      { email: search },
      { phone: search },
    ];
  }

  if (query.emailVerified !== undefined) {
    filter.emailVerifiedAt = query.emailVerified ? mongoose.trusted({ $ne: null }) : null;
  }
  if (query.phoneVerified !== undefined) {
    filter.phoneVerifiedAt = query.phoneVerified ? mongoose.trusted({ $ne: null }) : null;
  }
  if (query.registeredFrom || query.registeredTo) {
    filter.createdAt = mongoose.trusted({});
    if (query.registeredFrom)
      filter.createdAt.$gte = new Date(`${query.registeredFrom}T00:00:00.000Z`);
    if (query.registeredTo) {
      const exclusiveEnd = new Date(`${query.registeredTo}T00:00:00.000Z`);
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
      filter.createdAt.$lt = exclusiveEnd;
    }
  }
  if (query.profileCompleted !== undefined) {
    // ponytail: distinct IDs are the smallest correct query; replace with a $lookup pipeline if profile volume makes this measurable.
    const profileUserIds = await ApplicantProfile.distinct('userId');
    filter._id = mongoose.trusted(
      query.profileCompleted ? { $in: profileUserIds } : { $nin: profileUserIds },
    );
  }

  const skip = (query.page - 1) * query.pageSize;
  const direction = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [query.sortBy]: direction, _id: direction };
  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(query.pageSize),
    User.countDocuments(filter),
  ]);
  const profiles = await ApplicantProfile.find({
    userId: mongoose.trusted({ $in: users.map((user) => user._id) }),
  })
    .select('userId')
    .lean();
  const completedUserIds = new Set(profiles.map((profile) => String(profile.userId)));

  const definitions = await listRoles();
  return {
    items: await Promise.all(
      users.map((user) => serializeUser(user, completedUserIds.has(String(user._id)), definitions)),
    ),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      pageCount: Math.ceil(total / query.pageSize),
    },
  };
}

export async function getAdministrativeAccount(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'ADMIN_USER_NOT_FOUND', 'User not found.');
  return serializeUser(user);
}

export async function getNormalUser(userId) {
  const user = await User.findOne({ _id: userId, ...normalUserFilter });
  if (!user) throw new ApiError(404, 'ADMIN_USER_NOT_FOUND', 'User not found.');
  const profile = await ApplicantProfile.findOne({ userId: user._id });
  return { ...(await serializeUser(user, Boolean(profile))), profile: serializeProfile(profile) };
}

export async function updateNormalUser({ request, userId, firstName, lastName, reason }) {
  const target = await findNormalUserForMutation(userId);
  const before = { firstName: target.firstName, lastName: target.lastName };
  if (firstName !== undefined) target.firstName = firstName;
  if (lastName !== undefined) target.lastName = lastName;
  await target.save();
  const after = { firstName: target.firstName, lastName: target.lastName };

  await recordAdminAudit({
    request,
    action: 'USER_UPDATED',
    resourceType: 'USER',
    resourceId: target._id,
    before,
    after,
    reason,
  });
  return serializeUser(target, Boolean(await ApplicantProfile.exists({ userId: target._id })));
}

export async function resetNormalUserVerification({ request, userId, channel, reason }) {
  const target = await findNormalUserForMutation(userId);
  const field = channel === 'email' ? 'emailVerifiedAt' : 'phoneVerifiedAt';
  if (!target[field])
    return serializeUser(target, Boolean(await ApplicantProfile.exists({ userId: target._id })));

  const before = { status: target.status, [`${channel}Verified`]: true };
  target[field] = null;
  target.status = 'pending_verification';
  await saveSecurityChange(target);
  await revokeUserSessions(request.app.locals.redis, request.app.locals.settings, target._id);

  await recordAdminAudit({
    request,
    action: channel === 'email' ? 'USER_EMAIL_VERIFICATION_RESET' : 'USER_PHONE_VERIFICATION_RESET',
    resourceType: 'USER',
    resourceId: target._id,
    before,
    after: { status: target.status, [`${channel}Verified`]: false },
    reason,
  });
  return serializeUser(target, Boolean(await ApplicantProfile.exists({ userId: target._id })));
}

export async function assignAdminRoles({ request, userId, roles, reason }) {
  const actor = request.adminAuth.user;
  const target = await findUserForMutation(userId);
  assertDifferentUsers(actor, target);
  assertCanManageTarget(actor, target);

  const assignable = new Set(await assignableRoles(actor));
  if (roles.some((role) => !assignable.has(role))) {
    throw new ApiError(
      403,
      'ADMIN_ROLE_NOT_ASSIGNABLE',
      'One or more roles cannot be assigned by this account.',
    );
  }
  if (isSuperAdmin(target) && !roles.includes('SUPER_ADMIN')) {
    protectActiveSecurityAdministrator(target);
  }

  const before = { adminRoles: administrativeRolesForUser(target) };
  target.adminRoles = roles;
  target.$inc('permissionsVersion', 1);
  await saveSecurityChange(target);
  await revokeUserSessions(request.app.locals.redis, request.app.locals.settings, target._id);
  const after = { adminRoles: administrativeRolesForUser(target) };

  await recordAdminAudit({
    request,
    action: 'USER_ROLES_UPDATED',
    resourceType: 'USER',
    resourceId: target._id,
    before,
    after,
    reason,
  });
  return serializeUser(target);
}

export async function updateAdminUserStatus({ request, userId, status, reason }) {
  const actor = request.adminAuth.user;
  const target = await findUserForMutation(userId);
  assertDifferentUsers(actor, target);
  assertCanManageTarget(actor, target);
  if (target.status === status) return serializeUser(target);
  if (status === 'suspended') protectActiveSecurityAdministrator(target);

  const before = { status: target.status };
  target.status = status;
  await saveSecurityChange(target);
  await revokeUserSessions(request.app.locals.redis, request.app.locals.settings, target._id);

  await recordAdminAudit({
    request,
    action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
    resourceType: 'USER',
    resourceId: target._id,
    before,
    after: { status },
    reason,
  });
  return serializeUser(target);
}

export async function revokeAdminUserSessions({ request, userId, reason }) {
  const target = await findUserForMutation(userId);
  assertCanManageTarget(request.adminAuth.user, target);
  await saveSecurityChange(target);
  await revokeUserSessions(request.app.locals.redis, request.app.locals.settings, target._id);

  await recordAdminAudit({
    request,
    action: 'USER_SESSIONS_REVOKED',
    resourceType: 'USER',
    resourceId: target._id,
    before: null,
    after: { revokedAt: new Date().toISOString() },
    reason,
  });
}

export async function listAdminAuditLogs(query) {
  const filter = {};
  if (query.id) filter._id = query.id;
  if (query.action) filter.action = query.action;
  if (query.resourceType) filter.resourceType = query.resourceType;
  if (query.resourceId) filter.resourceId = query.resourceId;
  if (query.actorUserId) filter.actorUserId = query.actorUserId;

  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(query.pageSize).lean(),
    AuditLog.countDocuments(filter),
  ]);

  const actorIds = [
    ...new Set(items.map((item) => item.actorUserId && String(item.actorUserId)).filter(Boolean)),
  ];
  const actors = actorIds.length
    ? await User.find({ _id: mongoose.trusted({ $in: actorIds }) })
        .select('firstName lastName username')
        .lean()
    : [];
  const actorById = new Map(actors.map((actor) => [String(actor._id), actor]));

  return {
    items: items.map((item) => ({
      id: String(item._id),
      actorUserId: item.actorUserId ? String(item.actorUserId) : null,
      actorType: item.actorType,
      actor: item.actorUserId ? (actorById.get(String(item.actorUserId)) ?? null) : null,
      action: item.action,
      resourceType: item.resourceType,
      resourceId: item.resourceId,
      before: item.before,
      after: item.after,
      reason: item.reason,
      requestId: item.requestId,
      ip: item.ip,
      userAgent: item.userAgent,
      createdAt: item.createdAt,
    })),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      pageCount: Math.ceil(total / query.pageSize),
    },
  };
}
