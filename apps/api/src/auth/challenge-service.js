import { randomUUID } from 'node:crypto';

import mongoose from 'mongoose';

import { ApiError } from '../middleware/errors.js';
import { recordAuthEvent } from './audit.js';
import {
  generateAuthenticationCode,
  hashAuthenticationCode,
  verifyAuthenticationCode,
} from './code.js';
import { DeliveryUnavailableError, isDevNoTwoStep } from './delivery.js';
import { AuthChallenge } from './models/auth-challenge.js';
import { AuthTransaction } from './models/auth-transaction.js';
import { maskDestination } from './normalization.js';
import { enforceDestinationLimit, enforceResendCooldown } from './rate-limit.js';

export const DEVELOPMENT_AUTHENTICATION_CODE = '000000';

export function generateChallengeCode(settings) {
  return settings.authDeliveryMode === 'development'
    ? DEVELOPMENT_AUTHENTICATION_CODE
    : generateAuthenticationCode();
}

function seconds(milliseconds) {
  return Math.ceil(milliseconds / 1_000);
}

function rateLimitError(milliseconds) {
  const retryAfterSeconds = Math.max(1, seconds(milliseconds));
  return new ApiError(429, 'AUTH_RATE_LIMITED', 'Too many authentication attempts.', {
    details: { retryAfterSeconds },
    headers: { 'Retry-After': String(retryAfterSeconds) },
  });
}

function invalidCodeError() {
  return new ApiError(400, 'AUTH_INVALID_CODE', 'The authentication code is invalid.');
}

async function reserveSend(transaction, channel, settings) {
  const countField = channel === 'email' ? 'sendCountEmail' : 'sendCountSms';
  const sentField = channel === 'email' ? 'lastSentAtEmail' : 'lastSentAtSms';
  const now = new Date();
  const cooldownBoundary = new Date(now.getTime() - settings.authResendCooldownMs);
  const reserved = await AuthTransaction.findOneAndUpdate(
    {
      _id: transaction._id,
      consumedAt: null,
      stage: transaction.stage,
      expiresAt: mongoose.trusted({ $gt: now }),
      [countField]: mongoose.trusted({ $lt: transaction.maxSends }),
      sendCountTotal: mongoose.trusted({ $lt: transaction.maxSends }),
      $or: [{ [sentField]: null }, { [sentField]: mongoose.trusted({ $lte: cooldownBoundary }) }],
    },
    { $inc: { [countField]: 1, sendCountTotal: 1 }, $set: { [sentField]: now } },
    { returnDocument: 'after' },
  );

  if (reserved) return reserved;
  const current = await AuthTransaction.findById(transaction._id);
  if (!current || current.consumedAt || current.stage !== transaction.stage) {
    throw new ApiError(401, 'AUTH_PREAUTH_INVALID', 'The authentication transaction is invalid.');
  }
  if (current[countField] >= current.maxSends || current.sendCountTotal >= current.maxSends) {
    throw new ApiError(429, 'AUTH_TOO_MANY_SENDS', 'The authentication send limit was reached.');
  }
  const remaining = settings.authResendCooldownMs - (now - current[sentField]);
  throw rateLimitError(remaining);
}

