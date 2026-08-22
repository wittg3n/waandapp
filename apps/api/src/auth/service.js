import mongoose from 'mongoose';

import { ApiError } from '../middleware/errors.js';
import {
  destroySession,
  ensureSessionState,
  regenerateSession,
  saveSession,
} from '../middleware/session.js';
import { recordAuthEvent } from './audit.js';
import { createChallengeService } from './challenge-service.js';
import { keyedDigest } from './code.js';
import { ApplicantProfile } from './models/applicant-profile.js';
import { AuthTransaction } from './models/auth-transaction.js';
import { LegalAcceptance } from './models/legal-acceptance.js';
import { User } from './models/user.js';
import { maskDestination, normalizeEmail, normalizeUsername } from './normalization.js';
import { hashPassword, verifyPassword } from './password.js';
import { enforceDestinationLimit } from './rate-limit.js';
import { serializeAuthUser, serializePreauth } from './serialization.js';

const INVALID_CREDENTIALS = new ApiError(
  401,
  'AUTH_INVALID_CREDENTIALS',
  'The username/email or password is invalid.',
);
const GENERIC_RECOVERY_MESSAGE = 'اگر حساب واجد شرایط باشد، مراحل بازیابی در دسترس خواهد بود.';

function transactionError() {
  return new ApiError(401, 'AUTH_PREAUTH_INVALID', 'The authentication transaction is invalid.');
}

function reauthError() {
  return new ApiError(403, 'AUTH_REAUTH_REQUIRED', 'Recent reauthentication is required.');
}

function isModernActiveUser(user) {
  return Boolean(
    user &&
    user.status === 'active' &&
    user.usernameNormalized &&
    user.passwordHash &&
    user.emailVerifiedAt &&
    user.phoneVerifiedAt,
  );
}

function securitySelection(query) {
  return query.select(
    '+passwordHash +sessionVersion +usernameNormalized +emailNormalized +phoneNormalized',
  );
}

function transactionSelection(query) {
  return query.select(
    '+context.decoy +context.newDestination +context.recoverySubjectDigest +context.sessionVersionAtStart',
  );
}

function identityFilter(identifier) {
  return identifier.includes('@')
    ? { emailNormalized: normalizeEmail(identifier) }
    : { usernameNormalized: normalizeUsername(identifier) };
}

async function profileForUser(userId) {
  return ApplicantProfile.findOne({ userId });
}

async function userPayload(user) {
  return serializeAuthUser(user, await profileForUser(user._id));
}

async function activateVerifiedPendingUser(userId, sessionVersion, now = new Date()) {
  let user = await securitySelection(
    User.findOneAndUpdate(
      {
        _id: userId,
        status: 'pending_verification',
        sessionVersion,
        emailVerifiedAt: mongoose.trusted({ $ne: null }),
        phoneVerifiedAt: mongoose.trusted({ $ne: null }),
      },
      { $set: { status: 'active', lastLoginAt: now } },
      { returnDocument: 'after', runValidators: true },
    ),
  );
  user ??= await securitySelection(User.findOne({ _id: userId, status: 'active', sessionVersion }));
  return isModernActiveUser(user) ? user : null;
}

async function rotateAuthenticatedSession(request, user, now = new Date()) {
  await regenerateSession(request);
  ensureSessionState(request);
  request.session.userId = user._id.toString();
  request.session.sessionVersion = user.sessionVersion;
  request.session.authTime = now.getTime();
  request.session.secondStepAt = now.getTime();
  await saveSession(request);
}

async function invalidateBoundPreauth(request) {
  const transactionId = request.session?.preauth?.transactionId;
  if (transactionId) {
    await AuthTransaction.updateOne(
      { _id: transactionId, consumedAt: null },
      { $set: { consumedAt: new Date(), stage: 'completed' } },
    );
  }
  delete request.session.preauth;
}

async function createTransaction({
  request,
  settings,
  type,
  userId,
  stage,
  allowedChannels,
  completedChannels = [],
  purpose = null,
  destinationMasks = {},
  decoy = false,
  recoverySubjectDigest = null,
  sessionVersionAtStart = 0,
  publicPreauth = true,
}) {
  await invalidateBoundPreauth(request);
  if (publicPreauth) await regenerateSession(request);
  ensureSessionState(request);
  const transaction = await AuthTransaction.create({
    type,
    userId,
    stage,
    allowedChannels,
    completedChannels,
    failedSecondStepAttempts: 0,
    maxAttempts: settings.authMaxVerifyAttempts,
    sendCountEmail: 0,
    sendCountSms: 0,
    sendCountTotal: 0,
    maxSends: settings.authMaxSendsPerTransaction,
    expiresAt: new Date(Date.now() + settings.authTransactionTtlMs),
    context: {
      purpose,
      destinationMasks,
      decoy,
      recoverySubjectDigest,
      sessionVersionAtStart,
    },
  });
  request.session.preauth = { transactionId: transaction._id.toString() };
  await saveSession(request);
  return transaction;
}

