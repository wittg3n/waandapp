import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateEnvironment } from './environment.js';

const validEnvironment = {
  NODE_ENV: 'test',
  PORT: '4000',
  MONGODB_URI: 'mongodb://localhost:27017/waandapp',
  REDIS_URL: 'redis://localhost:6379',
  CORS_ORIGINS: 'http://localhost:3000,http://localhost:5173',
  AUTH_MUTATION_ORIGINS: 'http://localhost:5173',
  LOG_LEVEL: 'silent',
  RATE_LIMIT_WINDOW_MS: '60000',
  RATE_LIMIT_MAX: '100',
  TRUST_PROXY_HOPS: '0',
  SESSION_SECRET: 's'.repeat(64),
  SESSION_COOKIE_NAME: 'waand.sid',
  SESSION_IDLE_TTL_MS: '3600000',
  SESSION_ABSOLUTE_TTL_MS: '86400000',
  AUTH_CODE_PEPPER: 'p'.repeat(64),
  AUTH_CODE_TTL_MS: '300000',
  AUTH_TRANSACTION_TTL_MS: '900000',
  AUTH_STEP_UP_TTL_MS: '600000',
  AUTH_TERMS_VERSION: '2026-08-22',
  AUTH_ARGON2_MEMORY_KIB: '65536',
  AUTH_ARGON2_TIME_COST: '3',
  AUTH_ARGON2_PARALLELISM: '1',
  AUTH_MAX_VERIFY_ATTEMPTS: '5',
  AUTH_MAX_SENDS_PER_TRANSACTION: '3',
  AUTH_RESEND_COOLDOWN_MS: '60000',
  AUTH_LOGIN_IP_WINDOW_MS: '900000',
  AUTH_LOGIN_IP_LIMIT: '30',
  AUTH_LOGIN_IDENTIFIER_WINDOW_MS: '900000',
  AUTH_LOGIN_IDENTIFIER_LIMIT: '10',
  AUTH_REQUEST_IP_WINDOW_MS: '900000',
  AUTH_REQUEST_IP_LIMIT: '30',
  AUTH_REQUEST_DESTINATION_WINDOW_MS: '3600000',
  AUTH_REQUEST_DESTINATION_LIMIT: '5',
  AUTH_VERIFY_IP_WINDOW_MS: '900000',
  AUTH_VERIFY_IP_LIMIT: '60',
  AUTH_VERIFY_DESTINATION_WINDOW_MS: '900000',
  AUTH_VERIFY_DESTINATION_LIMIT: '10',
  AUTH_DELIVERY_MODE: 'disabled',
};

test('validates and transforms the complete authentication environment', () => {
  const result = validateEnvironment(validEnvironment);

  assert.equal(result.port, 4000);
  assert.deepEqual(result.corsOrigins, ['http://localhost:3000', 'http://localhost:5173']);
  assert.deepEqual(result.authMutationOrigins, ['http://localhost:5173']);
  assert.equal(result.sessionIdleTtlMs, 3_600_000);
  assert.equal(result.sessionAbsoluteTtlMs, 86_400_000);
  assert.equal(result.authCodeTtlMs, 300_000);
  assert.equal(result.authTransactionTtlMs, 900_000);
  assert.equal(result.authStepUpTtlMs, 600_000);
  assert.equal(result.authTermsVersion, '2026-08-22');
  assert.equal(result.authArgon2MemoryKib, 65_536);
  assert.equal(result.authArgon2TimeCost, 3);
  assert.equal(result.authArgon2Parallelism, 1);
  assert.equal(result.authLoginIpLimit, 30);
  assert.equal(result.authLoginIdentifierLimit, 10);
  assert.equal(result.authDeliveryMode, 'disabled');
  assert.equal(result.authEmailWebhookUrl, null);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.corsOrigins));
  assert.ok(Object.isFrozen(result.authMutationOrigins));

  const development = validateEnvironment({
    ...validEnvironment,
    NODE_ENV: 'development',
    AUTH_DELIVERY_MODE: 'development',
  });
  assert.equal(development.authDeliveryMode, 'development');
  assert.equal(development.authSmsWebhookUrl, null);
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, AUTH_DELIVERY_MODE: 'development' }),
    /requires NODE_ENV=development/,
  );
});

