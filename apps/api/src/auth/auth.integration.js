import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';

const suffix = `${process.pid}_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const databaseName = `waandapp_auth_test_${suffix}`;
const mongoUri = `mongodb://127.0.0.1:27017/${databaseName}`;
const redisUrl = process.env.API_TEST_REDIS_URL ?? 'redis://127.0.0.1:6380/15';
const allowedOrigin = 'http://localhost:3001';

Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '4000',
  MONGODB_URI: mongoUri,
  REDIS_URL: redisUrl,
  CORS_ORIGINS: `${allowedOrigin},http://localhost:3000`,
  AUTH_MUTATION_ORIGINS: allowedOrigin,
  LOG_LEVEL: 'silent',
  RATE_LIMIT_WINDOW_MS: '60000',
  RATE_LIMIT_MAX: '10000',
  TRUST_PROXY_HOPS: '0',
  SESSION_SECRET: 'integration-session-secret-0000000000000000000000000000000',
  SESSION_COOKIE_NAME: 'waand.sid',
  SESSION_IDLE_TTL_MS: '3600000',
  SESSION_ABSOLUTE_TTL_MS: '86400000',
  AUTH_CODE_PEPPER: 'integration-code-pepper-00000000000000000000000000000000',
  AUTH_CODE_TTL_MS: '120000',
  AUTH_TRANSACTION_TTL_MS: '600000',
  AUTH_STEP_UP_TTL_MS: '600000',
  AUTH_TERMS_VERSION: '2026-08',
  AUTH_ARGON2_MEMORY_KIB: '19456',
  AUTH_ARGON2_TIME_COST: '2',
  AUTH_ARGON2_PARALLELISM: '1',
  AUTH_MAX_VERIFY_ATTEMPTS: '5',
  AUTH_MAX_SENDS_PER_TRANSACTION: '4',
  AUTH_RESEND_COOLDOWN_MS: '10000',
  AUTH_LOGIN_IP_WINDOW_MS: '60000',
  AUTH_LOGIN_IP_LIMIT: '1000',
  AUTH_LOGIN_IDENTIFIER_WINDOW_MS: '60000',
  AUTH_LOGIN_IDENTIFIER_LIMIT: '100',
  AUTH_REQUEST_IP_WINDOW_MS: '60000',
  AUTH_REQUEST_IP_LIMIT: '1000',
  AUTH_REQUEST_DESTINATION_WINDOW_MS: '60000',
  AUTH_REQUEST_DESTINATION_LIMIT: '100',
  AUTH_VERIFY_IP_WINDOW_MS: '60000',
  AUTH_VERIFY_IP_LIMIT: '1000',
  AUTH_VERIFY_DESTINATION_WINDOW_MS: '60000',
  AUTH_VERIFY_DESTINATION_LIMIT: '100',
  AUTH_DELIVERY_MODE: 'disabled',
});

const [
  { createApp },
  { ApplicantProfile },
  { AuthChallenge },
  { AuthEvent },
  { AuthTransaction },
  { AUTH_INDEX_NAMES },
  { createAuthIndexes, verifyAuthIndexes },
  { verifyAuthenticationCode },
  { DeliveryUnavailableError },
  { LegalAcceptance },
  { User },
  { config },
  { connectMongoDb, disconnectMongoDb },
  { connectRedis, disconnectRedis },
  { default: mongoose },
] = await Promise.all([
  import('../app.js'),
  import('./models/applicant-profile.js'),
  import('./models/auth-challenge.js'),
  import('./models/auth-event.js'),
  import('./models/auth-transaction.js'),
  import('./index-names.js'),
  import('./indexes.js'),
  import('./code.js'),
  import('./delivery.js'),
  import('./models/legal-acceptance.js'),
  import('./models/user.js'),
  import('../config/index.js'),
  import('../infrastructure/mongodb.js'),
  import('../infrastructure/redis.js'),
  import('mongoose'),
]);

const codes = new Map();
const failedDeliveries = new Set();
const notifications = [];
const validComparisonGates = new Map();
const sender = {
  async sendAuthenticationCode({ destination, code }) {
    if (failedDeliveries.delete(destination)) throw new DeliveryUnavailableError();
    codes.set(destination, code);
  },
  async sendSecurityNotification(notification) {
    notifications.push(notification);
  },
};
const testSettings = {
  ...config,
  authResendCooldownMs: 25,
  authRateLimitPrefix: `waandapp:test:${suffix}:auth:`,
  globalRateLimitPrefix: `waandapp:test:${suffix}:global:`,
};

async function codeVerifier(input, expectedDigest) {
  const valid = verifyAuthenticationCode(input, expectedDigest);
  const gate = validComparisonGates.get(input.destination);
  if (valid && gate) {
    gate.entered?.();
    await (gate.wait ?? gate);
  }
  return valid;
}

let baseUrl;
let redis;
let server;
let identitySequence = 1_000_000 + (process.pid % 1_000) * 1_000;

function identity(label = 'user') {
  identitySequence += 1;
  const number = String(identitySequence).padStart(7, '0').slice(-7);
  return {
    firstName: 'سارا',
    lastName: 'احمدی',
    username: `${label}${number}`.slice(0, 30),
    email: `${label}${number}@example.com`,
    phone: `+98912${number}`,
    password: `عبارت امن ${label} ${number} با فاصله`,
    passwordConfirmation: `عبارت امن ${label} ${number} با فاصله`,
    termsAccepted: true,
    termsVersion: testSettings.authTermsVersion,
  };
}

