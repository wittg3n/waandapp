function requiredString(environment, key) {
  const value = environment[key]?.trim();

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function integer(environment, key, minimum) {
  const value = Number(requiredString(environment, key));

  if (!Number.isInteger(value) || value < minimum) {
    throw new Error(`${key} must be an integer greater than or equal to ${minimum}.`);
  }

  return value;
}
function validateSessionSecret(environment) {
  const sessionSecret = requiredString(environment, 'SESSION_SECRET');

  if (sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters long.');
  }

  return sessionSecret;
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

export function validateEnvironment(environment) {
  const nodeEnvironment = requiredString(environment, 'NODE_ENV');
  const logLevel = requiredString(environment, 'LOG_LEVEL');

  if (!['development', 'test', 'production'].includes(nodeEnvironment)) {
    throw new Error('NODE_ENV must be development, test, or production.');
  }

  if (!['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'].includes(logLevel)) {
    throw new Error('LOG_LEVEL is invalid.');
  }

  const port = integer(environment, 'PORT', 1);
  if (port > 65_535) {
    throw new Error('PORT must not exceed 65535.');
  }

  return Object.freeze({
    nodeEnvironment,
    port,
    mongodbUri: url(environment, 'MONGODB_URI', ['mongodb:', 'mongodb+srv:']),
    redisUrl: url(environment, 'REDIS_URL', ['redis:', 'rediss:']),
    corsOrigin: url(environment, 'CORS_ORIGIN', ['http:', 'https:']),
    logLevel,
    rateLimitWindowMs: integer(environment, 'RATE_LIMIT_WINDOW_MS', 1),
    rateLimitMax: integer(environment, 'RATE_LIMIT_MAX', 1),
    trustProxyHops: integer(environment, 'TRUST_PROXY_HOPS', 0),
    sessionSecret: validateSessionSecret(environment),
    sessionMaxAgeMs: integer(environment, 'SESSION_MAX_AGE_MS', 1),
  });
}