test('non-production webhook delivery accepts complete channels and rejects partial channels', () => {
  const emailOnly = {
    ...validEnvironment,
    NODE_ENV: 'development',
    AUTH_DELIVERY_MODE: 'webhook',
    AUTH_EMAIL_WEBHOOK_URL: 'http://127.0.0.1:4100/email',
    AUTH_EMAIL_WEBHOOK_TOKEN: `email-${'x'.repeat(32)}`,
  };
  const result = validateEnvironment(emailOnly);

  assert.equal(result.authEmailWebhookUrl, emailOnly.AUTH_EMAIL_WEBHOOK_URL);
  assert.equal(result.authEmailWebhookToken, emailOnly.AUTH_EMAIL_WEBHOOK_TOKEN);
  assert.equal(result.authSmsWebhookUrl, null);
  assert.equal(result.authSmsWebhookToken, null);

  for (const partial of [
    { AUTH_EMAIL_WEBHOOK_URL: 'http://127.0.0.1:4100/email' },
    { AUTH_EMAIL_WEBHOOK_TOKEN: `email-${'x'.repeat(32)}` },
    { AUTH_SMS_WEBHOOK_URL: 'http://127.0.0.1:4100/sms' },
    { AUTH_SMS_WEBHOOK_TOKEN: `sms-${'x'.repeat(32)}` },
  ]) {
    assert.throws(
      () => validateEnvironment({ ...validEnvironment, ...partial, AUTH_DELIVERY_MODE: 'webhook' }),
      /AUTH_(?:EMAIL|SMS)_WEBHOOK/,
    );
  }
});

test('rejects invalid base service settings', () => {
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, NODE_ENV: 'staging' }),
    /NODE_ENV must be development, test, or production/,
  );
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, PORT: '65536' }),
    /PORT must be an integer between 1 and 65535/,
  );
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, MONGODB_URI: 'https://localhost/db' }),
    /MONGODB_URI must use/,
  );
});

test('requires exact canonical CORS and mutation origins', () => {
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, CORS_ORIGINS: 'http://localhost:3000/path' }),
    /exact HTTP\(S\) origins/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        AUTH_MUTATION_ORIGINS: 'http://localhost:3002',
      }),
    /must be a subset of CORS_ORIGINS/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',
        MONGODB_URI: 'mongodb://localhost:27017/waandapp?tls=true',
        REDIS_URL: 'rediss://localhost:6379',
        CORS_ORIGINS: 'http://example.com',
        AUTH_MUTATION_ORIGINS: 'http://example.com',
        SESSION_SECRET: `prod-session-${'0123456789abcdef'.repeat(4)}`,
        AUTH_CODE_PEPPER: `prod-pepper-${'fedcba9876543210'.repeat(4)}`,
        SESSION_COOKIE_NAME: '__Host-waand.sid',
        AUTH_DELIVERY_MODE: 'webhook',
        AUTH_EMAIL_WEBHOOK_URL: 'https://email.example.com/auth',
        AUTH_EMAIL_WEBHOOK_TOKEN: 'email-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        AUTH_SMS_WEBHOOK_URL: 'https://sms.example.com/auth',
        AUTH_SMS_WEBHOOK_TOKEN: 'sms-ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789',
      }),
    /must use HTTPS in production/,
  );
});

test('rejects weak, reused, and production-placeholder secrets', () => {
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, SESSION_SECRET: 'short' }),
    /SESSION_SECRET must be at least 32/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        AUTH_CODE_PEPPER: validEnvironment.SESSION_SECRET,
      }),
    /must be different/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://app.example.com',
        SESSION_SECRET: 'development-only-session-secret-change-before-production-2026',
      }),
    /must not use a development placeholder/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',
        SESSION_SECRET: 's'.repeat(64),
      }),
    /must have sufficient character diversity/,
  );
});

