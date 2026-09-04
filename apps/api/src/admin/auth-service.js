import mongoose from 'mongoose';

import { permissionsForRoles } from '@waandapp/shared';

import { recordAuthEvent } from '../auth/audit.js';
import { createChallengeService } from '../auth/challenge-service.js';
import { isDevNoTwoStep } from '../auth/delivery.js';
import { AuthTransaction } from '../auth/models/auth-transaction.js';
import { User } from '../auth/models/user.js';
import { maskDestination } from '../auth/normalization.js';
import { ApiError } from '../middleware/errors.js';
import {
  destroyAdminSession,
  ensureAdminSessionState,
  regenerateAdminSession,
  saveAdminSession,
} from '../middleware/session.js';
import { administrativeRolesForUser } from './permissions.js';

function invalidCredentials() {
  return new ApiError(
    401,
    'AUTH_INVALID_CREDENTIALS',
    'The username/email or password is invalid.',
  );
}

function invalidPreauth() {
  return new ApiError(401, 'AUTH_PREAUTH_INVALID', 'The authentication transaction is invalid.');
}

function securitySelection(query) {
  return query.select(
    '+passwordHash +sessionVersion +usernameNormalized +emailNormalized +phoneNormalized',
  );
}

function transactionSelection(query) {
  return query.select('+context.sessionVersionAtStart');
}

function isModernActiveAdmin(user) {
  return Boolean(
    user &&
    user.status === 'active' &&
    user.passwordHash &&
    user.usernameNormalized &&
    user.emailNormalized &&
    user.phoneNormalized &&
    user.emailVerifiedAt &&
    user.phoneVerifiedAt &&
    administrativeRolesForUser(user).length > 0,
  );
}

function serializeAdminUser(user) {
  const adminRoles = administrativeRolesForUser(user);
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    emailVerified: Boolean(user.emailVerifiedAt),
    phoneVerified: Boolean(user.phoneVerifiedAt),
    role: user.role,
    adminRoles,
    permissions: permissionsForRoles(adminRoles),
    status: user.status,
  };
}

function serializeAdminPreauth(transaction) {
  return {
    type: 'admin_login',
    stage: transaction.stage,
    allowedChannels: [...transaction.allowedChannels],
    completedChannels: [...transaction.completedChannels],
    destinations: {
      ...(transaction.context?.destinationMasks?.email
        ? { email: transaction.context.destinationMasks.email }
        : {}),
      ...(transaction.context?.destinationMasks?.sms
        ? { sms: transaction.context.destinationMasks.sms }
        : {}),
    },
    expiresAt: transaction.expiresAt.toISOString(),
  };
}