function listen(httpServer) {
  return new Promise((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(0, '127.0.0.1', () => resolve(httpServer.address()));
  });
}

function close(httpServer) {
  return new Promise((resolve, reject) => {
    httpServer.close((error) => (error ? reject(error) : resolve()));
  });
}

class ApiClient {
  cookie = '';
  csrfToken = '';

  async request(path, options = {}) {
    const method = options.method ?? 'GET';
    const headers = { ...options.headers };
    if (this.cookie) headers.cookie = this.cookie;
    if (method !== 'GET' && method !== 'HEAD') {
      headers.origin = options.origin ?? allowedOrigin;
      headers['x-csrf-token'] = options.csrfToken ?? this.csrfToken;
      if (options.fetchSite) headers['sec-fetch-site'] = options.fetchSite;
    } else if (options.origin) {
      headers.origin = options.origin;
    }

    let body;
    if ('rawBody' in options) {
      body = options.rawBody;
      headers['content-type'] ??= 'application/json';
    } else if ('body' in options) {
      body = JSON.stringify(options.body);
      headers['content-type'] = 'application/json';
    }

    const response = await fetch(`${baseUrl}${path}`, { method, headers, body });
    const setCookie = response.headers.getSetCookie?.()[0] ?? response.headers.get('set-cookie');
    if (setCookie) {
      const value = setCookie.split(';', 1)[0];
      this.cookie = value.endsWith('=') ? '' : value;
    }
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (payload?.data?.csrfToken) this.csrfToken = payload.data.csrfToken;
    return { response, payload };
  }

  async bootstrap() {
    const result = await this.request('/api/v1/auth/me');
    assert.equal(result.response.status, 200);
    assert.equal(typeof result.payload.data.csrfToken, 'string');
    return result;
  }
}

async function registerPending(client, account) {
  await client.bootstrap();
  const result = await client.request('/api/v1/auth/register', {
    method: 'POST',
    body: account,
  });
  assert.equal(result.response.status, 201, JSON.stringify(result.payload));
  assert.equal(result.payload.data.status, 'VERIFICATION_REQUIRED');
  return result;
}

async function requestAndVerify(client, prefix, channel, destination) {
  const requested = await client.request(`${prefix}/${channel}/request`, {
    method: 'POST',
    body: {},
  });
  assert.equal(requested.response.status, 200, JSON.stringify(requested.payload));
  assert.equal(requested.payload.data.status, 'CODE_SENT');
  const code = codes.get(destination);
  assert.match(code, /^\d{6}$/);
  return client.request(`${prefix}/${channel}/verify`, {
    method: 'POST',
    body: { code },
  });
}

async function registerActive(client, account = identity()) {
  await registerPending(client, account);
  const email = await requestAndVerify(client, '/api/v1/auth/register', 'email', account.email);
  assert.equal(email.payload.data.status, 'VERIFICATION_REQUIRED');
  const phone = await requestAndVerify(client, '/api/v1/auth/register', 'phone', account.phone);
  assert.equal(phone.response.status, 200, JSON.stringify(phone.payload));
  assert.equal(phone.payload.data.status, 'AUTHENTICATED');
  return { account, result: phone };
}

async function loginPrimary(client, account) {
  await client.bootstrap();
  return client.request('/api/v1/auth/login', {
    method: 'POST',
    body: { identifier: account.username, password: account.password },
  });
}

async function loginFully(client, account, channel = 'email') {
  const primary = await loginPrimary(client, account);
  assert.equal(primary.response.status, 200, JSON.stringify(primary.payload));
  assert.equal(primary.payload.data.status, 'SECOND_STEP_REQUIRED');
  const destination = channel === 'email' ? account.email : account.phone;
  const requested = await client.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: channel === 'phone' ? 'sms' : channel },
  });
  assert.equal(requested.response.status, 200, JSON.stringify(requested.payload));
  const verified = await client.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: channel === 'phone' ? 'sms' : channel, code: codes.get(destination) },
  });
  assert.equal(verified.response.status, 200, JSON.stringify(verified.payload));
  assert.equal(verified.payload.data.status, 'AUTHENTICATED');
  return verified;
}

async function waitForCooldown() {
  await new Promise((resolve) => setTimeout(resolve, testSettings.authResendCooldownMs + 10));
}

async function waitForTransaction(filter, predicate) {
  const deadline = Date.now() + 2_000;
  while (Date.now() < deadline) {
    const transaction = await AuthTransaction.findOne(filter);
    if (transaction && predicate(transaction)) return transaction;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('Timed out waiting for authentication transaction state.');
}

before(async () => {
  const quietLogger = { error() {}, info() {} };
  await connectMongoDb(mongoUri, quietLogger);
  await createAuthIndexes();
  redis = await connectRedis(redisUrl, quietLogger);
  server = createServer(
    createApp(redis, {
      settings: testSettings,
      senders: { emailSender: sender, smsSender: sender },
      codeVerifier,
    }),
  );
  const address = await listen(server);
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) await close(server);
  if (mongoose.connection.db?.databaseName === databaseName)
    await mongoose.connection.dropDatabase();
  await Promise.all([disconnectRedis(redis), disconnectMongoDb()]);
});

