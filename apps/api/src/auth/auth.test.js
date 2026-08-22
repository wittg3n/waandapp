import assert from 'node:assert/strict';
import { test } from 'node:test';

import { AUTH_INDEX_DEFINITIONS } from './index-names.js';
import {
  generateAuthenticationCode,
  hashAuthenticationCode,
  verifyAuthenticationCode,
} from './code.js';
import {
  createDeliverySenders,
  createWebhookSender,
  DeliveryUnavailableError,
} from './delivery.js';
import {
  normalizeCode,
  normalizeEmail,
  normalizePhone,
  normalizeUsername,
} from './normalization.js';
import { argon2Options, hashPassword, isCommonPassword, verifyPassword } from './password.js';
import {
  createRegisterSchema,
  loginSchema,
  passwordResetSchema,
  phoneChangeRequestSchema,
  profileSchema,
} from './schemas.js';
import { serializePreauth } from './serialization.js';
import { User } from './models/user.js';

const passwordSettings = {
  authArgon2MemoryKib: 19_456,
  authArgon2TimeCost: 2,
  authArgon2Parallelism: 1,
};

test('normalizes lookup identities without inferring a phone country', () => {
  assert.equal(normalizeEmail('  USER@Example.COM '), 'user@example.com');
  assert.equal(normalizeUsername('  User.Name_1 '), 'user.name_1');
  assert.equal(normalizePhone('+989121234567'), '+989121234567');
  assert.equal(normalizeCode(' ۱۲۳٤٥۶ '), '123456');
  assert.throws(() => normalizePhone('09121234567'));
  assert.throws(() => normalizePhone('+98 (912) 123-4567'));
  assert.throws(() => normalizePhone('call:+989121234567'));
});

test('User model canonicalizes every identity before validation', async () => {
  const user = new User({
    firstName: 'سارا',
    lastName: 'احمدی',
    username: 'Mixed.User',
    usernameNormalized: 'wrong',
    email: 'Mixed@Example.COM',
    emailNormalized: 'wrong',
    phone: '+989121234567',
    phoneNormalized: '+989121234568',
    passwordHash: '$argon2id$v=19$m=19456,t=2,p=1$placeholder$placeholder',
  });
  await user.validate();
  assert.equal(user.usernameNormalized, 'mixed.user');
  assert.equal(user.emailNormalized, 'mixed@example.com');
  assert.equal(user.phoneNormalized, '+989121234567');
});

test('Argon2id hashing uses the configured floor and library verification', async () => {
  const password = 'فضای امن با گذرواژه طولانی ۱۴۰۵';
  const hash = await hashPassword(password, passwordSettings);

  assert.equal(argon2Options(passwordSettings).memoryCost, 19_456);
  assert.match(hash, /^\$argon2id\$v=19\$/);
  assert.equal(hash.includes(password), false);
  assert.equal(await verifyPassword(hash, password), true);
  assert.equal(await verifyPassword(hash, `${password}!`), false);
  assert.equal(await verifyPassword('legacy-plaintext', password), false);
});

test('password validation allows spaces and 128 Unicode code points but blocks common values', () => {
  const schema = createRegisterSchema('2026-08');
  const base = {
    firstName: 'سارا',
    lastName: 'احمدی',
    username: 'Sara.User',
    email: 'SARA@example.com',
    phone: '+989121234567',
    termsAccepted: true,
    termsVersion: '2026-08',
  };
  const unicode = '🔐'.repeat(128);
  const parsed = schema.parse({ ...base, password: unicode, passwordConfirmation: unicode });
  assert.equal(Array.from(parsed.password).length, 128);
  assert.equal(parsed.username, 'sara.user');
  assert.equal(
    schema.safeParse({ ...base, password: 'password123', passwordConfirmation: 'password123' })
      .success,
    false,
  );
  assert.equal(isCommonPassword(' QWERTY123456 '), true);
  assert.equal(
    schema.safeParse({ ...base, password: ' '.repeat(12), passwordConfirmation: ' '.repeat(12) })
      .success,
    false,
  );
  assert.equal(
    schema.safeParse({
      ...base,
      password: 'a secure phrase with spaces',
      passwordConfirmation: 'different secure phrase',
    }).success,
    false,
  );
  assert.equal(
    schema.safeParse({ ...base, password: unicode, passwordConfirmation: unicode, role: 'admin' })
      .success,
    false,
  );
  assert.equal(
    schema.safeParse({
      ...base,
      email: { $ne: null },
      password: unicode,
      passwordConfirmation: unicode,
    }).success,
    false,
  );
  assert.equal(
    schema.safeParse({
      ...base,
      username: 'admin',
      password: unicode,
      passwordConfirmation: unicode,
    }).success,
    false,
  );
  assert.equal(
    loginSchema.safeParse({ identifier: 'admin', password: 'legacy value' }).success,
    true,
  );
  assert.equal(phoneChangeRequestSchema.safeParse({ phone: '09121234567' }).success, false);
  assert.equal(
    passwordResetSchema.safeParse({ password: unicode, passwordConfirmation: unicode }).success,
    true,
  );
});

