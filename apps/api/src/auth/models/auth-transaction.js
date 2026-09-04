import mongoose from 'mongoose';

import { AUTH_INDEX_DEFINITIONS } from '../index-names.js';

const contextSchema = new mongoose.Schema(
  {
    purpose: {
      type: String,
      enum: ['change_password', 'change_email', 'change_phone'],
      default: null,
    },
    newDestination: { type: String, default: null, maxlength: 254, select: false },
    destinationMasks: {
      email: { type: String, default: null, maxlength: 254 },
      sms: { type: String, default: null, maxlength: 32 },
    },
    decoy: { type: Boolean, default: false, select: false },
    recoverySubjectDigest: {
      type: String,
      default: null,
      maxlength: 64,
      match: /^[a-f0-9]{64}$/,
      select: false,
    },
    twoStepBypassed: { type: Boolean, default: false, select: false },
    sessionVersionAtStart: { type: Number, min: 0, required: true, select: false },
  },
  { _id: false, strict: 'throw' },
);

const authTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'signup',
        'login',
        'admin_login',
        'password_reset',
        'change_password',
        'change_email',
        'change_phone',
        'step_up',
      ],
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stage: {
      type: String,
      enum: [
        'verify_contacts',
        'second_step',
        'recovery_verification',
        'ready_for_password_reset',
        'reauthenticated',
        'new_contact_verification',
        'completed',
        'locked',
      ],
      required: true,
    },
    allowedChannels: {
      type: [{ type: String, enum: ['email', 'sms'] }],
      required: true,
    },
    completedChannels: {
      type: [{ type: String, enum: ['email', 'sms'] }],
      default: [],
    },
    failedSecondStepAttempts: { type: Number, min: 0, default: 0, required: true },
    maxAttempts: { type: Number, min: 1, max: 10, required: true },
    sendCountEmail: { type: Number, min: 0, default: 0, required: true },
    sendCountSms: { type: Number, min: 0, default: 0, required: true },
    sendCountTotal: { type: Number, min: 0, default: 0, required: true },
    maxSends: { type: Number, min: 1, max: 10, required: true },
    lastSentAtEmail: { type: Date, default: null },
    lastSentAtSms: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
    authorizedAt: { type: Date, default: null },
    context: { type: contextSchema, default: () => ({ destinationMasks: {} }) },
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);

for (const { key, options } of AUTH_INDEX_DEFINITIONS.transaction) {
  authTransactionSchema.index(key, options);
}

export const AuthTransaction =
  mongoose.models.AuthTransaction ?? mongoose.model('AuthTransaction', authTransactionSchema);