async function boundTransaction(request, { types, stages, authenticatedUser } = {}) {
  const transactionId = request.session?.preauth?.transactionId;
  if (!transactionId) throw transactionError();
  const transaction = await transactionSelection(AuthTransaction.findById(transactionId));
  const now = new Date();
  const matches =
    transaction &&
    !transaction.consumedAt &&
    transaction.expiresAt > now &&
    (!types || types.includes(transaction.type)) &&
    (!stages || stages.includes(transaction.stage)) &&
    (!authenticatedUser || transaction.userId.equals(authenticatedUser._id));
  if (matches) return transaction;

  delete request.session.preauth;
  await saveSession(request);
  throw transactionError();
}

async function consumeTransaction(transaction, stage, update = {}) {
  const now = new Date();
  return transactionSelection(
    AuthTransaction.findOneAndUpdate(
      {
        _id: transaction._id,
        stage,
        consumedAt: null,
        expiresAt: mongoose.trusted({ $gt: now }),
        failedSecondStepAttempts: mongoose.trusted({ $lt: transaction.maxAttempts }),
      },
      { $set: { ...update, stage: 'completed', consumedAt: now } },
      { returnDocument: 'after' },
    ),
  );
}

async function upsertLegalAcceptance({ request, settings, userId, termsVersion }) {
  await LegalAcceptance.updateOne(
    { userId, document: 'terms_and_privacy', version: termsVersion },
    {
      $setOnInsert: {
        acceptedAt: new Date(),
        sourceIpHash: keyedDigest(request.ip ?? 'unknown', settings.authCodePepper),
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );
}

function signupTransactionInput(user) {
  return {
    type: 'signup',
    userId: user._id,
    stage: 'verify_contacts',
    allowedChannels: ['email', 'sms'],
    completedChannels: [
      ...(user.emailVerifiedAt ? ['email'] : []),
      ...(user.phoneVerifiedAt ? ['sms'] : []),
    ],
    destinationMasks: {
      email: maskDestination('email', user.email),
      sms: maskDestination('sms', user.phone),
    },
    sessionVersionAtStart: user.sessionVersion ?? 0,
  };
}

function responseWithPreauth(status, transaction) {
  return { status, preauth: serializePreauth(transaction) };
}

export function createAuthService({
  redis,
  settings,
  emailSender,
  smsSender,
  codeVerifier,
  codeGenerator,
}) {
  const challenges = createChallengeService({
    redis,
    settings,
    emailSender,
    smsSender,
    codeVerifier,
    codeGenerator,
  });
  const dummyHashPromise = hashPassword('Waand timing-only password value 2026', settings);

  async function notifySecurityChange(user, event, extra = []) {
    const notifications = [
      user?.email && emailSender.sendSecurityNotification?.({ destination: user.email, event }),
      user?.phone && smsSender.sendSecurityNotification?.({ destination: user.phone, event }),
      ...extra,
    ].filter(Boolean);
    await Promise.allSettled(notifications);
  }

  async function minimumRecoveryResponseTime(startedAt) {
    const remaining = 75 - (Date.now() - startedAt);
    if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
  }

  async function enforceCredentialLimit(request, namespace, subject, userId) {
    try {
      await enforceDestinationLimit({
        redis,
        settings,
        namespace,
        destination: subject,
        windowMs: settings.authLoginIdentifierWindowMs,
        limit: settings.authLoginIdentifierLimit,
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'AUTH_RATE_LIMITED') {
        await recordAuthEvent({
          settings,
          request,
          type: 'RATE_LIMIT_TRIGGERED',
          userId,
          reason: namespace,
        });
      }
      throw error;
    }
  }

  async function register({ request, input }) {
    const duplicateFilter = mongoose.trusted({
      $or: [
        { usernameNormalized: input.username },
        { emailNormalized: input.email },
        { phoneNormalized: input.phone },
      ],
    });
    const candidates = await securitySelection(User.find(duplicateFilter));
    const resumable = candidates.find(
      (user) =>
        user.status === 'pending_verification' &&
        user.usernameNormalized === input.username &&
        user.emailNormalized === input.email &&
        user.phoneNormalized === input.phone,
    );

    if (candidates.length > 0) {
      await enforceCredentialLimit(
        request,
        'register-resume:identifier',
        input.username,
        resumable?._id,
      );
    }

    if (resumable && (await verifyPassword(resumable.passwordHash, input.password))) {
      await upsertLegalAcceptance({
        request,
        settings,
        userId: resumable._id,
        termsVersion: input.termsVersion,
      });
      if (resumable.emailVerifiedAt && resumable.phoneVerifiedAt) {
        await invalidateBoundPreauth(request);
        const activated = await activateVerifiedPendingUser(
          resumable._id,
          resumable.sessionVersion,
        );
        if (!activated) throw transactionError();
        await rotateAuthenticatedSession(request, activated);
        await recordAuthEvent({
          settings,
          request,
          type: 'REGISTER_RESUMED',
          userId: activated._id,
        });
        await recordAuthEvent({
          settings,
          request,
          type: 'LOGIN_SUCCESS',
          userId: activated._id,
        });
        return {
          status: 'AUTHENTICATED',
          user: await userPayload(activated),
          preauth: null,
        };
      }
      const transaction = await createTransaction({
        request,
        settings,
        ...signupTransactionInput(resumable),
      });
      await recordAuthEvent({
        settings,
        request,
        type: 'REGISTER_RESUMED',
        userId: resumable._id,
      });
      return responseWithPreauth('VERIFICATION_REQUIRED', transaction);
    }
    if (candidates.length > 0) {
      throw new ApiError(409, 'AUTH_IDENTITY_CONFLICT', 'One or more identities are unavailable.');
    }

    const passwordHash = await hashPassword(input.password, settings);
    let user;
    try {
      user = await User.create({
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        usernameNormalized: input.username,
        email: input.email,
        emailNormalized: input.email,
        phone: input.phone,
        phoneNormalized: input.phone,
        passwordHash,
        role: 'applicant',
        status: 'pending_verification',
        passwordChangedAt: new Date(),
        sessionVersion: 0,
      });
    } catch (error) {
      if (error?.code === 11_000) {
        throw new ApiError(
          409,
          'AUTH_IDENTITY_CONFLICT',
          'One or more identities are unavailable.',
        );
      }
      throw error;
    }

    await upsertLegalAcceptance({
      request,
      settings,
      userId: user._id,
      termsVersion: input.termsVersion,
    });
    const transaction = await createTransaction({
      request,
      settings,
      ...signupTransactionInput(user),
    });
    await recordAuthEvent({ settings, request, type: 'REGISTER_CREATED', userId: user._id });
    return responseWithPreauth('VERIFICATION_REQUIRED', transaction);
  }

  async function login({ request, identifier, password }) {
    await enforceCredentialLimit(request, 'login:identifier', identifier);
    const user = await securitySelection(User.findOne(identityFilter(identifier)));
    const passwordHash = user?.passwordHash ?? (await dummyHashPromise);
    const passwordValid = await verifyPassword(passwordHash, password);
    const locked = user?.security?.lockedUntil && user.security.lockedUntil > new Date();

    if (!user || !passwordValid || locked || ['suspended', 'deleted'].includes(user.status)) {
      if (user) {
        const failed = await User.findByIdAndUpdate(
          user._id,
          {
            $inc: { 'security.failedLoginCount': 1 },
            $set: { 'security.lastFailedLoginAt': new Date() },
          },
          { returnDocument: 'after' },
        );
        if (failed?.security?.failedLoginCount >= 10) {
          await User.updateOne(
            { _id: user._id },
            { $set: { 'security.lockedUntil': new Date(Date.now() + 5 * 60_000) } },
          );
        }
      }
      await recordAuthEvent({
        settings,
        request,
        type: 'PRIMARY_AUTH_FAILED',
        userId: user?._id,
        reason: user?.status === 'suspended' ? 'unavailable' : 'invalid_credentials',
      });
      throw INVALID_CREDENTIALS;
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          'security.failedLoginCount': 0,
          'security.lastFailedLoginAt': null,
          'security.lockedUntil': null,
        },
      },
    );
    await recordAuthEvent({
      settings,
      request,
      type: 'PRIMARY_AUTH_SUCCESS',
      userId: user._id,
    });

    if (user.status === 'pending_verification') {
      const transaction = await createTransaction({
        request,
        settings,
        ...signupTransactionInput(user),
      });
      return responseWithPreauth('VERIFICATION_REQUIRED', transaction);
    }
    if (!isModernActiveUser(user)) throw INVALID_CREDENTIALS;

    const transaction = await createTransaction({
      request,
      settings,
      type: 'login',
      userId: user._id,
      stage: 'second_step',
      allowedChannels: ['email', 'sms'],
      destinationMasks: {
        email: maskDestination('email', user.email),
        sms: maskDestination('sms', user.phone),
      },
      sessionVersionAtStart: user.sessionVersion,
    });
    return responseWithPreauth('SECOND_STEP_REQUIRED', transaction);
  }

  async function forgotPassword({ request, identifier }) {
    await enforceCredentialLimit(request, 'recovery:identifier', identifier);
    const candidate = await securitySelection(User.findOne(identityFilter(identifier)));
    const user = isModernActiveUser(candidate) ? candidate : null;
    const recoverySubjectDigest = keyedDigest(
      `password-recovery\0${identifier}`,
      settings.authCodePepper,
    );
    const transaction = await createTransaction({
      request,
      settings,
      type: 'password_reset',
      userId: user?._id ?? new mongoose.Types.ObjectId(),
      stage: 'recovery_verification',
      allowedChannels: ['email', 'sms'],
      destinationMasks: { email: '***', sms: '***' },
      decoy: !user,
      recoverySubjectDigest,
      sessionVersionAtStart: user?.sessionVersion ?? 0,
    });
    await recordAuthEvent({
      settings,
      request,
      type: 'PASSWORD_RECOVERY_STARTED',
      userId: user?._id,
    });
    return {
      ...responseWithPreauth('RECOVERY_STARTED', transaction),
      message: GENERIC_RECOVERY_MESSAGE,
    };
  }

  async function registrationContext(request, channel) {
    const transaction = await boundTransaction(request, {
      types: ['signup'],
      stages: ['verify_contacts'],
    });
    if (transaction.completedChannels.includes(channel)) {
      throw new ApiError(409, 'AUTH_CHANNEL_ALREADY_VERIFIED', 'The channel is already verified.');
    }
    if (channel === 'sms' && !transaction.completedChannels.includes('email')) {
      throw new ApiError(
        409,
        'AUTH_EMAIL_VERIFICATION_REQUIRED',
        'Email verification must be completed first.',
      );
    }
    const user = await securitySelection(
      User.findOne({
        _id: transaction.userId,
        status: 'pending_verification',
      }),
    );
    if (!user || user.sessionVersion !== transaction.context.sessionVersionAtStart) {
      throw transactionError();
    }
    return { transaction, user };
  }

  async function requestRegistrationCode({ request, channel }) {
    const { transaction, user } = await registrationContext(request, channel);
    return challenges.send({
      request,
      transaction,
      channel,
      purpose: channel === 'email' ? 'signup_verify_email' : 'signup_verify_phone',
      destination: channel === 'email' ? user.emailNormalized : user.phoneNormalized,
    });
  }

  async function verifyRegistrationCode({ request, channel, code }) {
    const { transaction, user } = await registrationContext(request, channel);
    const purpose = channel === 'email' ? 'signup_verify_email' : 'signup_verify_phone';
    await challenges.verify({ request, transaction, channel, purpose, code });
    const verifiedField = channel === 'email' ? 'emailVerifiedAt' : 'phoneVerifiedAt';
    const userUpdate = await User.updateOne(
      {
        _id: user._id,
        status: 'pending_verification',
        sessionVersion: transaction.context.sessionVersionAtStart,
      },
      { $set: { [verifiedField]: new Date() } },
    );
    if (userUpdate.matchedCount !== 1) throw transactionError();
    const transactionAfterProof = await transactionSelection(
      AuthTransaction.findOneAndUpdate(
        {
          _id: transaction._id,
          stage: 'verify_contacts',
          consumedAt: null,
          expiresAt: mongoose.trusted({ $gt: new Date() }),
          failedSecondStepAttempts: mongoose.trusted({ $lt: transaction.maxAttempts }),
        },
        { $addToSet: { completedChannels: channel } },
        { returnDocument: 'after' },
      ),
    );
    if (!transactionAfterProof) throw transactionError();
    if (
      !['email', 'sms'].every((value) => transactionAfterProof.completedChannels.includes(value))
    ) {
      return responseWithPreauth('VERIFICATION_REQUIRED', transactionAfterProof);
    }

    const consumed = await consumeTransaction(transactionAfterProof, 'verify_contacts');
    if (!consumed) throw transactionError();
    const activated = await activateVerifiedPendingUser(
      user._id,
      transactionAfterProof.context.sessionVersionAtStart,
    );
    if (!activated || !isModernActiveUser(activated)) throw transactionError();
    await rotateAuthenticatedSession(request, activated);
    await recordAuthEvent({ settings, request, type: 'LOGIN_SUCCESS', userId: activated._id });
    return {
      status: 'AUTHENTICATED',
      user: await userPayload(activated),
      preauth: null,
    };
  }

  async function secondStepContext(request, channel, authenticatedUser) {
    const transaction = await boundTransaction(request, {
      types: ['login', 'step_up', 'change_password', 'change_email', 'change_phone'],
      stages: ['second_step'],
      ...(authenticatedUser ? { authenticatedUser } : {}),
    });
    if (!transaction.allowedChannels.includes(channel)) {
      throw new ApiError(400, 'AUTH_CHANNEL_NOT_ALLOWED', 'The channel is not allowed.');
    }
    const user = await securitySelection(User.findById(transaction.userId));
    if (
      !isModernActiveUser(user) ||
      user.sessionVersion !== transaction.context.sessionVersionAtStart
    ) {
      throw transactionError();
    }
    if (transaction.type !== 'login' && !authenticatedUser) throw transactionError();
    return { transaction, user };
  }

  async function requestSecondStep({ request, channel, authenticatedUser }) {
    const { transaction, user } = await secondStepContext(request, channel, authenticatedUser);
    return challenges.send({
      request,
      transaction,
      channel,
      purpose: transaction.type === 'login' ? 'login_second_step' : 'step_up',
      destination: channel === 'email' ? user.emailNormalized : user.phoneNormalized,
    });
  }

  async function verifySecondStep({ request, channel, code, authenticatedUser }) {
    const { transaction, user } = await secondStepContext(request, channel, authenticatedUser);
    const purpose = transaction.type === 'login' ? 'login_second_step' : 'step_up';
    await challenges.verify({ request, transaction, channel, purpose, code });
    const now = new Date();

    if (transaction.type === 'login') {
      const consumed = await consumeTransaction(transaction, 'second_step');
      if (!consumed) throw transactionError();
      const loggedIn = await securitySelection(
        User.findOneAndUpdate(
          {
            _id: user._id,
            status: 'active',
            sessionVersion: transaction.context.sessionVersionAtStart,
          },
          { $set: { lastLoginAt: now } },
          { returnDocument: 'after' },
        ),
      );
      if (!isModernActiveUser(loggedIn)) throw transactionError();
      await rotateAuthenticatedSession(request, loggedIn, now);
      await recordAuthEvent({ settings, request, type: 'LOGIN_SUCCESS', userId: loggedIn._id });
      return {
        status: 'AUTHENTICATED',
        user: await userPayload(loggedIn),
        preauth: null,
      };
    }

    const authorized = await transactionSelection(
      AuthTransaction.findOneAndUpdate(
        {
          _id: transaction._id,
          type: transaction.type,
          stage: 'second_step',
          consumedAt: null,
          expiresAt: mongoose.trusted({ $gt: now }),
          failedSecondStepAttempts: mongoose.trusted({ $lt: transaction.maxAttempts }),
        },
        {
          $set: {
            stage: 'reauthenticated',
            authorizedAt: now,
            expiresAt: new Date(now.getTime() + settings.authStepUpTtlMs),
          },
          $addToSet: { completedChannels: channel },
        },
        { returnDocument: 'after' },
      ),
    );
    if (!authorized) throw transactionError();
    delete request.session.preauth;
    request.session.stepUp = {
      transactionId: authorized._id.toString(),
      purpose: authorized.context.purpose,
      authorizedAt: now.getTime(),
    };
    request.session.secondStepAt = now.getTime();
    await saveSession(request);
    await recordAuthEvent({ settings, request, type: 'REAUTH_SUCCESS', userId: user._id });
    return {
      status: 'REAUTHENTICATED',
      purpose: authorized.context.purpose,
      expiresAt: authorized.expiresAt.toISOString(),
      user: await userPayload(user),
      preauth: null,
    };
  }

  async function recoveryContext(request, channel, stages = ['recovery_verification']) {
    const transaction = await boundTransaction(request, { types: ['password_reset'], stages });
    if (!transaction.allowedChannels.includes(channel)) throw transactionError();
    if (channel === 'sms' && !transaction.completedChannels.includes('email')) {
      throw new ApiError(
        409,
        'AUTH_EMAIL_VERIFICATION_REQUIRED',
        'Email recovery verification must be completed first.',
      );
    }
    const user = await securitySelection(User.findById(transaction.userId));
    return {
      transaction,
      user:
        isModernActiveUser(user) &&
        user.sessionVersion === transaction.context.sessionVersionAtStart
          ? user
          : null,
    };
  }

  async function requestRecoveryCode({ request, channel }) {
    const startedAt = Date.now();
    const { transaction, user } = await recoveryContext(request, channel);
    if (transaction.completedChannels.includes(channel)) {
      throw new ApiError(409, 'AUTH_CHANNEL_ALREADY_VERIFIED', 'The channel is already verified.');
    }
    const decoy = !user || Boolean(transaction.context.decoy);
    try {
      const result = await challenges.send({
        request,
        transaction,
        channel,
        purpose: channel === 'email' ? 'password_reset_email' : 'password_reset_sms',
        destination: decoy
          ? `${transaction._id}:${channel}`
          : channel === 'email'
            ? user.emailNormalized
            : user.phoneNormalized,
        rateLimitSubject: transaction.context.recoverySubjectDigest,
        rateLimitUserSubject: transaction.context.recoverySubjectDigest,
        decoy,
        destinationMasked: '***',
        detachedDelivery: true,
      });
      await minimumRecoveryResponseTime(startedAt);
      return result;
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        !['AUTH_DELIVERY_UNAVAILABLE', 'AUTH_RATE_LIMITED', 'AUTH_TOO_MANY_SENDS'].includes(
          error.code,
        )
      ) {
        throw error;
      }
      await minimumRecoveryResponseTime(startedAt);
      return {
        status: 'CODE_SENT',
        channel,
        destinationMasked: '***',
        retryAfterSeconds: Math.ceil(settings.authResendCooldownMs / 1_000),
        expiresInSeconds: Math.ceil(settings.authCodeTtlMs / 1_000),
      };
    }
  }

  async function verifyRecoveryCode({ request, channel, code }) {
    const { transaction, user } = await recoveryContext(request, channel);
    if (transaction.completedChannels.includes(channel)) throw transactionError();
    await challenges.verify({
      request,
      transaction,
      channel,
      purpose: channel === 'email' ? 'password_reset_email' : 'password_reset_sms',
      code,
      rateLimitSubject: transaction.context.recoverySubjectDigest,
      rateLimitUserSubject: transaction.context.recoverySubjectDigest,
    });
    if (!user || transaction.context.decoy)
      throw new ApiError(400, 'AUTH_INVALID_CODE', 'The authentication code is invalid.');
    const nextCompleted = [...new Set([...transaction.completedChannels, channel])];
    const ready = ['email', 'sms'].every((value) => nextCompleted.includes(value));
    const updated = await transactionSelection(
      AuthTransaction.findOneAndUpdate(
        {
          _id: transaction._id,
          stage: 'recovery_verification',
          consumedAt: null,
          expiresAt: mongoose.trusted({ $gt: new Date() }),
          failedSecondStepAttempts: mongoose.trusted({ $lt: transaction.maxAttempts }),
        },
        {
          $addToSet: { completedChannels: channel },
          ...(ready ? { $set: { stage: 'ready_for_password_reset' } } : {}),
        },
        { returnDocument: 'after' },
      ),
    );
    if (!updated) throw transactionError();
    return responseWithPreauth(
      ready ? 'READY_FOR_PASSWORD_RESET' : 'RECOVERY_VERIFICATION_REQUIRED',
      updated,
    );
  }

  async function resetPassword({ request, password }) {
    const transaction = await boundTransaction(request, {
      types: ['password_reset'],
      stages: ['ready_for_password_reset'],
    });
    if (transaction.context.decoy) throw transactionError();
    const passwordHash = await hashPassword(password, settings);
    const consumed = await consumeTransaction(transaction, 'ready_for_password_reset');
    if (!consumed) throw transactionError();
    const changed = await securitySelection(
      User.findOneAndUpdate(
        {
          _id: transaction.userId,
          status: 'active',
          sessionVersion: transaction.context.sessionVersionAtStart,
        },
        {
          $set: { passwordHash, passwordChangedAt: new Date() },
          $inc: { sessionVersion: 1 },
        },
        { returnDocument: 'after', runValidators: true },
      ),
    );
    if (!changed) throw transactionError();
    await recordAuthEvent({
      settings,
      request,
      type: 'PASSWORD_RESET',
      userId: transaction.userId,
    });
    await notifySecurityChange(changed, 'password_reset');
    await destroySession(request);
    return { success: true };
  }

  async function reauthenticate({ request, user, purpose, currentPassword }) {
    const securedUser = await securitySelection(User.findById(user._id));
    if (!isModernActiveUser(securedUser)) throw reauthError();
    await enforceCredentialLimit(
      request,
      'reauth:user',
      securedUser._id.toString(),
      securedUser._id,
    );
    if (!(await verifyPassword(securedUser.passwordHash, currentPassword))) {
      throw new ApiError(401, 'AUTH_INVALID_CREDENTIALS', 'The current password is invalid.');
    }
    if (request.session.stepUp?.transactionId) {
      await AuthTransaction.updateOne(
        { _id: request.session.stepUp.transactionId, consumedAt: null },
        { $set: { stage: 'completed', consumedAt: new Date() } },
      );
      delete request.session.stepUp;
    }
    const transaction = await createTransaction({
      request,
      settings,
      type: purpose,
      userId: securedUser._id,
      stage: 'second_step',
      allowedChannels: ['email', 'sms'],
      purpose,
      publicPreauth: false,
      destinationMasks: {
        email: maskDestination('email', securedUser.email),
        sms: maskDestination('sms', securedUser.phone),
      },
      sessionVersionAtStart: securedUser.sessionVersion,
    });
    await recordAuthEvent({ settings, request, type: 'REAUTH_STARTED', userId: securedUser._id });
    return responseWithPreauth('SECOND_STEP_REQUIRED', transaction);
  }

  async function stepUpGrant(request, user, purpose, stages = ['reauthenticated']) {
    const reference = request.session?.stepUp;
    if (!reference || reference.purpose !== purpose) throw reauthError();
    const transaction = await transactionSelection(
      AuthTransaction.findById(reference.transactionId),
    );
    const now = new Date();
    if (
      !transaction ||
      !['step_up', purpose].includes(transaction.type) ||
      !stages.includes(transaction.stage) ||
      transaction.consumedAt ||
      transaction.expiresAt <= now ||
      !transaction.authorizedAt ||
      now - transaction.authorizedAt > settings.authStepUpTtlMs ||
      !transaction.userId.equals(user._id) ||
      transaction.context.sessionVersionAtStart !== user.sessionVersion ||
      transaction.context.purpose !== purpose
    ) {
      delete request.session.stepUp;
      await saveSession(request);
      throw reauthError();
    }
    return transaction;
  }

  async function refreshCurrentSession(request, user, now = new Date()) {
    await rotateAuthenticatedSession(request, user, now);
  }

  async function changePassword({ request, user, password }) {
    const transaction = await stepUpGrant(request, user, 'change_password');
    const passwordHash = await hashPassword(password, settings);
    const consumed = await consumeTransaction(transaction, 'reauthenticated');
    if (!consumed) throw reauthError();
    const changed = await securitySelection(
      User.findOneAndUpdate(
        {
          _id: user._id,
          status: 'active',
          sessionVersion: transaction.context.sessionVersionAtStart,
        },
        {
          $set: { passwordHash, passwordChangedAt: new Date() },
          $inc: { sessionVersion: 1 },
        },
        { returnDocument: 'after', runValidators: true },
      ),
    );
    if (!changed) throw reauthError();
    await refreshCurrentSession(request, changed);
    await recordAuthEvent({ settings, request, type: 'PASSWORD_CHANGED', userId: changed._id });
    await notifySecurityChange(changed, 'password_changed');
    return { status: 'PASSWORD_CHANGED', user: await userPayload(changed), preauth: null };
  }

  async function requestContactChange({ request, user, channel, destination }) {
    const purpose = channel === 'email' ? 'change_email' : 'change_phone';
    const transaction = await stepUpGrant(request, user, purpose, [
      'reauthenticated',
      'new_contact_verification',
    ]);
    const normalizedField = channel === 'email' ? 'emailNormalized' : 'phoneNormalized';
    const current = channel === 'email' ? user.email : user.phone;
    if (destination === current) {
      throw new ApiError(409, 'AUTH_CONTACT_UNCHANGED', 'The new contact must be different.');
    }
    if (await User.exists({ [normalizedField]: destination })) {
      throw new ApiError(409, 'AUTH_IDENTITY_CONFLICT', 'The contact is unavailable.');
    }
    if (
      transaction.stage === 'new_contact_verification' &&
      transaction.context.newDestination !== destination
    ) {
      throw reauthError();
    }
    const updated = await transactionSelection(
      AuthTransaction.findOneAndUpdate(
        { _id: transaction._id, consumedAt: null, stage: transaction.stage },
        {
          $set: {
            stage: 'new_contact_verification',
            allowedChannels: [channel],
            completedChannels: [],
            'context.newDestination': destination,
            'context.destinationMasks': { [channel]: maskDestination(channel, destination) },
          },
        },
        { returnDocument: 'after' },
      ),
    );
    if (!updated) throw reauthError();
    return challenges.send({
      request,
      transaction: updated,
      channel,
      purpose,
      destination,
    });
  }

  async function verifyContactChange({ request, user, channel, code }) {
    const purpose = channel === 'email' ? 'change_email' : 'change_phone';
    const transaction = await stepUpGrant(request, user, purpose, ['new_contact_verification']);
    const destination = transaction.context.newDestination;
    if (!destination) throw reauthError();
    await challenges.verify({ request, transaction, channel, purpose, code });
    const consumed = await consumeTransaction(transaction, 'new_contact_verification');
    if (!consumed) throw reauthError();

    const publicField = channel === 'email' ? 'email' : 'phone';
    const normalizedField = channel === 'email' ? 'emailNormalized' : 'phoneNormalized';
    const verifiedField = channel === 'email' ? 'emailVerifiedAt' : 'phoneVerifiedAt';
    let changed;
    try {
      changed = await securitySelection(
        User.findOneAndUpdate(
          {
            _id: user._id,
            status: 'active',
            sessionVersion: transaction.context.sessionVersionAtStart,
          },
          {
            $set: {
              [publicField]: destination,
              [normalizedField]: destination,
              [verifiedField]: new Date(),
            },
            $inc: { sessionVersion: 1 },
          },
          { returnDocument: 'after', runValidators: true },
        ),
      );
    } catch (error) {
      if (error?.code === 11_000) {
        throw new ApiError(409, 'AUTH_IDENTITY_CONFLICT', 'The contact is unavailable.');
      }
      throw error;
    }
    if (!changed) throw reauthError();
    await refreshCurrentSession(request, changed);
    await recordAuthEvent({
      settings,
      request,
      type: channel === 'email' ? 'EMAIL_CHANGED' : 'PHONE_CHANGED',
      userId: changed._id,
    });
    const previousNotification =
      channel === 'email'
        ? emailSender.sendSecurityNotification?.({
            destination: user.email,
            event: 'email_changed',
          })
        : smsSender.sendSecurityNotification?.({ destination: user.phone, event: 'phone_changed' });
    await notifySecurityChange(
      changed,
      channel === 'email' ? 'email_changed' : 'phone_changed',
      previousNotification ? [previousNotification] : [],
    );
    return {
      status: channel === 'email' ? 'EMAIL_CHANGED' : 'PHONE_CHANGED',
      user: await userPayload(changed),
      preauth: null,
    };
  }

  async function getMe({ request, user }) {
    let preauth = null;
    const transactionId = request.session?.preauth?.transactionId;
    if (transactionId) {
      const transaction = await transactionSelection(AuthTransaction.findById(transactionId));
      if (transaction && !transaction.consumedAt && transaction.expiresAt > new Date()) {
        preauth = serializePreauth(transaction);
      } else {
        delete request.session.preauth;
        await saveSession(request);
      }
    }
    if (!preauth && user && request.session?.stepUp?.transactionId) {
      const transaction = await transactionSelection(
        AuthTransaction.findById(request.session.stepUp.transactionId),
      );
      const now = new Date();
      if (
        transaction &&
        ['step_up', 'change_password', 'change_email', 'change_phone'].includes(transaction.type) &&
        ['reauthenticated', 'new_contact_verification'].includes(transaction.stage) &&
        !transaction.consumedAt &&
        transaction.expiresAt > now &&
        transaction.userId.equals(user._id) &&
        transaction.context.sessionVersionAtStart === user.sessionVersion &&
        transaction.context.purpose === request.session.stepUp.purpose
      ) {
        preauth = serializePreauth(transaction);
      } else {
        delete request.session.stepUp;
        await saveSession(request);
      }
    }
    return {
      user: user ? await userPayload(user) : null,
      preauth,
      termsVersion: settings.authTermsVersion,
    };
  }

  async function updateProfile({ user, profile }) {
    const updated = await ApplicantProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: profile, $setOnInsert: { userId: user._id } },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
    );
    return { user: serializeAuthUser(user, updated) };
  }

  return {
    changePassword,
    forgotPassword,
    getMe,
    login,
    reauthenticate,
    register,
    requestContactChange,
    requestRecoveryCode,
    requestRegistrationCode,
    requestSecondStep,
    resetPassword,
    updateProfile,
    verifyContactChange,
    verifyRecoveryCode,
    verifyRegistrationCode,
    verifySecondStep,
  };
}