test('indexes, anonymous state, exact CORS, Fetch Metadata, CSRF, payload, and mass assignment', async () => {
  await verifyAuthIndexes();
  const userIndexes = (await User.collection.indexes()).map(({ name }) => name);
  assert.ok(userIndexes.includes(AUTH_INDEX_NAMES.userUsernameIdentity));
  assert.ok(userIndexes.includes(AUTH_INDEX_NAMES.userEmailIdentity));
  assert.ok(userIndexes.includes(AUTH_INDEX_NAMES.userPhoneIdentity));
  assert.ok(
    (await AuthTransaction.collection.indexes()).some(
      ({ name }) => name === AUTH_INDEX_NAMES.transactionTtl,
    ),
  );
  assert.ok(
    (await AuthChallenge.collection.indexes()).some(
      ({ name }) => name === AUTH_INDEX_NAMES.challengeTtl,
    ),
  );
  assert.ok(
    (await mongoose.connection.db.collection('sessions').indexes()).some(
      ({ name }) => name === AUTH_INDEX_NAMES.sessionTtl,
    ),
  );
  await AuthEvent.collection.dropIndex(AUTH_INDEX_NAMES.eventType);
  await assert.rejects(verifyAuthIndexes(), /missing or invalid/);
  await createAuthIndexes();

  const client = new ApiClient();
  const health = await client.request('/api/v1/health');
  assert.equal(health.response.status, 200);
  const me = await client.bootstrap();
  assert.equal(me.payload.data.user, null);
  assert.equal(me.payload.data.preauth, null);
  assert.equal(me.payload.data.termsVersion, testSettings.authTermsVersion);
  assert.match(me.response.headers.get('cache-control'), /no-store/);

  const account = identity('guard');
  const evil = await client.request('/api/v1/auth/register', {
    method: 'POST',
    origin: 'http://evil.example',
    body: account,
  });
  assert.equal(evil.response.status, 403);
  assert.equal(evil.payload.error.code, 'AUTH_CSRF_INVALID');
  assert.equal(evil.response.headers.get('access-control-allow-origin'), null);

  const crossSite = await client.request('/api/v1/auth/register', {
    method: 'POST',
    fetchSite: 'cross-site',
    body: account,
  });
  assert.equal(crossSite.response.status, 403);
  const wrongCsrf = await client.request('/api/v1/auth/register', {
    method: 'POST',
    csrfToken: 'wrong',
    body: account,
  });
  assert.equal(wrongCsrf.response.status, 403);

  const escalation = await client.request('/api/v1/auth/register', {
    method: 'POST',
    body: { ...account, role: 'admin', status: 'active', emailVerifiedAt: new Date() },
  });
  assert.equal(escalation.response.status, 400);
  assert.equal(escalation.payload.error.code, 'VALIDATION_ERROR');
  const noSql = await client.request('/api/v1/auth/login', {
    method: 'POST',
    body: { identifier: { $ne: null }, password: account.password },
  });
  assert.equal(noSql.response.status, 400);
  const oversized = await client.request('/api/v1/auth/register', {
    method: 'POST',
    rawBody: JSON.stringify({ value: 'x'.repeat(40_000) }),
  });
  assert.equal(oversized.response.status, 413);
  assert.equal(await User.countDocuments({ usernameNormalized: account.username }), 0);
});

test('signup is pending, password-backed, email-before-SMS, race-safe, and creates a full rotated session only after both proofs', async () => {
  const client = new ApiClient();
  const account = identity('signup');
  await registerPending(client, account);
  const preauthCookie = client.cookie;
  const preauthCsrf = client.csrfToken;
  const user = await User.findOne({ usernameNormalized: account.username }).select(
    '+passwordHash +sessionVersion',
  );
  assert.equal(user.role, 'applicant');
  assert.equal(user.status, 'pending_verification');
  assert.match(user.passwordHash, /^\$argon2id\$/);
  assert.equal(user.passwordHash.includes(account.password), false);
  assert.equal(
    await LegalAcceptance.countDocuments({ userId: user._id, version: account.termsVersion }),
    1,
  );

  const me = await client.request('/api/v1/auth/me');
  assert.equal(me.payload.data.user, null);
  assert.equal(me.payload.data.preauth.type, 'signup');
  assert.equal(JSON.stringify(me.payload.data.preauth).includes(user._id.toString()), false);
  const protectedBeforeProof = await client.request('/api/v1/auth/me/profile', {
    method: 'PUT',
    body: {},
  });
  assert.equal(protectedBeforeProof.response.status, 401);
  const earlyPhone = await client.request('/api/v1/auth/register/phone/request', {
    method: 'POST',
    body: {},
  });
  assert.equal(earlyPhone.response.status, 409);
  assert.equal(earlyPhone.payload.error.code, 'AUTH_EMAIL_VERIFICATION_REQUIRED');

  const email = await requestAndVerify(client, '/api/v1/auth/register', 'email', account.email);
  assert.equal(email.payload.data.status, 'VERIFICATION_REQUIRED');
  const phoneRequest = await client.request('/api/v1/auth/register/phone/request', {
    method: 'POST',
    body: {},
  });
  assert.equal(phoneRequest.response.status, 200);
  const phoneCode = codes.get(account.phone);
  const parallel = await Promise.all([
    client.request('/api/v1/auth/register/phone/verify', {
      method: 'POST',
      body: { code: phoneCode },
    }),
    client.request('/api/v1/auth/register/phone/verify', {
      method: 'POST',
      body: { code: phoneCode },
    }),
  ]);
  assert.equal(parallel.filter(({ response }) => response.status === 200).length, 1);
  const activated = await User.findById(user._id).select('+sessionVersion');
  assert.equal(activated.status, 'active');
  assert.ok(activated.emailVerifiedAt);
  assert.ok(activated.phoneVerifiedAt);
  assert.notEqual(client.cookie, preauthCookie);
  assert.notEqual(client.csrfToken, preauthCsrf);
  const authenticated = await client.request('/api/v1/auth/me');
  assert.equal(authenticated.payload.data.user.username, account.username);
  assert.equal(authenticated.payload.data.preauth, null);
  assert.equal(authenticated.payload.data.user.passwordHash, undefined);
});