test('validates session, transaction, challenge, and hashing bounds', () => {
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, SESSION_IDLE_TTL_MS: '299999' }),
    /SESSION_IDLE_TTL_MS must be an integer between 300000/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        SESSION_IDLE_TTL_MS: '600000',
        SESSION_ABSOLUTE_TTL_MS: '300000',
      }),
    /SESSION_ABSOLUTE_TTL_MS must be greater/,
  );
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, AUTH_CODE_TTL_MS: '900001' }),
    /AUTH_CODE_TTL_MS must be an integer between 60000 and 900000/,
  );
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, AUTH_RESEND_COOLDOWN_MS: '300000' }),
    /must be shorter than AUTH_CODE_TTL_MS/,
  );
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, AUTH_TRANSACTION_TTL_MS: '3600001' }),
    /AUTH_TRANSACTION_TTL_MS must be an integer between 300000 and 3600000/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        AUTH_CODE_TTL_MS: '600000',
        AUTH_TRANSACTION_TTL_MS: '599999',
      }),
    /AUTH_CODE_TTL_MS must not exceed AUTH_TRANSACTION_TTL_MS/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        AUTH_TRANSACTION_TTL_MS: '300000',
        AUTH_STEP_UP_TTL_MS: '300001',
      }),
    /AUTH_STEP_UP_TTL_MS must not exceed AUTH_TRANSACTION_TTL_MS/,
  );
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, AUTH_ARGON2_MEMORY_KIB: '19455' }),
    /AUTH_ARGON2_MEMORY_KIB must be an integer between 19456/,
  );
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, AUTH_ARGON2_TIME_COST: '1' }),
    /AUTH_ARGON2_TIME_COST must be an integer between 2/,
  );
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, AUTH_LOGIN_IDENTIFIER_LIMIT: '101' }),
    /AUTH_LOGIN_IDENTIFIER_LIMIT must be an integer between 1 and 100/,
  );
});

test('production requires a host cookie and fully configured HTTPS delivery webhooks', () => {
  const production = {
    ...validEnvironment,
    NODE_ENV: 'production',
    MONGODB_URI: 'mongodb://localhost:27017/waandapp?tls=true',
    REDIS_URL: 'rediss://localhost:6379',
    CORS_ORIGINS: 'https://app.example.com',
    AUTH_MUTATION_ORIGINS: 'https://app.example.com',
    SESSION_SECRET: `prod-session-${'0123456789abcdef'.repeat(4)}`,
    AUTH_CODE_PEPPER: `prod-pepper-${'fedcba9876543210'.repeat(4)}`,
    SESSION_COOKIE_NAME: '__Host-waand.sid',
    AUTH_DELIVERY_MODE: 'webhook',
    AUTH_EMAIL_WEBHOOK_URL: 'https://email.example.com/auth',
    AUTH_EMAIL_WEBHOOK_TOKEN: 'email-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    AUTH_SMS_WEBHOOK_URL: 'https://sms.example.com/auth',
    AUTH_SMS_WEBHOOK_TOKEN: 'sms-ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789',
  };

  assert.equal(validateEnvironment(production).authDeliveryMode, 'webhook');
  for (const missingChannel of [
    { AUTH_EMAIL_WEBHOOK_URL: undefined, AUTH_EMAIL_WEBHOOK_TOKEN: undefined },
    { AUTH_SMS_WEBHOOK_URL: undefined, AUTH_SMS_WEBHOOK_TOKEN: undefined },
  ]) {
    assert.throws(
      () => validateEnvironment({ ...production, ...missingChannel }),
      /AUTH_(?:EMAIL|SMS)_WEBHOOK/,
    );
  }
  assert.throws(
    () => validateEnvironment({ ...production, SESSION_COOKIE_NAME: 'waand.sid' }),
    /must use the __Host- prefix/,
  );
  assert.throws(
    () => validateEnvironment({ ...production, AUTH_DELIVERY_MODE: 'disabled' }),
    /must be webhook in production/,
  );
  assert.throws(
    () => validateEnvironment({ ...production, AUTH_DELIVERY_MODE: 'development' }),
    /must be webhook in production/,
  );
  assert.throws(
    () => validateEnvironment({ ...production, AUTH_SMS_WEBHOOK_URL: 'http://sms.example.com' }),
    /AUTH_SMS_WEBHOOK_URL must use/,
  );
  assert.throws(
    () => validateEnvironment({ ...production, AUTH_EMAIL_WEBHOOK_TOKEN: 'short' }),
    /AUTH_EMAIL_WEBHOOK_TOKEN must be at least 32/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...production,
        AUTH_EMAIL_WEBHOOK_URL: 'https://user:password@email.example.com/auth',
      }),
    /AUTH_EMAIL_WEBHOOK_URL must not contain embedded credentials/,
  );
});