export function createAdminAuthService({
  redis,
  settings,
  emailSender,
  smsSender,
  codeVerifier,
  codeGenerator,
  verifyPrimaryCredentials,
}) {
  const challenges = createChallengeService({
    redis,
    settings,
    emailSender,
    smsSender,
    codeVerifier,
    codeGenerator,
  });
  const noTwoStep = isDevNoTwoStep(settings);

  async function invalidatePreauth(request) {
    const transactionId = request.adminSession?.adminPreauth?.transactionId;
    if (transactionId) {
      await AuthTransaction.updateOne(
        { _id: transactionId, type: 'admin_login', consumedAt: null },
        { $set: { consumedAt: new Date(), stage: 'completed' } },
      );
      delete request.adminSession.adminPreauth;
      await saveAdminSession(request);
    }
  }

  async function createLoginTransaction(request, user) {
    await invalidatePreauth(request);
    await regenerateAdminSession(request);
    ensureAdminSessionState(request);
    const transaction = await AuthTransaction.create({
      type: 'admin_login',
      userId: user._id,
      stage: 'second_step',
      allowedChannels: ['email', 'sms'],
      completedChannels: [],
      failedSecondStepAttempts: 0,
      maxAttempts: settings.authMaxVerifyAttempts,
      sendCountEmail: 0,
      sendCountSms: 0,
      sendCountTotal: 0,
      maxSends: settings.authMaxSendsPerTransaction,
      expiresAt: new Date(
        Date.now() + Math.min(settings.authTransactionTtlMs, settings.adminSessionIdleTtlMs),
      ),
      context: {
        destinationMasks: {
          email: maskDestination('email', user.email),
          sms: maskDestination('sms', user.phone),
        },
        sessionVersionAtStart: user.sessionVersion,
      },
    });
    request.adminSession.adminPreauth = { transactionId: transaction._id.toString() };
    await saveAdminSession(request);
    return transaction;
  }

  async function boundLoginTransaction(request, channel) {
    const transactionId = request.adminSession?.adminPreauth?.transactionId;
    const transaction = transactionId
      ? await transactionSelection(AuthTransaction.findById(transactionId))
      : null;
    const now = new Date();
    const validTransaction = Boolean(
      transaction &&
      transaction.type === 'admin_login' &&
      transaction.stage === 'second_step' &&
      !transaction.consumedAt &&
      transaction.expiresAt > now &&
      (!channel || transaction.allowedChannels.includes(channel)),
    );
    const user = validTransaction
      ? await securitySelection(User.findById(transaction.userId))
      : null;
    const validUser =
      isModernActiveAdmin(user) &&
      user.sessionVersion === transaction?.context?.sessionVersionAtStart;
    if (validTransaction && validUser) return { transaction, user };

    if (request.adminSession?.adminPreauth) {
      delete request.adminSession.adminPreauth;
      await saveAdminSession(request);
    }
    throw invalidPreauth();
  }

  async function establishAdminSession(request, user, expectedSessionVersion, reason = 'admin') {
    const now = new Date();
    const authenticated = await securitySelection(
      User.findOneAndUpdate(
        {
          _id: user._id,
          status: 'active',
          sessionVersion: expectedSessionVersion,
        },
        { $set: { lastLoginAt: now } },
        { returnDocument: 'after', runValidators: true },
      ),
    );
    if (!isModernActiveAdmin(authenticated)) throw invalidPreauth();

    await regenerateAdminSession(request);
    ensureAdminSessionState(request);
    request.adminSession.userId = authenticated._id.toString();
    request.adminSession.sessionVersion = authenticated.sessionVersion;
    request.adminSession.authTime = now.getTime();
    request.adminSession.secondStepAt = now.getTime();
    request.adminSession.twoStepBypassed = noTwoStep;
    request.adminSession.adminAuthenticated = true;
    await saveAdminSession(request);
    await recordAuthEvent({
      settings,
      request,
      type: 'LOGIN_SUCCESS',
      userId: authenticated._id,
      reason,
    });
    return {
      status: 'AUTHENTICATED',
      user: serializeAdminUser(authenticated),
      preauth: null,
    };
  }

  async function login({ request, identifier, password }) {
    const user = await verifyPrimaryCredentials({ request, identifier, password });
    if (!isModernActiveAdmin(user)) throw invalidCredentials();
    if (noTwoStep) {
      await invalidatePreauth(request);
      return establishAdminSession(request, user, user.sessionVersion, 'admin_dev_no2step');
    }
    const transaction = await createLoginTransaction(request, user);
    return {
      status: 'SECOND_STEP_REQUIRED',
      user: null,
      preauth: serializeAdminPreauth(transaction),
    };
  }

  async function requestSecondStep({ request, channel }) {
    const { transaction, user } = await boundLoginTransaction(request, channel);
    return challenges.send({
      request,
      transaction,
      channel,
      purpose: 'admin_login_second_step',
      destination: channel === 'email' ? user.emailNormalized : user.phoneNormalized,
    });
  }

  async function verifySecondStep({ request, channel, code }) {
    const { transaction, user } = await boundLoginTransaction(request, channel);
    await challenges.verify({
      request,
      transaction,
      channel,
      purpose: 'admin_login_second_step',
      code,
    });
    const now = new Date();
    const consumed = await transactionSelection(
      AuthTransaction.findOneAndUpdate(
        {
          _id: transaction._id,
          type: 'admin_login',
          stage: 'second_step',
          consumedAt: null,
          expiresAt: mongoose.trusted({ $gt: now }),
          failedSecondStepAttempts: mongoose.trusted({ $lt: transaction.maxAttempts }),
        },
        { $set: { stage: 'completed', consumedAt: now } },
        { returnDocument: 'after' },
      ),
    );
    if (!consumed) throw invalidPreauth();

    return establishAdminSession(request, user, transaction.context.sessionVersionAtStart);
  }

  async function getMe({ request, user }) {
    if (user) return { user: serializeAdminUser(user), preauth: null };
    if (!request.adminSession?.adminPreauth?.transactionId) {
      return { user: null, preauth: null };
    }
    if (noTwoStep) {
      await invalidatePreauth(request);
      return { user: null, preauth: null };
    }
    try {
      const { transaction } = await boundLoginTransaction(request);
      return { user: null, preauth: serializeAdminPreauth(transaction) };
    } catch (error) {
      if (error instanceof ApiError && error.code === 'AUTH_PREAUTH_INVALID') {
        return { user: null, preauth: null };
      }
      throw error;
    }
  }

  async function logout({ request, user }) {
    await recordAuthEvent({
      settings,
      request,
      type: 'LOGOUT',
      userId: user._id,
      reason: 'admin',
    });
    await destroyAdminSession(request);
  }

  return { getMe, login, logout, requestSecondStep, verifySecondStep };
}