test('pending credentials resume verification and concurrent duplicate registration creates one applicant only', async () => {
  const account = identity('resume');
  const first = new ApiClient();
  await registerPending(first, account);

  const loginClient = new ApiClient();
  const pendingLogin = await loginPrimary(loginClient, account);
  assert.equal(pendingLogin.response.status, 200);
  assert.equal(pendingLogin.payload.data.status, 'VERIFICATION_REQUIRED');

  const resume = new ApiClient();
  await resume.bootstrap();
  const resumed = await resume.request('/api/v1/auth/register', { method: 'POST', body: account });
  assert.equal(resumed.response.status, 201);
  assert.equal(resumed.payload.data.status, 'VERIFICATION_REQUIRED');
  assert.equal(await User.countDocuments({ usernameNormalized: account.username }), 1);

  const duplicate = identity('duplicate');
  const left = new ApiClient();
  const right = new ApiClient();
  await Promise.all([left.bootstrap(), right.bootstrap()]);
  const results = await Promise.all([
    left.request('/api/v1/auth/register', { method: 'POST', body: duplicate }),
    right.request('/api/v1/auth/register', { method: 'POST', body: duplicate }),
  ]);
  assert.deepEqual(results.map(({ response }) => response.status).sort(), [201, 409]);
  assert.equal(await User.countDocuments({ usernameNormalized: duplicate.username }), 1);
});

test('pending signup finalization resumes idempotently after durable proofs outlive its transaction', async () => {
  const account = identity('durableproof');
  const interrupted = new ApiClient();
  await registerPending(interrupted, account);
  const email = await requestAndVerify(
    interrupted,
    '/api/v1/auth/register',
    'email',
    account.email,
  );
  assert.equal(email.payload.data.status, 'VERIFICATION_REQUIRED');
  await interrupted.request('/api/v1/auth/register/phone/request', {
    method: 'POST',
    body: {},
  });

  let releaseVerification;
  let markComparisonEntered;
  const comparisonEntered = new Promise((resolve) => {
    markComparisonEntered = resolve;
  });
  const wait = new Promise((resolve) => {
    releaseVerification = resolve;
  });
  validComparisonGates.set(account.phone, { entered: markComparisonEntered, wait });
  const verification = interrupted.request('/api/v1/auth/register/phone/verify', {
    method: 'POST',
    body: { code: codes.get(account.phone) },
  });
  await comparisonEntered;
  const transaction = await AuthTransaction.findOne({
    type: 'signup',
    stage: 'verify_contacts',
  }).sort({ createdAt: -1 });
  await AuthTransaction.updateOne(
    { _id: transaction._id },
    { $set: { stage: 'completed', consumedAt: new Date() } },
  );
  releaseVerification();
  const interruptedResult = await verification;
  validComparisonGates.delete(account.phone);
  assert.equal(interruptedResult.response.status, 401);
  assert.equal(interruptedResult.payload.error.code, 'AUTH_PREAUTH_INVALID');

  const pending = await User.findOne({ usernameNormalized: account.username });
  assert.equal(pending.status, 'pending_verification');
  assert.ok(pending.emailVerifiedAt);
  assert.ok(pending.phoneVerifiedAt);

  const resumed = new ApiClient();
  await resumed.bootstrap();
  const finalized = await resumed.request('/api/v1/auth/register', {
    method: 'POST',
    body: account,
  });
  assert.equal(finalized.response.status, 201, JSON.stringify(finalized.payload));
  assert.equal(finalized.payload.data.status, 'AUTHENTICATED');
  assert.equal(finalized.payload.data.user.username, account.username);
  assert.equal(
    (await resumed.request('/api/v1/auth/me')).payload.data.user.username,
    account.username,
  );

  await resumed.request('/api/v1/auth/logout', { method: 'POST', body: {} });
  const freshLogin = new ApiClient();
  const primaryOnly = await loginPrimary(freshLogin, account);
  assert.equal(primaryOnly.payload.data.status, 'SECOND_STEP_REQUIRED');
  assert.equal((await freshLogin.request('/api/v1/auth/me')).payload.data.user, null);
});

test('login requires password then a transaction-bound second step and blocks stale status/sessions generically', async () => {
  const registration = new ApiClient();
  const { account, result } = await registerActive(registration, identity('login'));
  await registration.request('/api/v1/auth/logout', { method: 'POST', body: {} });

  const client = new ApiClient();
  await client.bootstrap();
  const wrong = await client.request('/api/v1/auth/login', {
    method: 'POST',
    body: { identifier: account.email, password: `${account.password}!` },
  });
  assert.equal(wrong.response.status, 401);
  assert.equal(wrong.payload.error.code, 'AUTH_INVALID_CREDENTIALS');
  const primary = await client.request('/api/v1/auth/login', {
    method: 'POST',
    body: { identifier: account.email.toUpperCase(), password: account.password },
  });
  assert.equal(primary.payload.data.status, 'SECOND_STEP_REQUIRED');
  assert.equal((await client.request('/api/v1/auth/me')).payload.data.user, null);
  const denied = await client.request('/api/v1/auth/me/profile', { method: 'PUT', body: {} });
  assert.equal(denied.response.status, 401);

  const attacker = new ApiClient();
  await attacker.bootstrap();
  const unbound = await attacker.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  assert.equal(unbound.response.status, 401);
  assert.equal(unbound.payload.error.code, 'AUTH_PREAUTH_INVALID');

  await client.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  const verified = await client.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: codes.get(account.email) },
  });
  assert.equal(verified.payload.data.status, 'AUTHENTICATED');
  assert.equal(verified.payload.data.user.id, result.payload.data.user.id);

  const user = await User.findOne({ usernameNormalized: account.username });
  await User.updateOne({ _id: user._id }, { $set: { status: 'suspended' } });
  assert.equal((await client.request('/api/v1/auth/me')).payload.data.user, null);
  const suspended = new ApiClient();
  const suspendedLogin = await loginPrimary(suspended, account);
  assert.equal(suspendedLogin.response.status, 401);
  assert.equal(suspendedLogin.payload.error.code, 'AUTH_INVALID_CREDENTIALS');
});

