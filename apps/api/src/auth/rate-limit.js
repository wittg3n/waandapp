import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

import { ApiError } from '../middleware/errors.js';
import { keyedDigest } from './code.js';

const FIXED_WINDOW_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('PTTL', KEYS[1])
return { current, ttl }
`;

function retryAfterSeconds(milliseconds) {
  return Math.max(1, Math.ceil(Math.max(0, milliseconds) / 1_000));
}

function rateLimitError(milliseconds) {
  const retry = retryAfterSeconds(milliseconds);
  return new ApiError(429, 'AUTH_RATE_LIMITED', 'Too many authentication attempts.', {
    details: { retryAfterSeconds: retry },
    headers: { 'Retry-After': String(retry) },
  });
}

export function createAuthIpRateLimiter({ redis, windowMs, limit, prefix, onLimited }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    passOnStoreError: false,
    store: new RedisStore({
      sendCommand: (...args) => redis.sendCommand(args),
      prefix,
    }),
    handler: (request, response, next) => {
      const remainingMs = request.rateLimit?.resetTime
        ? request.rateLimit.resetTime.getTime() - Date.now()
        : windowMs;
      void onLimited?.(request);
      next(rateLimitError(remainingMs));
    },
  });
}

async function consumeFixedWindow(redis, key, windowMs) {
  const result = await redis.sendCommand(['EVAL', FIXED_WINDOW_SCRIPT, '1', key, String(windowMs)]);
  return { count: Number(result[0]), ttlMs: Number(result[1]) };
}

export async function enforceDestinationLimit({
  redis,
  settings,
  namespace,
  destination,
  windowMs,
  limit,
}) {
  const digest = keyedDigest(destination, settings.authCodePepper);
  const prefix = settings.authRateLimitPrefix ?? 'waandapp:auth:';
  const key = `${prefix}${namespace}:${digest}`;
  const result = await consumeFixedWindow(redis, key, windowMs);

  if (result.count > limit) throw rateLimitError(result.ttlMs);
}

export async function enforceResendCooldown({ redis, settings, channel, destination }) {
  const digest = keyedDigest(destination, settings.authCodePepper);
  const prefix = settings.authRateLimitPrefix ?? 'waandapp:auth:';
  const key = `${prefix}cooldown:${channel}:${digest}`;
  const result = await redis.sendCommand([
    'SET',
    key,
    '1',
    'PX',
    String(settings.authResendCooldownMs),
    'NX',
  ]);

  if (result === 'OK') return;
  const ttlMs = Number(await redis.sendCommand(['PTTL', key]));
  throw rateLimitError(ttlMs > 0 ? ttlMs : settings.authResendCooldownMs);
}
