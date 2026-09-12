import { createHash } from 'node:crypto';
import { authRedisKeys } from './redis-keys.js';
import { ApiError } from '../middleware/errors.js';
const reference = (key) => createHash('sha256').update(key).digest('hex');

export async function listUserSessions(redis, settings, userId) {
  const keys = authRedisKeys(settings);
  const index = keys.userSessions(userId);
  await redis.zRemRangeByScore(index, '-inf', Date.now());
  const members = await redis.zRange(index, 0, -1);
  const sessions = [];
  for (const key of members) {
    const raw = await redis.get(key);
    if (!raw) continue;
    const value = JSON.parse(raw);
    if (String(value.userId) !== String(userId)) continue;
    sessions.push({
      id: reference(key),
      scope: key.startsWith(keys.sessionPrefix('admin')) ? 'admin' : 'user',
      createdAt: value.createdAt,
      lastSeenAt: value.lastSeenAt ?? value.authTime,
    });
  }
  return sessions;
}
export async function revokeSingleSession(redis, settings, userId, id) {
  if (!/^[a-f0-9]{64}$/.test(id))
    throw new ApiError(404, 'SESSION_NOT_FOUND', 'Session not found.');
  const index = authRedisKeys(settings).userSessions(userId);
  const key = (await redis.zRange(index, 0, -1)).find((entry) => reference(entry) === id);
  if (!key) throw new ApiError(404, 'SESSION_NOT_FOUND', 'Session not found.');
  await redis
    .multi()
    .set(key + ':revoked', '1', {
      expiration: {
        type: 'PX',
        value: Math.max(settings.sessionAbsoluteTtlMs, settings.adminSessionAbsoluteTtlMs),
      },
    })
    .del(key)
    .zRem(index, key)
    .exec();
}