test('resends preserve transaction attempts, supersede old codes, enforce caps, and valid-vs-lock races fail closed', async () => {
  const owner = new ApiClient();
  const { account } = await registerActive(owner, identity('attempts'));
  const client = new ApiClient();
  await loginPrimary(client, account);
  await client.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  const oldCode = codes.get(account.email);
  const wrongCode = oldCode === '999999' ? '999998' : '999999';
  const wrong = await client.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: wrongCode },
  });
  assert.equal(wrong.response.status, 400);
  let transaction = await AuthTransaction.findOne({ type: 'login', stage: 'second_step' }).sort({
    createdAt: -1,
  });
  assert.equal(transaction.failedSecondStepAttempts, 1);
  await waitForCooldown();
  failedDeliveries.add(account.email);
  const deliveryFailure = await client.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  assert.equal(deliveryFailure.response.status, 503);
  assert.equal(deliveryFailure.payload.error.code, 'AUTH_DELIVERY_UNAVAILABLE');
  assert.equal(
    (
      await AuthChallenge.findOne({
        transactionId: transaction._id,
        resendSequence: 1,
      })
    ).status,
    'pending',
  );
  await waitForCooldown();
  await client.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  const newCode = codes.get(account.email);
  transaction = await AuthTransaction.findById(transaction._id);
  assert.equal(transaction.failedSecondStepAttempts, 1);
  assert.equal(transaction.sendCountEmail, 3);
  const old = await client.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: oldCode },
  });
  assert.equal(old.response.status, 400);
  const good = await client.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: newCode },
  });
  assert.equal(good.response.status, 200);

  const raceClient = new ApiClient();
  await loginPrimary(raceClient, account);
  await raceClient.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  const raceTransaction = await AuthTransaction.findOne({
    type: 'login',
    stage: 'second_step',
  }).sort({ createdAt: -1 });
  await AuthTransaction.updateOne(
    { _id: raceTransaction._id },
    { $set: { failedSecondStepAttempts: raceTransaction.maxAttempts - 1 } },
  );
  let release;
  validComparisonGates.set(
    account.email,
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const validRequest = raceClient.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: codes.get(account.email) },
  });
  await new Promise((resolve) => setTimeout(resolve, 25));
  const finalWrong = await raceClient.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: wrongCode },
  });
  assert.equal(finalWrong.response.status, 429);
  await waitForTransaction({ _id: raceTransaction._id }, (value) => value.stage === 'locked');
  validComparisonGates.delete(account.email);
  release();
  const validAfterLock = await validRequest;
  assert.notEqual(validAfterLock.response.status, 200);
  assert.equal((await raceClient.request('/api/v1/auth/me')).payload.data.user, null);

  const capped = new ApiClient();
  await loginPrimary(capped, account);
  for (let send = 0; send < testSettings.authMaxSendsPerTransaction; send += 1) {
    const sent = await capped.request('/api/v1/auth/second-step/request', {
      method: 'POST',
      body: { channel: 'sms' },
    });
    assert.equal(sent.response.status, 200);
    await waitForCooldown();
  }
  const overCap = await capped.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'sms' },
  });
  assert.equal(overCap.response.status, 429);
  assert.equal(overCap.payload.error.code, 'AUTH_TOO_MANY_SENDS');

  const expiredClient = new ApiClient();
  await loginPrimary(expiredClient, account);
  await expiredClient.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  const expiredTransaction = await AuthTransaction.findOne({
    type: 'login',
    stage: 'second_step',
  }).sort({ createdAt: -1 });
  await AuthChallenge.updateOne(
    { transactionId: expiredTransaction._id, status: 'pending' },
    { $set: { expiresAt: new Date(Date.now() - 1_000) } },
  );
  const expired = await expiredClient.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: codes.get(account.email) },
  });
  assert.equal(expired.response.status, 400);
  assert.equal(expired.payload.error.code, 'AUTH_CODE_EXPIRED');
});

test('a code cannot cross preauth transactions even for the same user, channel, and purpose', async () => {
  const owner = new ApiClient();
  const { account } = await registerActive(owner, identity('binding'));
  const first = new ApiClient();
  await loginPrimary(first, account);
  await first.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  const firstCode = codes.get(account.email);
  await waitForCooldown();
  const second = new ApiClient();
  await loginPrimary(second, account);
  await second.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  const secondCode = codes.get(account.email);
  const crossed = await second.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: firstCode },
  });
  assert.equal(crossed.response.status, 400);
  assert.equal(crossed.payload.error.code, 'AUTH_INVALID_CODE');
  const correct = await second.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: secondCode },
  });
  assert.equal(correct.payload.data.status, 'AUTHENTICATED');
});

