function requiredString(environment, key) {
  const value = environment[key]?.trim();

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function integer(environment, key, minimum, maximum = Number.MAX_SAFE_INTEGER) {
  const value = Number(requiredString(environment, key));

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${key} must be an integer between ${minimum} and ${maximum}.`);
  }

  return value;
}

function secret(environment, key, nodeEnvironment) {
  const value = requiredString(environment, key);

  if (value.length < 32) {
    throw new Error(`${key} must be at least 32 characters long.`);
  }

  if (
    nodeEnvironment === 'production' &&
    /(development-only|development-secret|test-only|change-before-production|replace-me|changeme|dummy|example)/i.test(
      value,
    )
  ) {
    throw new Error(`${key} must not use a development placeholder in production.`);
  }

  if (nodeEnvironment === 'production' && new Set(value).size < 12) {
    throw new Error(`${key} must have sufficient character diversity in production.`);
  }

  return value;
}

function url(environment, key, protocols) {
  const value = requiredString(environment, key);
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${key} must be a valid absolute URL.`);
  }

  if (!protocols.includes(parsed.protocol)) {
    throw new Error(`${key} must use one of these protocols: ${protocols.join(', ')}.`);
  }

  return value;
}

function webhookUrl(environment, key, protocols) {
  const value = url(environment, key, protocols);
  const parsed = new URL(value);

  if (parsed.username || parsed.password) {
    throw new Error(`${key} must not contain embedded credentials.`);
  }

  return value;
}

