import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';

const suffix = `${process.pid}_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const databaseName = `waandapp_auth_test_${suffix}`;
const mongoUri = `mongodb://127.0.0.1:27017/${databaseName}`;
const redisUrl = process.env.API_TEST_REDIS_URL ?? 'redis://127.0.0.1:6380/15';
const allowedOrigin = 'http://localhost:3001';
const adminOrigin = 'http://localhost:3039';

Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '4000',
  MONGODB_URI: mongoUri,
  MONGODB_CORE_DATABASE: databaseName,
  MONGODB_CMS_DATABASE: databaseName + '_cms',
  CMS_MEDIA_ROOT: 'apps/api/storage/cms-integration-test',
  CMS_MEDIA_MAX_BYTES: '10485760',
  CMS_SCHEDULER_INTERVAL_MS: '60000',
  REDIS_URL: redisUrl,
  CORS_ORIGINS: `${allowedOrigin},${adminOrigin},http://localhost:3000`,
  AUTH_MUTATION_ORIGINS: allowedOrigin,
  ADMIN_DASHBOARD_ORIGIN: adminOrigin,
  LOG_LEVEL: 'silent',
  RATE_LIMIT_WINDOW_MS: '60000',
  RATE_LIMIT_MAX: '10000',
  TRUST_PROXY_HOPS: '0',
  SESSION_SECRET: 'integration-session-secret-0000000000000000000000000000000',
  SESSION_COOKIE_NAME: 'waand.sid',
  SESSION_IDLE_TTL_MS: '3600000',
  SESSION_ABSOLUTE_TTL_MS: '86400000',
  ADMIN_SESSION_SECRET: 'integration-admin-session-secret-000000000000000000000000000',
  ADMIN_SESSION_COOKIE_NAME: 'waand_admin_sid',
  ADMIN_SESSION_IDLE_TTL_MS: '900000',
  ADMIN_SESSION_ABSOLUTE_TTL_MS: '28800000',
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
  { AuditLog },
  { DEVELOPMENT_ADMIN_IDENTITY, seedDevelopmentSuperAdmin },
  { ApplicantProfile },
  { AuthChallenge },
  { AuthEvent },
  { AuthTransaction },
  { AUTH_INDEX_NAMES },
  { createAuthIndexes, verifyAuthIndexes },
  { verifyAuthenticationCode },
  { createDeliverySenders, DeliveryUnavailableError },
  { hashPassword, verifyPassword },
  { LegalAcceptance },
  { User },
  { config },
  { connectMongoDb, disconnectMongoDb },
  { connectRedis, disconnectRedis },
  { default: mongoose },
] = await Promise.all([
  import('../app.js'),
  import('../admin/models/audit-log.js'),
  import('../admin/seed.js'),
  import('./models/applicant-profile.js'),
  import('./models/auth-challenge.js'),
  import('./models/auth-event.js'),
  import('./models/auth-transaction.js'),
  import('./index-names.js'),
  import('./indexes.js'),
  import('./code.js'),
  import('./delivery.js'),
  import('./password.js'),
  import('./models/legal-acceptance.js'),
  import('./models/user.js'),
  import('../config/index.js'),
  import('../infrastructure/mongodb.js'),
  import('../infrastructure/redis.js'),
  import('mongoose'),
]);