test('authentication code HMAC is bound to ceremony, challenge, purpose, user, channel, and destination', () => {
  const code = generateAuthenticationCode();
  const input = {
    pepper: 'p'.repeat(64),
    transactionId: 'transaction-1',
    challengeId: 'challenge-1',
    purpose: 'login_second_step',
    userId: 'user-1',
    channel: 'email',
    destination: 'user@example.com',
    code,
  };
  const digest = hashAuthenticationCode(input);
  assert.match(code, /^\d{6}$/);
  assert.match(digest, /^[a-f\d]{64}$/);
  assert.equal(digest.includes(code), false);
  assert.equal(verifyAuthenticationCode(input, digest), true);
  for (const changed of [
    { challengeId: 'challenge-2' },
    { transactionId: 'transaction-2' },
    { purpose: 'password_reset_email' },
    { userId: 'user-2' },
    { channel: 'sms' },
    { destination: 'other@example.com' },
    { code: code === '999999' ? '999998' : '999999' },
  ]) {
    assert.equal(verifyAuthenticationCode({ ...input, ...changed }, digest), false);
  }
});

test('index definitions reserve identities and cover authentication and session TTL lookups', () => {
  assert.deepEqual(
    AUTH_INDEX_DEFINITIONS.user.map(({ key }) => key),
    [{ usernameNormalized: 1 }, { emailNormalized: 1 }, { phoneNormalized: 1 }],
  );
  assert.ok(AUTH_INDEX_DEFINITIONS.user.every(({ options }) => options.unique));
  assert.ok(
    AUTH_INDEX_DEFINITIONS.transaction.some(({ options }) => options.expireAfterSeconds === 0),
  );
  const challengeIdentity = AUTH_INDEX_DEFINITIONS.challenge.find(({ options }) => options.unique);
  assert.deepEqual(challengeIdentity.options.partialFilterExpression, {
    challengeId: { $type: 'string' },
  });
  assert.ok(
    AUTH_INDEX_DEFINITIONS.challenge.some(({ options }) => options.expireAfterSeconds === 0),
  );
  assert.equal(AUTH_INDEX_DEFINITIONS.profile[0].options.unique, true);
  assert.equal(AUTH_INDEX_DEFINITIONS.legal[0].options.unique, true);
  assert.deepEqual(AUTH_INDEX_DEFINITIONS.session, [
    {
      key: { expires: 1 },
      options: { expireAfterSeconds: 0, name: 'expires_1' },
    },
  ]);
});

test('preauth serialization exposes only state, masks, and purpose', () => {
  const descriptor = serializePreauth({
    _id: 'secret-id',
    userId: 'secret-user',
    type: 'step_up',
    stage: 'second_step',
    allowedChannels: ['email', 'sms'],
    completedChannels: [],
    expiresAt: new Date('2026-08-22T12:00:00.000Z'),
    context: {
      purpose: 'change_email',
      newDestination: 'new@example.com',
      destinationMasks: { email: 'n***@example.com', sms: '+98 ****** 67' },
    },
  });
  assert.deepEqual(descriptor, {
    type: 'step_up',
    stage: 'second_step',
    allowedChannels: ['email', 'sms'],
    completedChannels: [],
    destinations: { email: 'n***@example.com', sms: '+98 ****** 67' },
    expiresAt: '2026-08-22T12:00:00.000Z',
    purpose: 'change_email',
  });
  assert.equal(JSON.stringify(descriptor).includes('secret'), false);
  assert.equal(JSON.stringify(descriptor).includes('new@example.com'), false);
});

test('delivery webhooks reject redirects and distinguish codes from security notifications', async () => {
  const calls = [];
  const sender = createWebhookSender({
    url: 'https://delivery.example.com/auth',
    token: 'provider-token',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, status: 204 };
    },
  });
  await sender.sendAuthenticationCode({
    destination: 'user@example.com',
    code: '123456',
    expiresInSeconds: 300,
  });
  await sender.sendSecurityNotification({
    destination: 'user@example.com',
    event: 'password_changed',
  });
  assert.equal(calls[0].options.redirect, 'error');
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    type: 'authentication_code',
    destination: 'user@example.com',
    code: '123456',
    expiresInSeconds: 300,
  });
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    type: 'security_notification',
    destination: 'user@example.com',
    event: 'password_changed',
  });

  const failing = createWebhookSender({
    url: 'https://delivery.example.com/auth',
    token: 'provider-token',
    fetchImpl: async () => ({ ok: false, status: 503 }),
  });
  await assert.rejects(
    failing.sendAuthenticationCode({ destination: 'x@y.test', code: '123456' }),
    DeliveryUnavailableError,
  );
  const disabled = createDeliverySenders({ authDeliveryMode: 'disabled' });
  await assert.rejects(
    disabled.emailSender.sendSecurityNotification({ destination: 'x@y.test', event: 'test' }),
    DeliveryUnavailableError,
  );
});

const validProfile = {
  currentDegree: 'bachelor',
  educationCountryCode: 'IR',
  fieldId: 'field-1',
  universityId: 'university-1',
  studyStatus: 'graduated',
  gradeAverage: 18,
  gradeScale: '20',
  targetFieldId: 'field-2',
  targetDegree: 'master',
  targetCountries: ['DE'],
  intake: { term: 'undecided', year: null },
  hasLanguageCertificate: true,
  languageCertificates: [{ type: 'ielts', score: 7.5 }],
  annualBudget: '10000-20000',
  scholarshipImportance: 'preferred',
};

test('profile schema rejects ownership/mass assignment and inconsistent academic payloads', () => {
  assert.deepEqual(profileSchema.parse(validProfile), validProfile);
  assert.equal(profileSchema.safeParse({ ...validProfile, userId: 'other' }).success, false);
  assert.equal(profileSchema.safeParse({ ...validProfile, role: 'admin' }).success, false);
  assert.equal(profileSchema.safeParse({ ...validProfile, gradeAverage: 21 }).success, false);
});