test('recovery proves email then phone, hides unknown/provider state, resets with Argon2id, revokes sessions, and never logs in', async () => {
  const oldSession = new ApiClient();
  const { account } = await registerActive(oldSession, identity('recovery'));
  const recovery = new ApiClient();
  await recovery.bootstrap();
  const started = await recovery.request('/api/v1/auth/password/forgot', {
    method: 'POST',
    body: { identifier: account.email },
  });
  assert.equal(started.payload.data.status, 'RECOVERY_STARTED');
  assert.deepEqual(started.payload.data.preauth.destinations, { email: '***', sms: '***' });
  const earlyPhone = await recovery.request('/api/v1/auth/password/recovery/phone/request', {
    method: 'POST',
    body: {},
  });
  assert.equal(earlyPhone.payload.error.code, 'AUTH_EMAIL_VERIFICATION_REQUIRED');
  const email = await requestAndVerify(
    recovery,
    '/api/v1/auth/password/recovery',
    'email',
    account.email,
  );
  assert.equal(email.payload.data.status, 'RECOVERY_VERIFICATION_REQUIRED');
  const phone = await requestAndVerify(
    recovery,
    '/api/v1/auth/password/recovery',
    'phone',
    account.phone,
  );
  assert.equal(phone.payload.data.status, 'READY_FOR_PASSWORD_RESET');
  const newPassword = `${account.password} تازه`;
  const reset = await recovery.request('/api/v1/auth/password/reset', {
    method: 'POST',
    body: { password: newPassword, passwordConfirmation: newPassword },
  });
  assert.deepEqual(reset.payload.data, { success: true });
  await recovery.bootstrap();
  assert.equal((await recovery.request('/api/v1/auth/me')).payload.data.user, null);
  assert.equal((await oldSession.request('/api/v1/auth/me')).payload.data.user, null);

  const oldPassword = new ApiClient();
  const denied = await loginPrimary(oldPassword, account);
  assert.equal(denied.payload.error.code, 'AUTH_INVALID_CREDENTIALS');
  const newCredentials = { ...account, password: newPassword };
  const accepted = new ApiClient();
  assert.equal(
    (await loginPrimary(accepted, newCredentials)).payload.data.status,
    'SECOND_STEP_REQUIRED',
  );
  const user = await User.findOne({ usernameNormalized: account.username }).select('+passwordHash');
  assert.match(user.passwordHash, /^\$argon2id\$/);

  const unknown = new ApiClient();
  await unknown.bootstrap();
  const unknownStarted = await unknown.request('/api/v1/auth/password/forgot', {
    method: 'POST',
    body: { identifier: 'unknown-user' },
  });
  assert.equal(unknownStarted.payload.data.status, started.payload.data.status);
  assert.deepEqual(
    unknownStarted.payload.data.preauth.destinations,
    started.payload.data.preauth.destinations,
  );
  const unknownRequest = await unknown.request('/api/v1/auth/password/recovery/email/request', {
    method: 'POST',
    body: {},
  });
  assert.equal(unknownRequest.response.status, 200);
  assert.equal(unknownRequest.payload.data.destinationMasked, '***');

  const failed = new ApiClient();
  await failed.bootstrap();
  await failed.request('/api/v1/auth/password/forgot', {
    method: 'POST',
    body: { identifier: account.email },
  });
  const initialRecoveryCode = await failed.request('/api/v1/auth/password/recovery/email/request', {
    method: 'POST',
    body: {},
  });
  assert.equal(initialRecoveryCode.response.status, 200);
  const retainedCode = codes.get(account.email);
  await waitForCooldown();
  failedDeliveries.add(account.email);
  const hiddenFailure = await failed.request('/api/v1/auth/password/recovery/email/request', {
    method: 'POST',
    body: {},
  });
  assert.equal(hiddenFailure.response.status, 200);
  assert.equal(hiddenFailure.payload.data.destinationMasked, '***');
  await new Promise((resolve) => setTimeout(resolve, 10));
  const retained = await failed.request('/api/v1/auth/password/recovery/email/verify', {
    method: 'POST',
    body: { code: retainedCode },
  });
  assert.equal(retained.payload.data.status, 'RECOVERY_VERIFICATION_REQUIRED');
  assert.ok(notifications.some(({ event }) => event === 'password_reset'));
});

