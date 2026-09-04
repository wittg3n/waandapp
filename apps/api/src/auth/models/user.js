import mongoose from 'mongoose';

import { AUTH_INDEX_DEFINITIONS } from '../index-names.js';
import { normalizeEmail, normalizePhone, normalizeUsername } from '../normalization.js';

const securitySchema = new mongoose.Schema(
  {
    failedLoginCount: { type: Number, default: 0, min: 0 },
    lastFailedLoginAt: { type: Date, default: null },
    lockedUntil: { type: Date, default: null },
  },
  { _id: false, strict: 'throw' },
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 30 },
    usernameNormalized: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
      select: false,
    },
    email: { type: String, required: true, maxlength: 254 },
    emailNormalized: { type: String, required: true, maxlength: 254, select: false },
    phone: { type: String, required: true, maxlength: 16 },
    phoneNormalized: { type: String, required: true, maxlength: 16, select: false },
    passwordHash: {
      type: String,
      required: true,
      match: /^\$argon2id\$/,
      select: false,
    },
    emailVerifiedAt: { type: Date, default: null },
    phoneVerifiedAt: { type: Date, default: null },
    role: {
      type: String,
      enum: ['applicant', 'staff', 'admin'],
      default: 'applicant',
      required: true,
    },
    adminRoles: {
      type: [{ type: String, enum: ['SUPPORT', 'CONTENT_MANAGER', 'BLOG_EDITOR', 'OPERATIONS_ADMIN', 'ADMIN', 'SUPER_ADMIN'] }],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending_verification', 'active', 'suspended', 'deleted'],
      default: 'pending_verification',
      required: true,
    },
    passwordChangedAt: { type: Date, required: true, default: Date.now },
    sessionVersion: { type: Number, default: 0, min: 0, required: true, select: false },
    security: { type: securitySchema, default: () => ({}) },
    lastLoginAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);

// Deleted identities deliberately remain covered by these unique indexes.
for (const { key, options } of AUTH_INDEX_DEFINITIONS.user) userSchema.index(key, options);
userSchema.index(
  { adminRoles: 1, status: 1, createdAt: -1 },
  { name: 'admin_user_roles_status' },
);
userSchema.index({ status: 1, createdAt: -1 }, { name: 'admin_user_status_created' });

userSchema.pre('validate', function normalizeIdentities() {
  if (this.username) this.usernameNormalized = normalizeUsername(this.username);
  if (this.email) this.emailNormalized = normalizeEmail(this.email);
  if (this.phone) this.phoneNormalized = normalizePhone(this.phone);
});

export const User = mongoose.models.User ?? mongoose.model('User', userSchema);
