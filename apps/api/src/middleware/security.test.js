import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';

Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '4000',
  MONGODB_URI: 'mongodb://localhost:27017/waandapp_security_test',
  REDIS_URL: 'redis://localhost:6379',
  CORS_ORIGINS: 'http://localhost:3001',
  AUTH_MUTATION_ORIGINS: 'http://localhost:3001',
  LOG_LEVEL: 'silent',
  RATE_LIMIT_WINDOW_MS: '60000',
  RATE_LIMIT_MAX: '100',
  TRUST_PROXY_HOPS: '0',
  SESSION_SECRET: 'security-test-session-secret-00000000000000000000000000000',
  SESSION_COOKIE_NAME: 'waand.sid',
  SESSION_IDLE_TTL_MS: '3600000',
  SESSION_ABSOLUTE_TTL_MS: '86400000',
  AUTH_CODE_PEPPER: 'security-test-code-pepper-000000000000000000000000000000',
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
});

const { ownedByCurrentUserFilter, requireRole } = await import('../auth/authorization.js');
const { createApp } = await import('../app.js');
const { config } = await import('../config/index.js');
const { createSessionMiddleware, sessionCookieOptions } = await import('../config/session.js');
const { redactSensitiveValues } = await import('../logger.js');
const { ApiError, errorHandler } = await import('./errors.js');
const { enforceAbsoluteSessionLifetime, ensureSessionState, requireTrustedMutation } =
  await import('./session.js');

function runMiddleware(middleware, request, response = {}) {
  return new Promise((resolve) => {
    middleware(request, response, (error) => resolve(error));
  });
}

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function appRedis() {
  let increments = 0;

  return {
    client: {
      async ping() {
        return 'PONG';
      },
      async sendCommand([command]) {
        if (command === 'SCRIPT') return 'test-script-sha';
        if (command === 'EVALSHA') {
          increments += 1;
          return [1, config.rateLimitWindowMs];
        }
        return 1;
      },
    },
    increments: () => increments,
  };
}

function testApp(redis) {
  return createApp(redis, {
    settings: config,
    authService: {},
    senders: { emailSender: {}, smsSender: {} },
    sessionMiddleware(request, _response, next) {
      request.session = {};
      next();
    },
  });
}

test('CSRF token is stable within a session and exact origin plus token are required', async () => {
  const request = {
    session: {},
    get(name) {
      return { origin: 'http://localhost:3001', 'x-csrf-token': this.session.csrfToken }[
        name.toLowerCase()
      ];
    },
  };
  const token = ensureSessionState(request);
  assert.equal(ensureSessionState(request), token);

  const middleware = requireTrustedMutation({ authMutationOrigins: ['http://localhost:3001'] });
  assert.equal(await runMiddleware(middleware, request), undefined);

  request.get = (name) =>
    ({ origin: 'http://evil.example', 'x-csrf-token': token })[name.toLowerCase()];
  const originError = await runMiddleware(middleware, request);
  assert.ok(originError instanceof ApiError);
  assert.equal(originError.code, 'AUTH_CSRF_INVALID');

  request.get = (name) =>
    ({ origin: 'http://localhost:3001', 'x-csrf-token': 'wrong' })[name.toLowerCase()];
  assert.equal((await runMiddleware(middleware, request)).code, 'AUTH_CSRF_INVALID');

  request.get = (name) =>
    ({
      origin: 'http://localhost:3001',
      'sec-fetch-site': 'cross-site',
      'x-csrf-token': token,
    })[name.toLowerCase()];
  assert.equal((await runMiddleware(middleware, request)).code, 'AUTH_CSRF_INVALID');

  request.get = (name) =>
    ({ 'sec-fetch-site': 'same-origin', 'x-csrf-token': token })[name.toLowerCase()];
  assert.equal((await runMiddleware(middleware, request)).code, 'AUTH_CSRF_INVALID');
});

test('role and ownership helpers use only the server-loaded authenticated user', async () => {
  const request = { auth: { user: { _id: 'user-1', role: 'applicant' } } };
  assert.equal(await runMiddleware(requireRole('applicant'), request), undefined);
  assert.equal((await runMiddleware(requireRole('admin'), request)).code, 'AUTH_FORBIDDEN');
  assert.deepEqual(ownedByCurrentUserFilter(request, { status: 'ready' }), {
    status: 'ready',
    userId: 'user-1',
  });
  assert.throws(() => ownedByCurrentUserFilter({}, {}), /Authentication is required/);
});