test('recovery request and verification limits have stable, indistinguishable real and decoy subjects', async () => {
  const owner = new ApiClient();
  const { account } = await registerActive(owner, identity('recoverylimit'));
  const unknownIdentifier = identity('unknownlimit').username;

  async function start(identifier) {
    const client = new ApiClient();
    await client.bootstrap();
    const forgot = await client.request('/api/v1/auth/password/forgot', {
      method: 'POST',
      body: { identifier },
    });
    assert.equal(forgot.response.status, 200);
    assert.equal(forgot.payload.data.status, 'RECOVERY_STARTED');
    const hidden = await AuthTransaction.findOne({ type: 'password_reset' }).sort({
      createdAt: -1,
    });
    assert.equal(hidden.context.recoverySubjectDigest, undefined);
    const selected = await AuthTransaction.findById(hidden._id).select(
      '+context.recoverySubjectDigest',
    );
    assert.match(selected.context.recoverySubjectDigest, /^[a-f0-9]{64}$/);
    assert.equal(selected.context.recoverySubjectDigest.includes(identifier), false);
    return {
      client,
      subject: selected.context.recoverySubjectDigest,
      transactionId: hidden._id,
      userId: hidden.userId,
    };
  }

  async function repeatedRequests(identifier) {
    const outcomes = [];
    const subjects = [];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { client, subject } = await start(identifier);
      subjects.push(subject);
      const requested = await client.request('/api/v1/auth/password/recovery/email/request', {
        method: 'POST',
        body: {},
      });
      outcomes.push({
        httpStatus: requested.response.status,
        status: requested.payload.data.status,
        channel: requested.payload.data.channel,
        destinationMasked: requested.payload.data.destinationMasked,
      });
    }
    assert.equal(new Set(subjects).size, 1);
    return outcomes;
  }

  const originalRequestLimit = testSettings.authRequestDestinationLimit;
  testSettings.authRequestDestinationLimit = 2;
  try {
    const knownRequests = await repeatedRequests(account.email);
    const unknownRequests = await repeatedRequests(unknownIdentifier);
    assert.deepEqual(unknownRequests, knownRequests);
    assert.ok(
      knownRequests.every(({ httpStatus, status }) => httpStatus === 200 && status === 'CODE_SENT'),
    );
  } finally {
    testSettings.authRequestDestinationLimit = originalRequestLimit;
  }

  async function repeatedWrongCodes(identifier) {
    const outcomes = [];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { client, transactionId, userId } = await start(identifier);
      const requested = await client.request('/api/v1/auth/password/recovery/email/request', {
        method: 'POST',
        body: {},
      });
      assert.equal(requested.response.status, 200);
      const challenge = await AuthChallenge.findOne({
        transactionId,
        purpose: 'password_reset_email',
        channel: 'email',
        status: 'pending',
      }).select('+codeDigest +destinationSnapshot');
      assert.ok(challenge);
      const wrongCode = ['000000', '000001'].find(
        (candidate) =>
          !verifyAuthenticationCode(
            {
              pepper: testSettings.authCodePepper,
              transactionId: transactionId.toString(),
              challengeId: challenge.challengeId,
              purpose: challenge.purpose,
              userId: userId.toString(),
              channel: challenge.channel,
              destination: challenge.destinationSnapshot,
              code: candidate,
            },
            challenge.codeDigest,
          ),
      );
      const verified = await client.request('/api/v1/auth/password/recovery/email/verify', {
        method: 'POST',
        body: { code: wrongCode },
      });
      outcomes.push({
        httpStatus: verified.response.status,
        errorCode: verified.payload.error.code,
      });
    }
    return outcomes;
  }

  const originalVerifyLimit = testSettings.authVerifyDestinationLimit;
  testSettings.authVerifyDestinationLimit = 2;
  try {
    const knownVerifications = await repeatedWrongCodes(account.email);
    const unknownVerifications = await repeatedWrongCodes(unknownIdentifier);
    assert.deepEqual(unknownVerifications, knownVerifications);
    assert.deepEqual(
      knownVerifications.map(({ httpStatus, errorCode }) => [httpStatus, errorCode]),
      [
        [400, 'AUTH_INVALID_CODE'],
        [400, 'AUTH_INVALID_CODE'],
        [429, 'AUTH_RATE_LIMITED'],
      ],
    );
  } finally {
    testSettings.authVerifyDestinationLimit = originalVerifyLimit;
  }
});

test('step-up requires current password plus an existing factor, binds purpose, changes password safely, and preserves only the current session', async () => {
  const current = new ApiClient();
  const { account } = await registerActive(current, identity('stepup'));
  const otherSession = new ApiClient();
  await loginFully(otherSession, account);

  const noGrant = await current.request('/api/v1/auth/password/change', {
    method: 'POST',
    body: {
      password: `${account.password} جدید`,
      passwordConfirmation: `${account.password} جدید`,
    },
  });
  assert.equal(noGrant.payload.error.code, 'AUTH_REAUTH_REQUIRED');
  const wrong = await current.request('/api/v1/auth/reauth', {
    method: 'POST',
    body: { purpose: 'change_password', currentPassword: `${account.password}!` },
  });
  assert.equal(wrong.payload.error.code, 'AUTH_INVALID_CREDENTIALS');
  const reauth = await current.request('/api/v1/auth/reauth', {
    method: 'POST',
    body: { purpose: 'change_password', currentPassword: account.password },
  });
  assert.equal(reauth.payload.data.status, 'SECOND_STEP_REQUIRED');
  assert.equal(
    (await current.request('/api/v1/auth/me')).payload.data.user.username,
    account.username,
  );
  await current.request('/api/v1/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  const factor = await current.request('/api/v1/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: codes.get(account.email) },
  });
  assert.equal(factor.payload.data.status, 'REAUTHENTICATED');
  const continuity = await current.request('/api/v1/auth/me');
  assert.equal(continuity.payload.data.preauth.stage, 'reauthenticated');
  assert.equal(continuity.payload.data.preauth.purpose, 'change_password');

  const wrongPurpose = await current.request('/api/v1/auth/email/change/request', {
    method: 'POST',
    body: { email: identity('unused').email },
  });
  assert.equal(wrongPurpose.payload.error.code, 'AUTH_REAUTH_REQUIRED');
  const newPassword = `${account.password} جدید`;
  const oldCookie = current.cookie;
  const changed = await current.request('/api/v1/auth/password/change', {
    method: 'POST',
    body: { password: newPassword, passwordConfirmation: newPassword },
  });
  assert.equal(changed.payload.data.status, 'PASSWORD_CHANGED');
  assert.notEqual(current.cookie, oldCookie);
  assert.equal(
    (await current.request('/api/v1/auth/me')).payload.data.user.username,
    account.username,
  );
  assert.equal((await otherSession.request('/api/v1/auth/me')).payload.data.user, null);
  const oldLogin = new ApiClient();
  assert.equal(
    (await loginPrimary(oldLogin, account)).payload.error.code,
    'AUTH_INVALID_CREDENTIALS',
  );
  const newLogin = new ApiClient();
  assert.equal(
    (await loginPrimary(newLogin, { ...account, password: newPassword })).payload.data.status,
    'SECOND_STEP_REQUIRED',
  );
  assert.ok(notifications.some(({ event }) => event === 'password_changed'));
});