function exactOrigin(value, key, nodeEnvironment) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${key} must contain valid absolute origins.`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== value) {
    throw new Error(`${key} entries must be exact HTTP(S) origins without paths.`);
  }

  if (nodeEnvironment === 'production' && parsed.protocol !== 'https:') {
    throw new Error(`${key} entries must use HTTPS in production.`);
  }

  return parsed.origin;
}

function origins(environment, key, nodeEnvironment) {
  const values = requiredString(environment, key)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => exactOrigin(value, key, nodeEnvironment));

  if (values.length === 0) throw new Error(`${key} must include at least one origin.`);
  return Object.freeze([...new Set(values)]);
}

function validateProductionDatastoreTransport(mongodbUri, redisUrl, nodeEnvironment) {
  if (nodeEnvironment !== 'production') return;

  if (new URL(redisUrl).protocol !== 'rediss:') {
    throw new Error('REDIS_URL must use rediss in production.');
  }

  const mongodb = new URL(mongodbUri);
  const mongodbOptions = [...mongodb.searchParams].map(([key, value]) => [
    key.toLowerCase(),
    value.toLowerCase(),
  ]);
  const tlsOptions = mongodbOptions
    .filter(([key]) => ['tls', 'ssl'].includes(key.toLowerCase()))
    .map(([, value]) => value);
  const insecureTlsEnabled = mongodbOptions.some(
    ([key, value]) =>
      ['tlsinsecure', 'tlsallowinvalidcertificates', 'tlsallowinvalidhostnames'].includes(key) &&
      value === 'true',
  );
  if (insecureTlsEnabled) {
    throw new Error(
      'MONGODB_URI must not disable TLS certificate or hostname verification in production.',
    );
  }
  const tlsDisabled = tlsOptions.includes('false');
  const tlsEnabled = tlsOptions.includes('true');
  if (tlsDisabled || (mongodb.protocol !== 'mongodb+srv:' && !tlsEnabled)) {
    throw new Error(
      'MONGODB_URI must use mongodb+srv or explicitly enable tls=true/ssl=true in production, and must not set tls=false/ssl=false.',
    );
  }
}

function deliveryConfig(environment, nodeEnvironment) {
  const mode = requiredString(environment, 'AUTH_DELIVERY_MODE');

  if (!['disabled', 'webhook'].includes(mode)) {
    throw new Error('AUTH_DELIVERY_MODE must be disabled or webhook.');
  }

  if (nodeEnvironment === 'production' && mode !== 'webhook') {
    throw new Error('AUTH_DELIVERY_MODE must be webhook in production.');
  }

  if (mode === 'disabled') {
    return {
      authDeliveryMode: mode,
      authEmailWebhookUrl: null,
      authEmailWebhookToken: null,
      authSmsWebhookUrl: null,
      authSmsWebhookToken: null,
    };
  }

  const protocols = nodeEnvironment === 'production' ? ['https:'] : ['http:', 'https:'];
  const emailToken = secret(environment, 'AUTH_EMAIL_WEBHOOK_TOKEN', nodeEnvironment);
  const smsToken = secret(environment, 'AUTH_SMS_WEBHOOK_TOKEN', nodeEnvironment);

  return {
    authDeliveryMode: mode,
    authEmailWebhookUrl: webhookUrl(environment, 'AUTH_EMAIL_WEBHOOK_URL', protocols),
    authEmailWebhookToken: emailToken,
    authSmsWebhookUrl: webhookUrl(environment, 'AUTH_SMS_WEBHOOK_URL', protocols),
    authSmsWebhookToken: smsToken,
  };
}

export function validateEnvironment(environment) {
  const nodeEnvironment = requiredString(environment, 'NODE_ENV');
  const logLevel = requiredString(environment, 'LOG_LEVEL');

  if (!['development', 'test', 'production'].includes(nodeEnvironment)) {
    throw new Error('NODE_ENV must be development, test, or production.');
  }

  if (!['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'].includes(logLevel)) {
    throw new Error('LOG_LEVEL is invalid.');
  }

  const port = integer(environment, 'PORT', 1, 65_535);
  const sessionSecret = secret(environment, 'SESSION_SECRET', nodeEnvironment);
  const authCodePepper = secret(environment, 'AUTH_CODE_PEPPER', nodeEnvironment);
  if (sessionSecret === authCodePepper) {
    throw new Error('SESSION_SECRET and AUTH_CODE_PEPPER must be different.');
  }

  const sessionCookieName = requiredString(environment, 'SESSION_COOKIE_NAME');
  if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(sessionCookieName)) {
    throw new Error('SESSION_COOKIE_NAME contains invalid characters.');
  }
  if (nodeEnvironment === 'production' && !sessionCookieName.startsWith('__Host-')) {
    throw new Error('SESSION_COOKIE_NAME must use the __Host- prefix in production.');
  }

  const sessionIdleTtlMs = integer(environment, 'SESSION_IDLE_TTL_MS', 300_000, 3_600_000);
  const sessionAbsoluteTtlMs = integer(environment, 'SESSION_ABSOLUTE_TTL_MS', 300_000, 86_400_000);
  if (sessionAbsoluteTtlMs < sessionIdleTtlMs) {
    throw new Error(
      'SESSION_ABSOLUTE_TTL_MS must be greater than or equal to SESSION_IDLE_TTL_MS.',
    );
  }

  const authCodeTtlMs = integer(environment, 'AUTH_CODE_TTL_MS', 60_000, 900_000);
  const authResendCooldownMs = integer(environment, 'AUTH_RESEND_COOLDOWN_MS', 1_000);
  if (authResendCooldownMs >= authCodeTtlMs) {
    throw new Error('AUTH_RESEND_COOLDOWN_MS must be shorter than AUTH_CODE_TTL_MS.');
  }

  const mongodbUri = url(environment, 'MONGODB_URI', ['mongodb:', 'mongodb+srv:']);
  const redisUrl = url(environment, 'REDIS_URL', ['redis:', 'rediss:']);
  validateProductionDatastoreTransport(mongodbUri, redisUrl, nodeEnvironment);

  const corsOrigins = origins(environment, 'CORS_ORIGINS', nodeEnvironment);
  const authMutationOrigins = origins(environment, 'AUTH_MUTATION_ORIGINS', nodeEnvironment);
  if (authMutationOrigins.some((origin) => !corsOrigins.includes(origin))) {
    throw new Error('AUTH_MUTATION_ORIGINS must be a subset of CORS_ORIGINS.');
  }

  const authTransactionTtlMs = integer(environment, 'AUTH_TRANSACTION_TTL_MS', 300_000, 3_600_000);
  if (authCodeTtlMs > authTransactionTtlMs) {
    throw new Error('AUTH_CODE_TTL_MS must not exceed AUTH_TRANSACTION_TTL_MS.');
  }
  const authStepUpTtlMs = integer(environment, 'AUTH_STEP_UP_TTL_MS', 60_000, 600_000);
  if (authStepUpTtlMs > authTransactionTtlMs) {
    throw new Error('AUTH_STEP_UP_TTL_MS must not exceed AUTH_TRANSACTION_TTL_MS.');
  }

  const authTermsVersion = requiredString(environment, 'AUTH_TERMS_VERSION');
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(authTermsVersion)) {
    throw new Error('AUTH_TERMS_VERSION must be a short immutable version identifier.');
  }

  return Object.freeze({
    nodeEnvironment,
    port,
    mongodbUri,
    redisUrl,
    corsOrigins,
    authMutationOrigins,
    logLevel,
    rateLimitWindowMs: integer(environment, 'RATE_LIMIT_WINDOW_MS', 1_000, 86_400_000),
    rateLimitMax: integer(environment, 'RATE_LIMIT_MAX', 1, 100_000),
    trustProxyHops: integer(environment, 'TRUST_PROXY_HOPS', 0, 32),
    sessionSecret,
    sessionCookieName,
    sessionIdleTtlMs,
    sessionAbsoluteTtlMs,
    authCodePepper,
    authCodeTtlMs,
    authTransactionTtlMs,
    authStepUpTtlMs,
    authTermsVersion,
    authArgon2MemoryKib: integer(environment, 'AUTH_ARGON2_MEMORY_KIB', 19_456, 262_144),
    authArgon2TimeCost: integer(environment, 'AUTH_ARGON2_TIME_COST', 2, 10),
    authArgon2Parallelism: integer(environment, 'AUTH_ARGON2_PARALLELISM', 1, 4),
    authMaxVerifyAttempts: integer(environment, 'AUTH_MAX_VERIFY_ATTEMPTS', 1, 10),
    authMaxSendsPerTransaction: integer(environment, 'AUTH_MAX_SENDS_PER_TRANSACTION', 1, 10),
    authResendCooldownMs,
    authLoginIpWindowMs: integer(environment, 'AUTH_LOGIN_IP_WINDOW_MS', 1_000, 86_400_000),
    authLoginIpLimit: integer(environment, 'AUTH_LOGIN_IP_LIMIT', 1, 1_000),
    authLoginIdentifierWindowMs: integer(
      environment,
      'AUTH_LOGIN_IDENTIFIER_WINDOW_MS',
      1_000,
      86_400_000,
    ),
    authLoginIdentifierLimit: integer(environment, 'AUTH_LOGIN_IDENTIFIER_LIMIT', 1, 100),
    authRequestIpWindowMs: integer(environment, 'AUTH_REQUEST_IP_WINDOW_MS', 1_000, 86_400_000),
    authRequestIpLimit: integer(environment, 'AUTH_REQUEST_IP_LIMIT', 1, 1_000),
    authRequestDestinationWindowMs: integer(
      environment,
      'AUTH_REQUEST_DESTINATION_WINDOW_MS',
      1_000,
      86_400_000,
    ),
    authRequestDestinationLimit: integer(environment, 'AUTH_REQUEST_DESTINATION_LIMIT', 1, 100),
    authVerifyIpWindowMs: integer(environment, 'AUTH_VERIFY_IP_WINDOW_MS', 1_000, 86_400_000),
    authVerifyIpLimit: integer(environment, 'AUTH_VERIFY_IP_LIMIT', 1, 1_000),
    authVerifyDestinationWindowMs: integer(
      environment,
      'AUTH_VERIFY_DESTINATION_WINDOW_MS',
      1_000,
      86_400_000,
    ),
    authVerifyDestinationLimit: integer(environment, 'AUTH_VERIFY_DESTINATION_LIMIT', 1, 100),
    ...deliveryConfig(environment, nodeEnvironment),
  });
}
