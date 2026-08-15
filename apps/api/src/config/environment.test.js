import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateEnvironment } from './environment.js';

const validEnvironment = {
  NODE_ENV: 'test',
  PORT: '4000',
  MONGODB_URI: 'mongodb://localhost:27017/waandapp',
  REDIS_URL: 'redis://localhost:6379',
  CORS_ORIGIN: 'http://localhost:3000',
  LOG_LEVEL: 'silent',
  RATE_LIMIT_WINDOW_MS: '60000',
  RATE_LIMIT_MAX: '100',
  TRUST_PROXY_HOPS: '0',
  SESSION_SECRET: 'a'.repeat(64),
  SESSION_MAX_AGE_MS: '604800000',
};

test('validates and transforms valid environment variables', () => {
  const config = validateEnvironment(validEnvironment);

  assert.equal(config.nodeEnvironment, 'test');
  assert.equal(config.port, 4000);
  assert.equal(config.mongodbUri, validEnvironment.MONGODB_URI);
  assert.equal(config.corsOrigin, validEnvironment.CORS_ORIGIN);
  assert.equal(config.logLevel, 'silent');
  assert.equal(config.rateLimitWindowMs, 60000);
  assert.equal(config.rateLimitMax, 100);
  assert.equal(config.trustProxyHops, 0);
  assert.equal(config.sessionSecret, validEnvironment.SESSION_SECRET);
  assert.equal(config.sessionMaxAgeMs, 604800000);
});

test('rejects an invalid Node environment', () => {
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'staging',
      }),
    /NODE_ENV must be development, test, or production/,
  );
});

test('rejects invalid ports', () => {
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        PORT: '0',
      }),
    /PORT must be an integer greater than or equal to 1/,
  );

  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        PORT: '65536',
      }),
    /PORT must not exceed 65535/,
  );
});

test('rejects invalid MongoDB protocols', () => {
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        MONGODB_URI: 'https://localhost:27017/waandapp',
      }),
    /MONGODB_URI must use/,
  );
});

test('requires a sufficiently long session secret', () => {
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        SESSION_SECRET: '',
      }),
    /SESSION_SECRET is required/,
  );

  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        SESSION_SECRET: 'too-short',
      }),
    /SESSION_SECRET must be at least 32 characters long/,
  );
});

test('validates the session max age', () => {
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        SESSION_MAX_AGE_MS: '0',
      }),
    /SESSION_MAX_AGE_MS must be an integer greater than or equal to 1/,
  );

  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        SESSION_MAX_AGE_MS: 'seven-days',
      }),
    /SESSION_MAX_AGE_MS must be an integer/,
  );
});
