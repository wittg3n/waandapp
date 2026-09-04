import mongoose from 'mongoose';

import { AUTH_INDEX_DEFINITIONS } from '../index-names.js';

const authChallengeSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthTransaction',
      required: true,
    },
    challengeId: { type: String, required: true, maxlength: 64 },
    purpose: {
      type: String,
      enum: [
        'signup_verify_email',
        'signup_verify_phone',
        'login_second_step',
        'admin_login_second_step',
        'password_reset_email',
        'password_reset_sms',
        'step_up',
        'change_email',
        'change_phone',
      ],
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: String, enum: ['email', 'sms'], required: true },
    destinationSnapshot: { type: String, required: true, maxlength: 254, select: false },
    codeDigest: { type: String, required: true, select: false },
    status: {
      type: String,
      enum: ['pending', 'consumed', 'expired', 'locked'],
      default: 'pending',
      required: true,
    },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
    resendSequence: { type: Number, min: 1, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: 'throw', versionKey: false },
);

for (const { key, options } of AUTH_INDEX_DEFINITIONS.challenge) {
  authChallengeSchema.index(key, options);
}

export const AuthChallenge =
  mongoose.models.AuthChallenge ?? mongoose.model('AuthChallenge', authChallengeSchema);
