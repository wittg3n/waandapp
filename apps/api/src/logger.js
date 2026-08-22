import pino from 'pino';

import { config } from './config/index.js';

const REDACTED = '[Redacted]';
const sensitiveFields = new Set([
  'auth',
  'authheader',
  'authtransactionid',
  'authorization',
  'authtransactiontoken',
  'challengeid',
  'code',
  'codedigest',
  'cookie',
  'cookies',
  'credentials',
  'csrf',
  'csrftoken',
  'currentpassword',
  'destination',
  'destinationsnapshot',
  'digest',
  'email',
  'emailnormalized',
  'firstname',
  'fullname',
  'identifier',
  'ip',
  'ipaddress',
  'clientip',
  'lastname',
  'mobile',
  'mobilenumber',
  'newpassword',
  'otp',
  'password',
  'passwordconfirmation',
  'passwordhash',
  'phone',
  'phonenumber',
  'phonenormalized',
  'preauth',
  'preauthtransactionid',
  'providersecret',
  'providertoken',
  'remoteaddress',
  'remoteport',
  'requestip',
  'session',
  'sessionid',
  'setcookie',
  'sourceip',
  'token',
  'transactionid',
  'userid',
  'accountid',
  'username',
  'usernamenormalized',
]);

function sensitiveField(key) {
  const normalized = key.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
  return (
    sensitiveFields.has(normalized) ||
    normalized.includes('password') ||
    normalized.startsWith('preauth') ||
    normalized.endsWith('apikey') ||
    normalized.endsWith('challengeid') ||
    normalized.endsWith('code') ||
    normalized.endsWith('cookie') ||
    normalized.endsWith('credential') ||
    normalized.endsWith('credentials') ||
    normalized.endsWith('secret') ||
    normalized.endsWith('sessionid') ||
    normalized.endsWith('token') ||
    normalized.endsWith('transactionid') ||
    normalized.endsWith('digest') ||
    normalized.endsWith('hash') ||
    normalized.endsWith('email') ||
    normalized.endsWith('phone') ||
    normalized.endsWith('identifier') ||
    normalized.endsWith('username') ||
    normalized.endsWith('userid') ||
    normalized.endsWith('firstname') ||
    normalized.endsWith('lastname') ||
    normalized.endsWith('destination')
  );
}

function sanitizeString(value) {
  return value
    .replace(/\bBearer\s+\S+/gi, 'Bearer [Redacted]')
    .replace(/([a-z][a-z0-9+.-]*:\/\/)[^\s/:@]+:[^\s/@]+@/gi, '$1[Redacted]@')
    .replace(/([?&](?:code|key|otp|password|secret|token)=)[^&#\s]+/gi, '$1[Redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[Redacted email]')
    .replace(/\+\d(?:[\s()-]*\d){7,14}/g, '[Redacted phone]');
}

function serializedError(error) {
  const serialized = pino.stdSerializers.err(error);

  if (error?.code !== 11_000 && error?.codeName !== 'DuplicateKey') return serialized;

  return {
    type: serialized.type,
    message: 'Database unique constraint error.',
    stack: serialized.stack?.split('\n').slice(1).join('\n'),
    errorNumber: 11_000,
  };
}

export function redactSensitiveValues(value, seen = new WeakMap()) {
  if (typeof value === 'string') return sanitizeString(value);
  if (!value || typeof value !== 'object') return value;
  if (value instanceof Date || Buffer.isBuffer(value)) return value;
  if (seen.has(value)) return '[Circular]';
  if (value instanceof Error) {
    seen.set(value, REDACTED);
    return redactSensitiveValues(serializedError(value), seen);
  }

  const result = Array.isArray(value) ? [] : {};
  seen.set(value, result);

  for (const [key, entry] of Object.entries(value)) {
    result[key] = sensitiveField(key) ? REDACTED : redactSensitiveValues(entry, seen);
  }

  return result;
}

export const logger = pino({
  level: config.logLevel,
  formatters: {
    log: redactSensitiveValues,
  },
  serializers: {
    err: redactSensitiveValues,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers.forwarded',
      'req.headers["x-forwarded-for"]',
      'req.headers["x-real-ip"]',
      'req.headers["x-csrf-token"]',
      'req.remoteAddress',
      'req.remotePort',
      'req.body.password',
      'req.body.passwordConfirmation',
      'req.body.currentPassword',
      'req.body.newPassword',
      'req.body.code',
      'req.body.otp',
      'req.body.email',
      'req.body.phone',
      'req.body.identifier',
      'res.headers.set-cookie',
      '*.password',
      '*.passwordHash',
      '*.passwordConfirmation',
      '*.currentPassword',
      '*.newPassword',
      '*.code',
      '*.otp',
      '*.codeDigest',
      '*.destination',
      '*.destinationSnapshot',
      '*.email',
      '*.emailNormalized',
      '*.phone',
      '*.phoneNormalized',
      '*.identifier',
      '*.csrfToken',
      '*.sessionId',
      '*.session',
      '*.preauth',
      '*.auth',
      '*.token',
      '*.authorization',
      '*.cookie',
      '*.providerToken',
      '*.err.config.headers.authorization',
      '*.err.request.headers.authorization',
    ],
    censor: REDACTED,
  },
});