export function createChallengeService({
  redis,
  settings,
  emailSender,
  smsSender,
  codeVerifier = verifyAuthenticationCode,
  codeGenerator,
}) {
  const generateCode = codeGenerator ?? (() => generateChallengeCode(settings));
  async function enforceSharedLimits({
    namespace,
    destination,
    userId,
    transactionId,
    windowMs,
    limit,
  }) {
    await Promise.all([
      enforceDestinationLimit({
        redis,
        settings,
        namespace: `${namespace}:destination`,
        destination,
        windowMs,
        limit,
      }),
      enforceDestinationLimit({
        redis,
        settings,
        namespace: `${namespace}:user`,
        destination: userId.toString(),
        windowMs,
        limit,
      }),
      enforceDestinationLimit({
        redis,
        settings,
        namespace: `${namespace}:transaction`,
        destination: transactionId.toString(),
        windowMs,
        limit,
      }),
    ]);
  }

  async function send({
    request,
    transaction,
    channel,
    purpose,
    destination,
    rateLimitSubject,
    rateLimitUserSubject,
    decoy = false,
    destinationMasked,
    detachedDelivery = false,
  }) {
    if (isDevNoTwoStep(settings)) {
      throw new ApiError(401, 'AUTH_PREAUTH_INVALID', 'Two-step verification is disabled.');
    }
    const limitDestination =
      rateLimitSubject ?? (decoy ? `${transaction._id}:${channel}` : destination);
    const limitUser = rateLimitUserSubject ?? transaction.userId;
    try {
      await enforceResendCooldown({
        redis,
        settings,
        channel,
        destination: limitDestination,
      });
      await enforceSharedLimits({
        namespace: `request:${channel}`,
        destination: limitDestination,
        userId: limitUser,
        transactionId: transaction._id,
        windowMs: settings.authRequestDestinationWindowMs,
        limit: settings.authRequestDestinationLimit,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        await recordAuthEvent({
          settings,
          request,
          type: 'RATE_LIMIT_TRIGGERED',
          userId: transaction.userId,
          channel,
          destination: decoy ? undefined : destination,
          reason: 'challenge_request',
        });
      }
      throw error;
    }

    const reserved = await reserveSend(transaction, channel, settings);
    const resendSequence = channel === 'email' ? reserved.sendCountEmail : reserved.sendCountSms;
    const challengeId = randomUUID();
    const code = generateCode();
    const expiresAt = new Date(Date.now() + settings.authCodeTtlMs);
    const codeDigest = hashAuthenticationCode({
      pepper: settings.authCodePepper,
      transactionId: transaction._id.toString(),
      challengeId,
      purpose,
      userId: transaction.userId.toString(),
      channel,
      destination,
      code,
    });

    if (!decoy && !detachedDelivery) {
      const sender = channel === 'email' ? emailSender : smsSender;
      try {
        await sender.sendAuthenticationCode({
          destination,
          code,
          expiresInSeconds: seconds(settings.authCodeTtlMs),
        });
      } catch (error) {
        if (error instanceof DeliveryUnavailableError) {
          throw new ApiError(
            503,
            'AUTH_DELIVERY_UNAVAILABLE',
            'Authentication code delivery is temporarily unavailable.',
          );
        }
        throw error;
      }
    }

    const stillActive = await AuthTransaction.exists({
      _id: transaction._id,
      consumedAt: null,
      stage: transaction.stage,
      expiresAt: mongoose.trusted({ $gt: new Date() }),
    });
    if (!stillActive) {
      throw new ApiError(401, 'AUTH_PREAUTH_INVALID', 'The authentication transaction is invalid.');
    }

    const createdChallenge = await AuthChallenge.create({
      transactionId: transaction._id,
      challengeId,
      purpose,
      userId: transaction.userId,
      channel,
      destinationSnapshot: destination,
      codeDigest,
      status: 'pending',
      expiresAt,
      resendSequence,
    });
    const supersedeOlderChallenges = async () => {
      await AuthChallenge.updateMany(
        {
          transactionId: transaction._id,
          purpose,
          channel,
          status: 'pending',
          resendSequence: mongoose.trusted({ $lt: resendSequence }),
        },
        { $set: { status: 'expired' } },
      );
      const newerChallengeExists = await AuthChallenge.exists({
        transactionId: transaction._id,
        purpose,
        channel,
        status: 'pending',
        resendSequence: mongoose.trusted({ $gt: resendSequence }),
      });
      if (newerChallengeExists) {
        await AuthChallenge.updateOne(
          { _id: createdChallenge._id, status: 'pending' },
          { $set: { status: 'expired' } },
        );
      }
    };
    if (!detachedDelivery || decoy) {
      await supersedeOlderChallenges();
    } else {
      const sender = channel === 'email' ? emailSender : smsSender;
      void sender
        .sendAuthenticationCode({
          destination,
          code,
          expiresInSeconds: seconds(settings.authCodeTtlMs),
        })
        .then(supersedeOlderChallenges)
        .catch(() =>
          AuthChallenge.updateOne(
            { _id: createdChallenge._id, status: 'pending' },
            { $set: { status: 'expired' } },
          ),
        )
        .catch(() => {});
    }

    await recordAuthEvent({
      settings,
      request,
      type: 'AUTH_CODE_REQUESTED',
      userId: transaction.userId,
      channel,
      destination: decoy ? undefined : destination,
      reason: purpose,
    });

    return {
      status: 'CODE_SENT',
      channel,
      destinationMasked:
        destinationMasked ?? (decoy ? '***' : maskDestination(channel, destination)),
      retryAfterSeconds: seconds(settings.authResendCooldownMs),
      expiresInSeconds: seconds(settings.authCodeTtlMs),
    };
  }

  async function verify({
    request,
    transaction,
    channel,
    purpose,
    code,
    rateLimitSubject,
    rateLimitUserSubject,
  }) {
    if (isDevNoTwoStep(settings)) {
      throw new ApiError(401, 'AUTH_PREAUTH_INVALID', 'Two-step verification is disabled.');
    }
    if (transaction.failedSecondStepAttempts >= transaction.maxAttempts) {
      throw new ApiError(429, 'AUTH_TOO_MANY_ATTEMPTS', 'The transaction is locked.');
    }

    let challenge = await AuthChallenge.findOne({
      transactionId: transaction._id,
      purpose,
      channel,
      status: 'pending',
    })
      .sort({ resendSequence: -1 })
      .select('+codeDigest +destinationSnapshot');

    challenge ??= await AuthChallenge.findOne({
      transactionId: transaction._id,
      purpose,
      channel,
    })
      .sort({ resendSequence: -1 })
      .select('+codeDigest +destinationSnapshot');

    const now = new Date();
    if (!challenge || challenge.status !== 'pending') throw invalidCodeError();
    if (challenge.expiresAt <= now) {
      await AuthChallenge.updateOne(
        { _id: challenge._id, status: 'pending' },
        { $set: { status: 'expired' } },
      );
      throw new ApiError(400, 'AUTH_CODE_EXPIRED', 'The authentication code has expired.');
    }

    try {
      await enforceSharedLimits({
        namespace: `verify:${channel}`,
        destination: rateLimitSubject ?? challenge.destinationSnapshot,
        userId: rateLimitUserSubject ?? transaction.userId,
        transactionId: transaction._id,
        windowMs: settings.authVerifyDestinationWindowMs,
        limit: settings.authVerifyDestinationLimit,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        await recordAuthEvent({
          settings,
          request,
          type: 'RATE_LIMIT_TRIGGERED',
          userId: transaction.userId,
          channel,
          reason: 'challenge_verify',
        });
      }
      throw error;
    }

    const valid = await codeVerifier(
      {
        pepper: settings.authCodePepper,
        transactionId: transaction._id.toString(),
        challengeId: challenge.challengeId,
        purpose,
        userId: transaction.userId.toString(),
        channel,
        destination: challenge.destinationSnapshot,
        code,
      },
      challenge.codeDigest,
    );

    if (!valid) {
      const failed = await AuthTransaction.findOneAndUpdate(
        {
          _id: transaction._id,
          consumedAt: null,
          stage: transaction.stage,
          failedSecondStepAttempts: mongoose.trusted({ $lt: transaction.maxAttempts }),
        },
        { $inc: { failedSecondStepAttempts: 1 } },
        { returnDocument: 'after' },
      );
      const locked = !failed || failed.failedSecondStepAttempts >= failed.maxAttempts;
      if (locked) {
        await Promise.all([
          AuthTransaction.updateOne(
            { _id: transaction._id, consumedAt: null },
            { $set: { stage: 'locked', consumedAt: new Date() } },
          ),
          AuthChallenge.updateMany(
            { transactionId: transaction._id, status: 'pending' },
            { $set: { status: 'locked' } },
          ),
        ]);
      }
      await recordAuthEvent({
        settings,
        request,
        type: locked ? 'AUTH_CHALLENGE_LOCKED' : 'AUTH_CODE_VERIFY_FAILED',
        userId: transaction.userId,
        channel,
        reason: purpose,
      });
      if (locked) {
        throw new ApiError(429, 'AUTH_TOO_MANY_ATTEMPTS', 'The transaction is locked.');
      }
      throw invalidCodeError();
    }

    const consumed = await AuthChallenge.findOneAndUpdate(
      {
        _id: challenge._id,
        transactionId: transaction._id,
        userId: transaction.userId,
        purpose,
        channel,
        codeDigest: challenge.codeDigest,
        status: 'pending',
        expiresAt: mongoose.trusted({ $gt: now }),
      },
      { $set: { status: 'consumed', consumedAt: now } },
      { returnDocument: 'after' },
    );
    if (!consumed) throw invalidCodeError();

    await recordAuthEvent({
      settings,
      request,
      type: 'AUTH_CODE_VERIFY_SUCCESS',
      userId: transaction.userId,
      channel,
      reason: purpose,
    });
    return consumed;
  }

  return { send, verify };
}