test('purpose-bound contact changes verify the new destination, rotate versions, retain the owner, and keep ApplicantProfile separate', async () => {
  const client = new ApiClient();
  const { account, result } = await registerActive(client, identity('contact'));
  const profile = {
    currentDegree: 'bachelor',
    educationCountryCode: 'IR',
    fieldId: 'engineering-computer',
    universityId: 'university-tehran',
    studyStatus: 'graduated',
    gradeAverage: 18,
    gradeScale: '20',
    targetFieldId: 'computer-science',
    targetDegree: 'master',
    targetCountries: ['DE', 'CA'],
    intake: { term: 'undecided', year: null },
    hasLanguageCertificate: false,
    languageCertificates: [],
    annualBudget: '10000-20000',
    scholarshipImportance: 'preferred',
  };
  const escalation = await client.request('/api/v1/auth/me/profile', {
    method: 'PUT',
    body: { ...profile, userId: new mongoose.Types.ObjectId(), role: 'admin' },
  });
  assert.equal(escalation.response.status, 400);
  const saved = await client.request('/api/v1/auth/me/profile', { method: 'PUT', body: profile });
  assert.equal(saved.payload.data.user.id, result.payload.data.user.id);
  assert.deepEqual(saved.payload.data.user.initialProfile, profile);
  assert.equal(await ApplicantProfile.countDocuments({ userId: result.payload.data.user.id }), 1);
  const rawUser = await User.findById(result.payload.data.user.id).lean();
  assert.equal(rawUser.initialProfile, undefined);

  async function grant(purpose) {
    await client.request('/api/v1/auth/reauth', {
      method: 'POST',
      body: { purpose, currentPassword: account.password },
    });
    await client.request('/api/v1/auth/second-step/request', {
      method: 'POST',
      body: { channel: 'sms' },
    });
    const verified = await client.request('/api/v1/auth/second-step/verify', {
      method: 'POST',
      body: { channel: 'sms', code: codes.get(account.phone) },
    });
    assert.equal(verified.payload.data.status, 'REAUTHENTICATED');
  }

  await grant('change_email');
  const newEmail = identity('newmail').email;
  const emailRequested = await client.request('/api/v1/auth/email/change/request', {
    method: 'POST',
    body: { email: newEmail },
  });
  assert.equal(emailRequested.payload.data.status, 'CODE_SENT');
  const reload = await client.request('/api/v1/auth/me');
  assert.equal(reload.payload.data.preauth.stage, 'new_contact_verification');
  assert.deepEqual(reload.payload.data.preauth.allowedChannels, ['email']);
  assert.deepEqual(Object.keys(reload.payload.data.preauth.destinations), ['email']);
  const emailChanged = await client.request('/api/v1/auth/email/change/verify', {
    method: 'POST',
    body: { code: codes.get(newEmail) },
  });
  assert.equal(emailChanged.payload.data.status, 'EMAIL_CHANGED');
  assert.equal(emailChanged.payload.data.user.email, newEmail);
  account.email = newEmail;

  await grant('change_phone');
  const newPhone = identity('newphone').phone;
  await client.request('/api/v1/auth/phone/change/request', {
    method: 'POST',
    body: { phone: newPhone },
  });
  const phoneChanged = await client.request('/api/v1/auth/phone/change/verify', {
    method: 'POST',
    body: { code: codes.get(newPhone) },
  });
  assert.equal(phoneChanged.payload.data.status, 'PHONE_CHANGED');
  assert.equal(phoneChanged.payload.data.user.phone, newPhone);
  assert.deepEqual(phoneChanged.payload.data.user.initialProfile, profile);
  assert.ok(notifications.some(({ event }) => event === 'email_changed'));
  assert.ok(notifications.some(({ event }) => event === 'phone_changed'));
});

test('logout-all and legacy passwordless active records cannot retain protected sessions', async () => {
  const first = new ApiClient();
  const { account } = await registerActive(first, identity('revoke'));
  const second = new ApiClient();
  await loginFully(second, account);
  const revoked = await first.request('/api/v1/auth/logout-all', { method: 'POST', body: {} });
  assert.equal(revoked.response.status, 200);
  assert.equal((await second.request('/api/v1/auth/me')).payload.data.user, null);

  const legacy = await User.collection.insertOne({
    email: 'legacy@example.com',
    emailNormalized: 'legacy@example.com',
    phone: '+989121111111',
    phoneNormalized: '+989121111111',
    role: 'applicant',
    status: 'active',
    sessionVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const legacyLogin = new ApiClient();
  await legacyLogin.bootstrap();
  const denied = await legacyLogin.request('/api/v1/auth/login', {
    method: 'POST',
    body: { identifier: 'legacy@example.com', password: 'any legacy value' },
  });
  assert.equal(denied.response.status, 401);
  assert.equal(denied.payload.error.code, 'AUTH_INVALID_CREDENTIALS');
  assert.equal((await User.findById(legacy.insertedId)).status, 'active');
});