const codes = new Map();
const deliveryAttempts = [];
const failedDeliveries = new Set();
const notifications = [];
const validComparisonGates = new Map();
const sender = {
  async sendAuthenticationCode(delivery) {
    const { destination, code } = delivery;
    deliveryAttempts.push({ ...delivery });
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
  cookies = new Map();
  consumerCsrfToken = '';
  adminCsrfToken = '';

  constructor(origin = baseUrl) {
    this.origin = origin;
  }

  get cookie() {
    return this.cookies.get(testSettings.sessionCookieName) ?? '';
  }

  get adminCookie() {
    return this.cookies.get(testSettings.adminSessionCookieName) ?? '';
  }

  get csrfToken() {
    return this.consumerCsrfToken;
  }

  async request(path, options = {}) {
    const method = options.method ?? 'GET';
    const adminRequest = path.startsWith('/api/v1/admin/');
    const headers = { ...options.headers };
    if (this.cookies.size > 0) headers.cookie = [...this.cookies.values()].join('; ');
    if (method !== 'GET' && method !== 'HEAD') {
      headers.origin = options.origin ?? (adminRequest ? adminOrigin : allowedOrigin);
      headers['x-csrf-token'] =
        options.csrfToken ?? (adminRequest ? this.adminCsrfToken : this.consumerCsrfToken);
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

    const response = await fetch(`${this.origin}${path}`, { method, headers, body });
    const setCookies = response.headers.getSetCookie?.() ?? [response.headers.get('set-cookie')];
    for (const setCookie of setCookies.filter(Boolean)) {
      const pair = setCookie.split(';', 1)[0];
      const separator = pair.indexOf('=');
      const name = pair.slice(0, separator);
      if (pair.slice(separator + 1)) this.cookies.set(name, pair);
      else this.cookies.delete(name);
    }
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (payload?.data?.csrfToken) {
      if (adminRequest) this.adminCsrfToken = payload.data.csrfToken;
      else this.consumerCsrfToken = payload.data.csrfToken;
    }
    return { response, payload };
  }

  async bootstrap() {
    const result = await this.request('/api/v1/auth/me');
    assert.equal(result.response.status, 200);
    assert.equal(typeof result.payload.data.csrfToken, 'string');
    return result;
  }

  async adminBootstrap() {
    const result = await this.request('/api/v1/admin/auth/me', { origin: adminOrigin });
    assert.equal(result.response.status, 200, JSON.stringify(result.payload));
    assert.equal(typeof result.payload.data.csrfToken, 'string');
    return result;
  }
}

function signedSessionId(cookie) {
  const value = decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1));
  assert.match(value, /^s:/u);
  return value.slice(2).split('.', 1)[0];
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

async function adminLoginPrimary(client, account) {
  await client.adminBootstrap();
  return client.request('/api/v1/admin/auth/login', {
    method: 'POST',
    body: { identifier: account.username, password: account.password },
  });
}

async function adminLoginFully(client, account, channel = 'email') {
  const primary = await adminLoginPrimary(client, account);
  assert.equal(primary.response.status, 200, JSON.stringify(primary.payload));
  assert.equal(primary.payload.data.status, 'SECOND_STEP_REQUIRED');
  assert.equal(primary.payload.data.user, null);
  const normalizedChannel = channel === 'phone' ? 'sms' : channel;
  const destination = channel === 'phone' ? account.phone : account.email;
  const requested = await client.request('/api/v1/admin/auth/second-step/request', {
    method: 'POST',
    body: { channel: normalizedChannel },
  });
  assert.equal(requested.response.status, 200, JSON.stringify(requested.payload));
  const verified = await client.request('/api/v1/admin/auth/second-step/verify', {
    method: 'POST',
    body: { channel: normalizedChannel, code: codes.get(destination) },
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
  assert.ok(
    (await mongoose.connection.db.collection('admin_sessions').indexes()).some(
      ({ name }) => name === AUTH_INDEX_NAMES.adminSessionTtl,
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

test('development admin seed is guarded, login-ready, idempotent, and safely audited', async () => {
  const firstPassword = 'First local seed password 29!';
  const secondPassword = 'Second local seed password 47!';
  await assert.rejects(
    () =>
      seedDevelopmentSuperAdmin({
        settings: { ...testSettings, nodeEnvironment: 'production' },
        password: firstPassword,
      }),
    /development/iu,
  );

  const settings = { ...testSettings, nodeEnvironment: 'development' };
  const loadCollision = (id) =>
    User.findById(id).select(
      '+passwordHash +sessionVersion +usernameNormalized +emailNormalized +phoneNormalized',
    );
  const collisionSnapshot = (user) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    usernameNormalized: user.usernameNormalized,
    email: user.email,
    emailNormalized: user.emailNormalized,
    phone: user.phone,
    phoneNormalized: user.phoneNormalized,
    passwordHash: user.passwordHash,
    passwordChangedAt: user.passwordChangedAt.toISOString(),
    emailVerifiedAt: user.emailVerifiedAt,
    phoneVerifiedAt: user.phoneVerifiedAt,
    role: user.role,
    adminRoles: [...user.adminRoles],
    status: user.status,
    sessionVersion: user.sessionVersion,
  });
  const seedAuditFilter = { action: 'DEVELOPMENT_SUPER_ADMIN_SEEDED' };

  for (const field of ['username', 'email', 'phone']) {
    const account = {
      ...identity(`seed-${field}`),
      [field]: DEVELOPMENT_ADMIN_IDENTITY[field],
    };
    const conflictingUser = await User.create({
      firstName: account.firstName,
      lastName: account.lastName,
      username: account.username,
      usernameNormalized: account.username,
      email: account.email,
      emailNormalized: account.email,
      phone: account.phone,
      phoneNormalized: account.phone,
      passwordHash: await hashPassword(account.password, settings),
      role: 'staff',
      adminRoles: ['SUPPORT'],
      status: 'suspended',
      sessionVersion: 7,
    });
    const before = await loadCollision(conflictingUser._id);
    const auditCount = await AuditLog.countDocuments(seedAuditFilter);

    await assert.rejects(
      () => seedDevelopmentSuperAdmin({ settings, password: firstPassword }),
      /conflicts/iu,
    );

    const after = await loadCollision(conflictingUser._id);
    assert.deepEqual(collisionSnapshot(after), collisionSnapshot(before));
    assert.equal(await verifyPassword(after.passwordHash, account.password), true);
    assert.equal(await AuditLog.countDocuments(seedAuditFilter), auditCount);
    await User.deleteOne({ _id: conflictingUser._id });
  }

  const firstResult = await seedDevelopmentSuperAdmin({ settings, password: firstPassword });
  assert.equal(firstResult.created, true);

  let user = await User.findOne({ emailNormalized: DEVELOPMENT_ADMIN_IDENTITY.email }).select(
    '+passwordHash +sessionVersion +usernameNormalized +emailNormalized +phoneNormalized',
  );
  assert.ok(user);
  assert.equal(user.usernameNormalized, DEVELOPMENT_ADMIN_IDENTITY.username);
  assert.equal(user.emailNormalized, DEVELOPMENT_ADMIN_IDENTITY.email);
  assert.equal(user.phoneNormalized, DEVELOPMENT_ADMIN_IDENTITY.phone);
  assert.equal(user.role, 'admin');
  assert.deepEqual(user.adminRoles, ['SUPER_ADMIN']);
  assert.equal(user.status, 'active');
  assert.ok(user.emailVerifiedAt instanceof Date);
  assert.ok(user.phoneVerifiedAt instanceof Date);
  assert.match(user.passwordHash, /^\$argon2id\$/u);
  assert.equal(await verifyPassword(user.passwordHash, firstPassword), true);

  const userId = user.id;
  const firstSessionVersion = user.sessionVersion;
  const secondResult = await seedDevelopmentSuperAdmin({ settings, password: secondPassword });
  assert.equal(secondResult.created, false);

  user = await User.findOne({ emailNormalized: DEVELOPMENT_ADMIN_IDENTITY.email }).select(
    '+passwordHash +sessionVersion',
  );
  assert.equal(user.id, userId);
  assert.equal(await User.countDocuments({ emailNormalized: DEVELOPMENT_ADMIN_IDENTITY.email }), 1);
  assert.equal(user.sessionVersion, firstSessionVersion + 1);
  assert.equal(await verifyPassword(user.passwordHash, firstPassword), false);
  assert.equal(await verifyPassword(user.passwordHash, secondPassword), true);

  const audits = await AuditLog.find({
    actorType: 'SYSTEM',
    action: 'DEVELOPMENT_SUPER_ADMIN_SEEDED',
    resourceType: 'USER',
    resourceId: userId,
  })
    .sort({ createdAt: 1 })
    .lean();
  assert.equal(audits.length, 2);
  assert.equal(audits[0].before, null);
  for (const audit of audits) {
    assert.equal(audit.reason, 'Explicit development seed command');
    const serialized = JSON.stringify({ before: audit.before, after: audit.after });
    assert.doesNotMatch(serialized, /password|argon2/iu);
    assert.equal(serialized.includes(firstPassword), false);
    assert.equal(serialized.includes(secondPassword), false);
  }
});

test('admin authentication has isolated credentials, MFA, cookies, CSRF, origin, logout, and revocation', async () => {
  assert.notEqual(testSettings.sessionCookieName, testSettings.adminSessionCookieName);
  assert.notEqual(testSettings.sessionSecret, testSettings.adminSessionSecret);

  const ordinaryClient = new ApiClient();
  const { account: ordinaryAccount } = await registerActive(ordinaryClient, identity('ordinary'));
  const ordinaryAdminAccess = await ordinaryClient.request('/api/v1/admin/roles', {
    origin: adminOrigin,
  });
  assert.equal(ordinaryAdminAccess.response.status, 401);
  assert.equal(ordinaryClient.adminCookie, '');

  const consumerLogout = await ordinaryClient.request('/api/v1/auth/logout', {
    method: 'POST',
    body: {},
  });
  assert.equal(consumerLogout.response.status, 200, JSON.stringify(consumerLogout.payload));
  assert.equal(ordinaryClient.adminCookie, '');

  const rejectedAdminClient = new ApiClient();
  await rejectedAdminClient.adminBootstrap();
  const transactionsBefore = await AuthTransaction.countDocuments({ type: 'admin_login' });
  const invalid = await rejectedAdminClient.request('/api/v1/admin/auth/login', {
    method: 'POST',
    body: {
      identifier: ordinaryAccount.username,
      password: ordinaryAccount.password + ' نامعتبر',
    },
  });
  assert.equal(invalid.response.status, 401);
  assert.equal(invalid.payload.error.code, 'AUTH_INVALID_CREDENTIALS');
  assert.equal(await AuthTransaction.countDocuments({ type: 'admin_login' }), transactionsBefore);
  const rejectedAfterInvalid = await rejectedAdminClient.adminBootstrap();
  assert.equal(rejectedAfterInvalid.payload.data.user, null);
  assert.equal(rejectedAfterInvalid.payload.data.preauth, null);

  const nonAdmin = await rejectedAdminClient.request('/api/v1/admin/auth/login', {
    method: 'POST',
    body: { identifier: ordinaryAccount.username, password: ordinaryAccount.password },
  });
  assert.equal(nonAdmin.response.status, 401);
  assert.equal(nonAdmin.payload.error.code, invalid.payload.error.code);
  assert.equal(nonAdmin.payload.error.message, invalid.payload.error.message);
  assert.equal(await AuthTransaction.countDocuments({ type: 'admin_login' }), transactionsBefore);
  const rejectedAfterNonAdmin = await rejectedAdminClient.adminBootstrap();
  assert.equal(rejectedAfterNonAdmin.payload.data.user, null);
  assert.equal(rejectedAfterNonAdmin.payload.data.preauth, null);

  const client = new ApiClient();
  const { account } = await registerActive(client, identity('superadmin'));
  await User.updateOne(
    { usernameNormalized: account.username },
    { $set: { adminRoles: ['SUPER_ADMIN'] }, $inc: { sessionVersion: 1 } },
  );

  const invalidAdminClient = new ApiClient();
  await invalidAdminClient.adminBootstrap();
  const invalidAdmin = await invalidAdminClient.request('/api/v1/admin/auth/login', {
    method: 'POST',
    body: { identifier: account.username, password: account.password + ' نامعتبر' },
  });
  assert.equal(invalidAdmin.response.status, 401);
  assert.equal(invalidAdmin.payload.error.code, nonAdmin.payload.error.code);
  assert.equal(invalidAdmin.payload.error.message, nonAdmin.payload.error.message);
  assert.equal(await AuthTransaction.countDocuments({ type: 'admin_login' }), transactionsBefore);

  await loginFully(client, account);
  const consumerCookie = client.cookie;
  const consumerCsrfToken = client.consumerCsrfToken;
  assert.ok(consumerCookie.startsWith(testSettings.sessionCookieName + '='));

  const consumerSuperAdminAccess = await client.request('/api/v1/admin/roles', {
    origin: adminOrigin,
  });
  assert.equal(consumerSuperAdminAccess.response.status, 401);
  assert.equal(client.adminCookie, '');

  const renamedConsumerCookie = new ApiClient();
  renamedConsumerCookie.cookies.set(
    testSettings.adminSessionCookieName,
    consumerCookie.replace(
      testSettings.sessionCookieName + '=',
      testSettings.adminSessionCookieName + '=',
    ),
  );
  assert.equal(
    (
      await renamedConsumerCookie.request('/api/v1/admin/roles', {
        origin: adminOrigin,
      })
    ).response.status,
    401,
  );

  const openedAdminDashboard = await client.adminBootstrap();
  assert.equal(openedAdminDashboard.payload.data.user, null);
  assert.equal(openedAdminDashboard.payload.data.preauth, null);
  assert.ok(client.adminCookie.startsWith(testSettings.adminSessionCookieName + '='));
  assert.equal(client.cookie, consumerCookie);

  const anonymousAdminCookie = client.adminCookie;
  const primary = await client.request('/api/v1/admin/auth/login', {
    method: 'POST',
    body: { identifier: account.username, password: account.password },
  });
  assert.equal(primary.response.status, 200, JSON.stringify(primary.payload));
  assert.equal(primary.payload.data.status, 'SECOND_STEP_REQUIRED');
  assert.equal(primary.payload.data.user, null);
  assert.equal(primary.payload.data.preauth.type, 'admin_login');
  assert.notEqual(client.adminCookie, anonymousAdminCookie);
  const preauthCsrfToken = client.adminCsrfToken;

  const beforeMfa = await client.request('/api/v1/admin/roles', { origin: adminOrigin });
  assert.equal(beforeMfa.response.status, 401);

  const consumerCsrfOnAdmin = await client.request('/api/v1/admin/auth/second-step/request', {
    method: 'POST',
    csrfToken: consumerCsrfToken,
    body: { channel: 'email' },
  });
  assert.equal(consumerCsrfOnAdmin.response.status, 403);
  assert.equal(consumerCsrfOnAdmin.payload.error.code, 'AUTH_CSRF_INVALID');

  const requested = await client.request('/api/v1/admin/auth/second-step/request', {
    method: 'POST',
    body: { channel: 'email' },
  });
  assert.equal(requested.response.status, 200, JSON.stringify(requested.payload));
  assert.equal(requested.payload.data.status, 'CODE_SENT');
  const verified = await client.request('/api/v1/admin/auth/second-step/verify', {
    method: 'POST',
    body: { channel: 'email', code: codes.get(account.email) },
  });
  assert.equal(verified.response.status, 200, JSON.stringify(verified.payload));
  assert.equal(verified.payload.data.status, 'AUTHENTICATED');
  assert.equal(verified.payload.data.user.adminRoles.includes('SUPER_ADMIN'), true);
  assert.equal(Array.isArray(verified.payload.data.user.permissions), true);
  assert.equal(verified.payload.data.user.passwordHash, undefined);
  assert.notEqual(client.adminCsrfToken, preauthCsrfToken);
  assert.equal(client.cookie, consumerCookie);

  const mfaSetCookies = verified.response.headers.getSetCookie();
  assert.equal(
    mfaSetCookies.some((value) => value.startsWith(testSettings.sessionCookieName + '=')),
    false,
  );
  const adminSetCookie = mfaSetCookies.find((value) =>
    value.startsWith(testSettings.adminSessionCookieName + '='),
  );
  assert.ok(adminSetCookie);
  assert.match(adminSetCookie, /HttpOnly/iu);
  assert.match(adminSetCookie, /SameSite=Strict/iu);
  assert.match(adminSetCookie, /Path=\/api\/v1\/admin/iu);
  assert.doesNotMatch(adminSetCookie, /Domain=/iu);
  assert.doesNotMatch(adminSetCookie, /Secure/iu);

  const consumerSessionId = signedSessionId(client.cookie);
  const adminSessionId = signedSessionId(client.adminCookie);
  const consumerSessions = mongoose.connection.db.collection('sessions');
  const adminSessions = mongoose.connection.db.collection('admin_sessions');
  assert.ok(await consumerSessions.findOne({ _id: consumerSessionId }));
  assert.equal(await consumerSessions.findOne({ _id: adminSessionId }), null);
  assert.ok(await adminSessions.findOne({ _id: adminSessionId }));
  assert.equal(await adminSessions.findOne({ _id: consumerSessionId }), null);

  const renamedAdminCookie = new ApiClient();
  renamedAdminCookie.cookies.set(
    testSettings.sessionCookieName,
    client.adminCookie.replace(
      testSettings.adminSessionCookieName + '=',
      testSettings.sessionCookieName + '=',
    ),
  );
  assert.equal((await renamedAdminCookie.request('/api/v1/auth/me')).payload.data.user, null);

  const staleAdminCsrf = await client.request('/api/v1/admin/auth/logout', {
    method: 'POST',
    csrfToken: preauthCsrfToken,
    body: {},
  });
  assert.equal(staleAdminCsrf.response.status, 403);
  assert.equal(staleAdminCsrf.payload.error.code, 'AUTH_CSRF_INVALID');

  const adminCsrfOnConsumer = await client.request('/api/v1/auth/logout', {
    method: 'POST',
    csrfToken: client.adminCsrfToken,
    body: {},
  });
  assert.equal(adminCsrfOnConsumer.response.status, 403);
  assert.equal(adminCsrfOnConsumer.payload.error.code, 'AUTH_CSRF_INVALID');
  assert.equal(
    (await client.request('/api/v1/auth/me')).payload.data.user.username,
    account.username,
  );

  const roles = await client.request('/api/v1/admin/roles', { origin: adminOrigin });
  assert.equal(roles.response.status, 200, JSON.stringify(roles.payload));
  const rejectedOrigin = await client.request('/api/v1/admin/auth/me', {
    origin: allowedOrigin,
  });
  assert.equal(rejectedOrigin.response.status, 403);
  assert.equal(rejectedOrigin.response.headers.get('access-control-allow-origin'), null);
  const allowedAdminOrigin = await client.request('/api/v1/admin/auth/me', {
    origin: adminOrigin,
  });
  assert.equal(allowedAdminOrigin.response.status, 200);
  assert.equal(allowedAdminOrigin.response.headers.get('access-control-allow-origin'), adminOrigin);
  assert.equal(allowedAdminOrigin.response.headers.get('access-control-allow-credentials'), 'true');

  const adminLogout = await client.request('/api/v1/admin/auth/logout', {
    method: 'POST',
    body: {},
  });
  assert.equal(adminLogout.response.status, 200, JSON.stringify(adminLogout.payload));
  assert.equal(client.adminCookie, '');
  assert.equal(client.cookie, consumerCookie);
  assert.equal(
    (await client.request('/api/v1/auth/me')).payload.data.user.username,
    account.username,
  );

  await waitForCooldown();
  await adminLoginFully(client, account);
  const authenticatedAdminCookie = client.adminCookie;
  const consumerOnlyLogout = await client.request('/api/v1/auth/logout', {
    method: 'POST',
    body: {},
  });
  assert.equal(consumerOnlyLogout.response.status, 200);
  assert.equal(client.cookie, '');
  assert.equal(client.adminCookie, authenticatedAdminCookie);
  assert.equal(
    (await client.request('/api/v1/admin/roles', { origin: adminOrigin })).response.status,
    200,
  );

  await User.updateOne(
    { usernameNormalized: account.username },
    { $set: { adminRoles: [] }, $inc: { sessionVersion: 1 } },
  );
  const roleRevoked = await client.request('/api/v1/admin/roles', { origin: adminOrigin });
  assert.equal(roleRevoked.response.status, 401);
  assert.equal(roleRevoked.payload.error.code, 'AUTH_SESSION_EXPIRED');

  await User.updateOne(
    { usernameNormalized: account.username },
    { $set: { adminRoles: ['SUPER_ADMIN'], status: 'active' }, $inc: { sessionVersion: 1 } },
  );
  await waitForCooldown();
  await adminLoginFully(client, account);
  await User.updateOne(
    { usernameNormalized: account.username },
    { $set: { status: 'suspended' }, $inc: { sessionVersion: 1 } },
  );
  const suspended = await client.request('/api/v1/admin/roles', { origin: adminOrigin });
  assert.equal(suspended.response.status, 403);
  assert.equal(suspended.payload.error.code, 'AUTH_ACCOUNT_SUSPENDED');
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

test('registration reports delivery failure and succeeds only after a later delivered retry', async () => {
  const client = new ApiClient();
  const account = identity('registrationdelivery');
  await registerPending(client, account);

  failedDeliveries.add(account.email);
  const failed = await client.request('/api/v1/auth/register/email/request', {
    method: 'POST',
    body: {},
  });
  assert.equal(failed.response.status, 503);
  assert.equal(failed.payload.error.code, 'AUTH_DELIVERY_UNAVAILABLE');
  assert.equal(JSON.stringify(failed.payload).includes('CODE_SENT'), false);
  assert.equal(codes.has(account.email), false);

  let attempts = deliveryAttempts.filter(({ destination }) => destination === account.email);
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0].destination, account.email);
  assert.match(attempts[0].code, /^\d{6}$/);
  assert.equal(attempts[0].expiresInSeconds, Math.ceil(testSettings.authCodeTtlMs / 1_000));
  assert.equal(
    await AuthChallenge.countDocuments({
      purpose: 'signup_verify_email',
      channel: 'email',
      destinationSnapshot: account.email,
    }),
    0,
  );

  await waitForCooldown();
  const delivered = await client.request('/api/v1/auth/register/email/request', {
    method: 'POST',
    body: {},
  });
  assert.equal(delivered.response.status, 200);
  assert.equal(delivered.payload.data.status, 'CODE_SENT');

  attempts = deliveryAttempts.filter(({ destination }) => destination === account.email);
  assert.equal(attempts.length, 2);
  assert.equal(attempts[1].destination, account.email);
  assert.match(attempts[1].code, /^\d{6}$/);
  assert.equal(attempts[1].expiresInSeconds, Math.ceil(testSettings.authCodeTtlMs / 1_000));
  assert.equal(
    await AuthChallenge.countDocuments({
      purpose: 'signup_verify_email',
      channel: 'email',
      destinationSnapshot: account.email,
      status: 'pending',
    }),
    1,
  );

  const verified = await client.request('/api/v1/auth/register/email/verify', {
    method: 'POST',
    body: { code: codes.get(account.email) },
  });
  assert.equal(verified.response.status, 200);
  assert.equal(verified.payload.data.status, 'VERIFICATION_REQUIRED');
});

test('development delivery makes the fixed bound code visible through its injected log', async () => {
  const developmentSettings = {
    ...testSettings,
    nodeEnvironment: 'development',
    authDeliveryMode: 'development',
    authRateLimitPrefix: `${testSettings.authRateLimitPrefix}development:`,
    globalRateLimitPrefix: `${testSettings.globalRateLimitPrefix}development:`,
  };
  const logCalls = [];
  const developmentServer = createServer(
    createApp(redis, {
      settings: developmentSettings,
      senders: createDeliverySenders(developmentSettings, undefined, (...arguments_) =>
        logCalls.push(arguments_),
      ),
    }),
  );
  const address = await listen(developmentServer);
  const client = new ApiClient(`http://127.0.0.1:${address.port}`);

  try {
    const account = identity('development');
    await registerPending(client, account);
    const emailRequest = await client.request('/api/v1/auth/register/email/request', {
      method: 'POST',
      body: {},
    });
    assert.equal(emailRequest.response.status, 200);
    const developmentOutput = JSON.stringify(logCalls);
    assert.equal(developmentOutput.includes(account.email), true);
    assert.match(developmentOutput, /000000/);

    const wrong = await client.request('/api/v1/auth/register/email/verify', {
      method: 'POST',
      body: { code: '111111' },
    });
    assert.equal(wrong.response.status, 400);
    assert.equal(wrong.payload.error.code, 'AUTH_INVALID_CODE');

    const email = await client.request('/api/v1/auth/register/email/verify', {
      method: 'POST',
      body: { code: '000000' },
    });
    assert.equal(email.payload.data.status, 'VERIFICATION_REQUIRED');

    const phoneRequest = await client.request('/api/v1/auth/register/phone/request', {
      method: 'POST',
      body: {},
    });
    assert.equal(phoneRequest.response.status, 200);
    const phone = await client.request('/api/v1/auth/register/phone/verify', {
      method: 'POST',
      body: { code: '000000' },
    });
    assert.equal(phone.payload.data.status, 'AUTHENTICATED');
  } finally {
    await close(developmentServer);
  }
});

test('dev-no2step bypasses consumer and admin verification while preserving passwords, step-up purpose, sessions, and RBAC', async () => {
  const noTwoStepSettings = {
    ...testSettings,
    nodeEnvironment: 'development',
    authDeliveryMode: 'dev-no2step',
    authRateLimitPrefix: `${testSettings.authRateLimitPrefix}no-two-step:`,
    adminAuthRateLimitPrefix: `waandapp:test:${suffix}:admin-auth:no-two-step:`,
    globalRateLimitPrefix: `${testSettings.globalRateLimitPrefix}no-two-step:`,
  };
  const authenticationDeliveries = [];
  const noTwoStepSender = {
    async sendAuthenticationCode(delivery) {
      authenticationDeliveries.push(delivery);
    },
    async sendSecurityNotification() {},
  };
  const noTwoStepServer = createServer(
    createApp(redis, {
      settings: noTwoStepSettings,
      senders: { emailSender: noTwoStepSender, smsSender: noTwoStepSender },
    }),
  );
  const address = await listen(noTwoStepServer);
  const origin = `http://127.0.0.1:${address.port}`;
  const challengeCountBefore = await AuthChallenge.countDocuments();

  try {
    const account = identity('no2step');
    const client = new ApiClient(origin);
    const anonymous = await client.bootstrap();
    const anonymousCookie = client.cookie;
    const registered = await client.request('/api/v1/auth/register', {
      method: 'POST',
      body: account,
    });
    assert.equal(registered.response.status, 201, JSON.stringify(registered.payload));
    assert.equal(registered.payload.data.status, 'AUTHENTICATED');
    assert.equal(registered.payload.data.user.username, account.username);
    assert.equal(registered.payload.data.preauth, null);
    assert.notEqual(client.cookie, anonymousCookie);
    assert.notEqual(client.csrfToken, anonymous.payload.data.csrfToken);

    const stored = await User.findOne({ usernameNormalized: account.username });
    assert.equal(stored.status, 'active');
    assert.ok(stored.emailVerifiedAt);
    assert.ok(stored.phoneVerifiedAt);

    const obsoleteSecondStep = await client.request('/api/v1/auth/second-step/request', {
      method: 'POST',
      body: { channel: 'email' },
    });
    assert.equal(obsoleteSecondStep.response.status, 401);
    assert.equal(obsoleteSecondStep.payload.error.code, 'AUTH_PREAUTH_INVALID');

    const invalidPassword = new ApiClient(origin);
    const denied = await loginPrimary(invalidPassword, {
      ...account,
      password: `${account.password} نامعتبر`,
    });
    assert.equal(denied.response.status, 401);
    assert.equal(denied.payload.error.code, 'AUTH_INVALID_CREDENTIALS');

    const loggedOut = await client.request('/api/v1/auth/logout', {
      method: 'POST',
      body: {},
    });
    assert.equal(loggedOut.response.status, 200, JSON.stringify(loggedOut.payload));
    assert.equal(client.cookie, '');

    const loginClient = new ApiClient(origin);
    const loggedIn = await loginPrimary(loginClient, account);
    assert.equal(loggedIn.response.status, 200, JSON.stringify(loggedIn.payload));
    assert.equal(loggedIn.payload.data.status, 'AUTHENTICATED');
    assert.equal(loggedIn.payload.data.preauth, null);

    const unknownRecovery = new ApiClient(origin);
    await unknownRecovery.bootstrap();
    const unknownStarted = await unknownRecovery.request('/api/v1/auth/password/forgot', {
      method: 'POST',
      body: { identifier: identity('missing-no2step').email },
    });
    assert.equal(unknownStarted.payload.data.status, 'READY_FOR_PASSWORD_RESET');
    assert.deepEqual(unknownStarted.payload.data.preauth.completedChannels, ['email', 'sms']);
    const unknownPassword = 'عبارت امن ناشناس با فاصله کافی';
    const unknownReset = await unknownRecovery.request('/api/v1/auth/password/reset', {
      method: 'POST',
      body: { password: unknownPassword, passwordConfirmation: unknownPassword },
    });
    assert.deepEqual(unknownReset.payload.data, { success: true });

    const recovery = new ApiClient(origin);
    await recovery.bootstrap();
    const recoveryStarted = await recovery.request('/api/v1/auth/password/forgot', {
      method: 'POST',
      body: { identifier: account.email },
    });
    assert.equal(recoveryStarted.response.status, 200, JSON.stringify(recoveryStarted.payload));
    assert.equal(recoveryStarted.payload.data.status, unknownStarted.payload.data.status);
    assert.deepEqual(
      recoveryStarted.payload.data.preauth.destinations,
      unknownStarted.payload.data.preauth.destinations,
    );
    const recoveredPassword = `${account.password} بازیابی`;
    const recovered = await recovery.request('/api/v1/auth/password/reset', {
      method: 'POST',
      body: { password: recoveredPassword, passwordConfirmation: recoveredPassword },
    });
    assert.deepEqual(recovered.payload.data, { success: true });
    assert.equal((await loginClient.request('/api/v1/auth/me')).payload.data.user, null);

    const current = new ApiClient(origin);
    const recoveredLogin = await loginPrimary(current, {
      ...account,
      password: recoveredPassword,
    });
    assert.equal(recoveredLogin.payload.data.status, 'AUTHENTICATED');

    const wrongReauthentication = await current.request('/api/v1/auth/reauth', {
      method: 'POST',
      body: {
        purpose: 'change_password',
        currentPassword: `${recoveredPassword} نامعتبر`,
      },
    });
    assert.equal(wrongReauthentication.response.status, 401);
    assert.equal(wrongReauthentication.payload.error.code, 'AUTH_INVALID_CREDENTIALS');

    const reauthenticated = await current.request('/api/v1/auth/reauth', {
      method: 'POST',
      body: { purpose: 'change_password', currentPassword: recoveredPassword },
    });
    assert.equal(reauthenticated.payload.data.status, 'REAUTHENTICATED');
    assert.equal(reauthenticated.payload.data.purpose, 'change_password');
    assert.equal(reauthenticated.payload.data.preauth, null);

    const wrongPurpose = await current.request('/api/v1/auth/email/change/request', {
      method: 'POST',
      body: { email: identity('wrong-purpose-no2step').email },
    });
    assert.equal(wrongPurpose.payload.error.code, 'AUTH_REAUTH_REQUIRED');

    const changedPassword = `${recoveredPassword} تازه`;
    const passwordChanged = await current.request('/api/v1/auth/password/change', {
      method: 'POST',
      body: { password: changedPassword, passwordConfirmation: changedPassword },
    });
    assert.equal(passwordChanged.payload.data.status, 'PASSWORD_CHANGED');

    const emailGrant = await current.request('/api/v1/auth/reauth', {
      method: 'POST',
      body: { purpose: 'change_email', currentPassword: changedPassword },
    });
    assert.equal(emailGrant.payload.data.status, 'REAUTHENTICATED');
    const newEmail = identity('new-no2step-email').email;
    const csrfBeforeEmailChange = current.csrfToken;
    const emailChanged = await current.request('/api/v1/auth/email/change/request', {
      method: 'POST',
      body: { email: newEmail },
    });
    assert.equal(emailChanged.response.status, 200, JSON.stringify(emailChanged.payload));
    assert.equal(emailChanged.payload.data.status, 'EMAIL_CHANGED');
    assert.equal(emailChanged.payload.data.user.email, newEmail);
    assert.notEqual(current.csrfToken, csrfBeforeEmailChange);
    account.email = newEmail;

    const phoneGrant = await current.request('/api/v1/auth/reauth', {
      method: 'POST',
      body: { purpose: 'change_phone', currentPassword: changedPassword },
    });
    assert.equal(phoneGrant.payload.data.status, 'REAUTHENTICATED');
    const newPhone = identity('new-no2step-phone').phone;
    const phoneChanged = await current.request('/api/v1/auth/phone/change/request', {
      method: 'POST',
      body: { phone: newPhone },
    });
    assert.equal(phoneChanged.response.status, 200, JSON.stringify(phoneChanged.payload));
    assert.equal(phoneChanged.payload.data.status, 'PHONE_CHANGED');
    assert.equal(phoneChanged.payload.data.user.phone, newPhone);
    account.phone = newPhone;

    await User.updateOne(
      { usernameNormalized: account.username },
      { $set: { adminRoles: ['SUPER_ADMIN'] }, $inc: { sessionVersion: 1 } },
    );
    const adminClient = new ApiClient(origin);
    await adminClient.adminBootstrap();
    const anonymousAdminCookie = adminClient.adminCookie;
    const adminLogin = await adminClient.request('/api/v1/admin/auth/login', {
      method: 'POST',
      body: { identifier: account.username, password: changedPassword },
    });
    assert.equal(adminLogin.response.status, 200, JSON.stringify(adminLogin.payload));
    assert.equal(adminLogin.payload.data.status, 'AUTHENTICATED');
    assert.equal(adminLogin.payload.data.preauth, null);
    assert.deepEqual(adminLogin.payload.data.user.adminRoles, ['SUPER_ADMIN']);
    assert.notEqual(adminClient.adminCookie, anonymousAdminCookie);
    assert.equal(adminClient.cookie, '');
    assert.equal(
      (await adminClient.request('/api/v1/admin/roles', { origin: adminOrigin })).response.status,
      200,
    );

    await User.updateOne(
      { usernameNormalized: account.username },
      { $set: { adminRoles: [] }, $inc: { sessionVersion: 1 } },
    );
    const revoked = await adminClient.request('/api/v1/admin/roles', { origin: adminOrigin });
    assert.equal(revoked.response.status, 401);
    assert.equal(revoked.payload.error.code, 'AUTH_SESSION_EXPIRED');

    const ordinary = identity('ordinary-no2step');
    const ordinaryClient = new ApiClient(origin);
    const ordinaryRegistration = await ordinaryClient.bootstrap().then(() =>
      ordinaryClient.request('/api/v1/auth/register', {
        method: 'POST',
        body: ordinary,
      }),
    );
    assert.equal(ordinaryRegistration.payload.data.status, 'AUTHENTICATED');
    const rejectedAdmin = new ApiClient(origin);
    await rejectedAdmin.adminBootstrap();
    const rejected = await rejectedAdmin.request('/api/v1/admin/auth/login', {
      method: 'POST',
      body: { identifier: ordinary.username, password: ordinary.password },
    });
    assert.equal(rejected.response.status, 401);
    assert.equal(rejected.payload.error.code, 'AUTH_INVALID_CREDENTIALS');
    assert.equal(
      (await rejectedAdmin.request('/api/v1/admin/roles', { origin: adminOrigin })).response.status,
      401,
    );

    assert.deepEqual(authenticationDeliveries, []);
    assert.equal(await AuthChallenge.countDocuments(), challengeCountBefore);
  } finally {
    await close(noTwoStepServer);
  }
});

test('disabling dev-no2step revokes bypass sessions and grants before normal MFA resumes', async () => {
  const modePrefix = `waandapp:test:${suffix}:mode-transition:`;
  const bypassSettings = {
    ...testSettings,
    nodeEnvironment: 'development',
    authDeliveryMode: 'dev-no2step',
    authRateLimitPrefix: `${modePrefix}bypass:auth:`,
    adminAuthRateLimitPrefix: `${modePrefix}bypass:admin:`,
    globalRateLimitPrefix: `${modePrefix}bypass:global:`,
  };
  const normalSettings = {
    ...bypassSettings,
    authDeliveryMode: 'development',
    authRateLimitPrefix: `${modePrefix}normal:auth:`,
    adminAuthRateLimitPrefix: `${modePrefix}normal:admin:`,
    globalRateLimitPrefix: `${modePrefix}normal:global:`,
  };
  const quietSender = {
    async sendAuthenticationCode() {},
    async sendSecurityNotification() {},
  };
  const bypassServer = createServer(
    createApp(redis, {
      settings: bypassSettings,
      senders: { emailSender: quietSender, smsSender: quietSender },
    }),
  );
  const normalServer = createServer(
    createApp(redis, {
      settings: normalSettings,
      senders: { emailSender: quietSender, smsSender: quietSender },
    }),
  );
  const bypassAddress = await listen(bypassServer);
  const normalAddress = await listen(normalServer);
  const bypassOrigin = `http://127.0.0.1:${bypassAddress.port}`;
  const normalOrigin = `http://127.0.0.1:${normalAddress.port}`;

  try {
    const account = identity('mode-switch-consumer');
    const consumer = new ApiClient(bypassOrigin);
    await consumer.bootstrap();
    const registered = await consumer.request('/api/v1/auth/register', {
      method: 'POST',
      body: account,
    });
    assert.equal(registered.payload.data.status, 'AUTHENTICATED');

    const adminAccount = identity('mode-switch-admin');
    const adminOwner = new ApiClient(bypassOrigin);
    await adminOwner.bootstrap();
    await adminOwner.request('/api/v1/auth/register', {
      method: 'POST',
      body: adminAccount,
    });
    await User.updateOne(
      { usernameNormalized: adminAccount.username },
      { $set: { adminRoles: ['SUPER_ADMIN'] }, $inc: { sessionVersion: 1 } },
    );
    const admin = new ApiClient(bypassOrigin);
    await admin.adminBootstrap();
    const bypassAdminLogin = await admin.request('/api/v1/admin/auth/login', {
      method: 'POST',
      body: { identifier: adminAccount.username, password: adminAccount.password },
    });
    assert.equal(bypassAdminLogin.payload.data.status, 'AUTHENTICATED');

    const recovery = new ApiClient(bypassOrigin);
    await recovery.bootstrap();
    const recoveryStarted = await recovery.request('/api/v1/auth/password/forgot', {
      method: 'POST',
      body: { identifier: account.email },
    });
    assert.equal(recoveryStarted.payload.data.status, 'READY_FOR_PASSWORD_RESET');

    const verified = new ApiClient();
    const { account: verifiedAccount } = await registerActive(
      verified,
      identity('mode-switch-step-up'),
    );
    verified.origin = bypassOrigin;
    const bypassStepUp = await verified.request('/api/v1/auth/reauth', {
      method: 'POST',
      body: { purpose: 'change_password', currentPassword: verifiedAccount.password },
    });
    assert.equal(bypassStepUp.payload.data.status, 'REAUTHENTICATED');

    consumer.origin = normalOrigin;
    const consumerAfterSwitch = await consumer.request('/api/v1/auth/me');
    assert.equal(consumerAfterSwitch.payload.data.user, null);

    admin.origin = normalOrigin;
    const adminAfterSwitch = await admin.adminBootstrap();
    assert.equal(adminAfterSwitch.payload.data.user, null);

    recovery.origin = normalOrigin;
    const blockedReset = await recovery.request('/api/v1/auth/password/reset', {
      method: 'POST',
      body: {
        password: `${account.password} تازه`,
        passwordConfirmation: `${account.password} تازه`,
      },
    });
    assert.equal(blockedReset.response.status, 401);
    assert.equal(blockedReset.payload.error.code, 'AUTH_PREAUTH_INVALID');

    verified.origin = normalOrigin;
    const blockedStepUp = await verified.request('/api/v1/auth/password/change', {
      method: 'POST',
      body: {
        password: `${verifiedAccount.password} تازه`,
        passwordConfirmation: `${verifiedAccount.password} تازه`,
      },
    });
    assert.equal(blockedStepUp.response.status, 403);
    assert.equal(blockedStepUp.payload.error.code, 'AUTH_REAUTH_REQUIRED');

    const normalConsumer = new ApiClient(normalOrigin);
    const normalConsumerLogin = await loginPrimary(normalConsumer, account);
    assert.equal(normalConsumerLogin.payload.data.status, 'SECOND_STEP_REQUIRED');

    const normalAdmin = new ApiClient(normalOrigin);
    const normalAdminLogin = await adminLoginPrimary(normalAdmin, adminAccount);
    assert.equal(normalAdminLogin.payload.data.status, 'SECOND_STEP_REQUIRED');
  } finally {
    await Promise.all([close(bypassServer), close(normalServer)]);
  }
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
