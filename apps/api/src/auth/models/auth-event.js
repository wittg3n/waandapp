import mongoose from 'mongoose';

import { AUTH_INDEX_DEFINITIONS } from '../index-names.js';

const eventTypes = [
  'REGISTER_CREATED',
  'REGISTER_RESUMED',
  'PRIMARY_AUTH_SUCCESS',
  'PRIMARY_AUTH_FAILED',
  'AUTH_CODE_REQUESTED',
  'AUTH_CODE_VERIFY_SUCCESS',
  'AUTH_CODE_VERIFY_FAILED',
  'AUTH_CHALLENGE_LOCKED',
  'LOGIN_SUCCESS',
  'PASSWORD_RECOVERY_STARTED',
  'PASSWORD_RESET',
  'REAUTH_STARTED',
  'REAUTH_SUCCESS',
  'PASSWORD_CHANGED',
  'EMAIL_CHANGED',
  'PHONE_CHANGED',
  'LOGOUT',
  'LOGOUT_ALL',
  'SESSION_REVOKED',
  'ACCOUNT_SUSPENDED_LOGIN_ATTEMPT',
  'RATE_LIMIT_TRIGGERED',
];

const authEventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: eventTypes, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    channel: { type: String, enum: ['email', 'sms'], default: null },
    destinationMasked: { type: String, default: null, maxlength: 254 },
    ipHash: { type: String, default: null, maxlength: 64 },
    requestId: { type: String, default: null, maxlength: 128 },
    reason: { type: String, default: null, maxlength: 80 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: 'throw', versionKey: false },
);

for (const { key, options } of AUTH_INDEX_DEFINITIONS.event) authEventSchema.index(key, options);

export const AuthEvent = mongoose.models.AuthEvent ?? mongoose.model('AuthEvent', authEventSchema);