test('absolute session expiry regenerates state and production cookies are host-safe', async () => {
  const request = {
    session: {
      createdAt: Date.now() - 10_000,
      regenerate(done) {
        done();
      },
    },
  };
  let cleared;
  const response = {
    clearCookie(name, options) {
      cleared = { name, options };
    },
  };
  const settings = {
    nodeEnvironment: 'production',
    sessionCookieName: '__Host-waand.sid',
    sessionIdleTtlMs: 60_000,
    sessionAbsoluteTtlMs: 1_000,
  };

  assert.equal(
    await runMiddleware(enforceAbsoluteSessionLifetime(settings), request, response),
    undefined,
  );
  assert.equal(request.authSessionInvalidReason, 'expired');
  assert.equal(cleared.name, '__Host-waand.sid');
  assert.deepEqual(cleared.options, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  assert.equal(sessionCookieOptions(settings).maxAge, 60_000);
});

test('session middleware leaves TTL index creation to the awaited startup lifecycle', async () => {
  let createIndexCalls = 0;
  const mongoClient = {
    db() {
      return {
        collection() {
          return {
            createIndex() {
              createIndexCalls += 1;
              return Promise.resolve();
            },
          };
        },
      };
    },
  };

  createSessionMiddleware(config, mongoClient);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(createIndexCalls, 0);
});

test('an authenticated session inside its absolute lifetime keeps its security fields', async () => {
  const session = {
    createdAt: Date.now() - 1_000,
    csrfToken: 'csrf-token',
    userId: 'user-1',
    sessionVersion: 4,
    authTime: Date.now() - 1_000,
    secondStepAt: Date.now() - 1_000,
  };
  const snapshot = { ...session };
  let cleared = false;

  assert.equal(
    await runMiddleware(
      enforceAbsoluteSessionLifetime({ sessionAbsoluteTtlMs: 60_000 }),
      { session },
      { clearCookie: () => (cleared = true) },
    ),
    undefined,
  );
  assert.deepEqual(session, snapshot);
  assert.equal(cleared, false);
});

test('structured log sanitization recursively removes credentials, identity, and identifiers', () => {
  const duplicate = new Error('E11000 duplicate key: { emailNormalized: "victim@example.com" }');
  duplicate.code = 11_000;
  duplicate.keyValue = { emailNormalized: 'victim@example.com' };

  const sanitized = redactSensitiveValues({
    request: {
      body: {
        currentPassword: 'current password',
        newPassword: 'new password',
        otp: '123456',
      },
      identity: {
        email: 'victim@example.com',
        phone: '+989121234567',
        userId: 'user-1',
      },
      session: { id: 'session-1' },
      preauthTransactionId: 'transaction-1',
      provider: { accessToken: 'provider-token' },
      remoteAddress: '203.0.113.10',
    },
    err: duplicate,
    url: 'https://user:password@example.com/send?token=secret-token',
  });
  const output = JSON.stringify(sanitized);

  for (const secret of [
    'current password',
    'new password',
    '123456',
    'victim@example.com',
    '+989121234567',
    'user-1',
    'session-1',
    'transaction-1',
    'provider-token',
    '203.0.113.10',
    'secret-token',
  ]) {
    assert.equal(output.includes(secret), false, `log output leaked ${secret}`);
  }
  assert.match(output, /Database unique constraint error/);
  assert.match(output, /\[Redacted\]/);
});

test('unexpected duplicate-key payloads never reach the public error response', () => {
  const duplicate = new Error('E11000 duplicate key: { usernameNormalized: "private-identity" }');
  duplicate.code = 11_000;
  duplicate.keyValue = { usernameNormalized: 'private-identity' };
  let statusCode;
  let payload;

  errorHandler(
    duplicate,
    { id: 'request-1' },
    {
      headersSent: false,
      setHeader() {},
      status(value) {
        statusCode = value;
        return this;
      },
      json(value) {
        payload = value;
      },
    },
    () => assert.fail('the terminal error handler must not delegate'),
  );

  assert.equal(statusCode, 500);
  assert.deepEqual(payload, {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
      requestId: 'request-1',
    },
  });
  assert.equal(JSON.stringify(payload).includes('private-identity'), false);
});

test('health bypasses rate limiting and CORS only credentials exact allowed origins', async () => {
  const redis = appRedis();

  await withServer(testApp(redis.client), async (origin) => {
    const allowed = await fetch(`${origin}/api/v1/health`, {
      headers: { Origin: 'http://localhost:3001' },
    });
    assert.equal(allowed.status, 503);
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:3001');
    assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');

    const denied = await fetch(`${origin}/api/v1/health`, {
      headers: { Origin: 'http://evil.example' },
    });
    assert.equal(denied.status, 503);
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
    assert.equal(denied.headers.get('access-control-allow-credentials'), null);

    const preflight = await fetch(`${origin}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3001',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'content-type,x-csrf-token',
      },
    });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get('access-control-allow-methods'), /PATCH/);
    assert.match(preflight.headers.get('access-control-allow-headers'), /X-CSRF-Token/i);
  });

  assert.equal(redis.increments(), 0);
});

test('the application enforces strict JSON and a 32 KiB request-body limit', async () => {
  const redis = appRedis();

  await withServer(testApp(redis.client), async (origin) => {
    const primitive = await fetch(`${origin}/api/v1/not-found`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('not-an-object'),
    });
    assert.equal(primitive.status, 400);
    assert.equal((await primitive.json()).error.code, 'INVALID_JSON');

    const oversized = await fetch(`${origin}/api/v1/not-found`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'x'.repeat(33 * 1_024) }),
    });
    assert.equal(oversized.status, 413);
    assert.equal((await oversized.json()).error.code, 'PAYLOAD_TOO_LARGE');
  });
});