test('production requires encrypted MongoDB and Redis transport', () => {
  const production = {
    ...validEnvironment,
    NODE_ENV: 'production',
    MONGODB_URI: 'mongodb+srv://cluster.example.com/waandapp',
    REDIS_URL: 'rediss://cache.example.com:6379',
    CORS_ORIGINS: 'https://app.example.com',
    AUTH_MUTATION_ORIGINS: 'https://app.example.com',
    SESSION_SECRET: `prod-session-${'0123456789abcdef'.repeat(4)}`,
    AUTH_CODE_PEPPER: `prod-pepper-${'fedcba9876543210'.repeat(4)}`,
    SESSION_COOKIE_NAME: '__Host-waand.sid',
    AUTH_DELIVERY_MODE: 'webhook',
    AUTH_EMAIL_WEBHOOK_URL: 'https://email.example.com/auth',
    AUTH_EMAIL_WEBHOOK_TOKEN: 'email-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    AUTH_SMS_WEBHOOK_URL: 'https://sms.example.com/auth',
    AUTH_SMS_WEBHOOK_TOKEN: 'sms-ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789',
  };

  assert.equal(validateEnvironment(production).redisUrl, production.REDIS_URL);
  assert.equal(
    validateEnvironment({
      ...production,
      MONGODB_URI: 'mongodb://cluster.example.com:27017/waandapp?ssl=true',
    }).mongodbUri,
    'mongodb://cluster.example.com:27017/waandapp?ssl=true',
  );
  assert.throws(
    () => validateEnvironment({ ...production, REDIS_URL: 'redis://cache.example.com:6379' }),
    /REDIS_URL must use rediss/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...production,
        MONGODB_URI: 'mongodb://cluster.example.com:27017/waandapp',
      }),
    /MONGODB_URI must use mongodb\+srv or explicitly enable/,
  );
  for (const mongodbUri of [
    'mongodb+srv://cluster.example.com/waandapp?tls=false',
    'mongodb+srv://cluster.example.com/waandapp?ssl=false',
    'mongodb://cluster.example.com:27017/waandapp?tls=true&ssl=false',
    'mongodb://cluster.example.com:27017/waandapp?tls=false&ssl=true',
  ]) {
    assert.throws(
      () => validateEnvironment({ ...production, MONGODB_URI: mongodbUri }),
      /must not set tls=false\/ssl=false/,
    );
  }
  for (const mongodbUri of [
    'mongodb+srv://cluster.example.com/waandapp?tlsInsecure=true',
    'mongodb+srv://cluster.example.com/waandapp?TLSALLOWINVALIDCERTIFICATES=TRUE',
    'mongodb://cluster.example.com:27017/waandapp?tls=true&tlsAllowInvalidHostnames=true',
  ]) {
    assert.throws(
      () => validateEnvironment({ ...production, MONGODB_URI: mongodbUri }),
      /must not disable TLS certificate or hostname verification/,
    );
  }
});
