import { RedisStore } from 'connect-redis';
import { authRedisKeys } from './redis-keys.js';

// Atomic session + index writes; Mongo sessionVersion rejects stale in-flight saves.
export class TrackedRedisStore extends RedisStore {
  constructor({ redis, settings, scope, idleTtlMs, absoluteTtlMs }) {
    const keys = authRedisKeys(settings);
    super({
      client: redis,
      prefix: keys.sessionPrefix(scope),
      ttl: (value) =>
        Math.max(
          0,
          Math.ceil(
            Math.min(
              value.userId
                ? idleTtlMs
                : Math.min(idleTtlMs, settings.authTransactionTtlMs ?? idleTtlMs),
              (value.createdAt ?? Date.now()) + absoluteTtlMs - Date.now(),
            ) / 1000,
          ),
        ),
    });
    this.keys = keys;
    this.absoluteTtlMs = absoluteTtlMs;
    this.anonymousTtlMs = settings.authTransactionTtlMs ?? idleTtlMs;
  }
  async set(sid, value, callback) {
    try {
      const ttl = this.getTTL(value);
      if (ttl <= 0) return await this.destroy(sid, callback);
      const key = this.prefix + sid;
      await this.client.eval(
        `
        if redis.call('EXISTS', KEYS[1] .. ':revoked') == 1 then return 0 end
        redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
        if KEYS[2] ~= '' then
          redis.call('ZREMRANGEBYSCORE', KEYS[2], '-inf', ARGV[3])
          redis.call('ZADD', KEYS[2], ARGV[4], KEYS[1])
          local last = redis.call('ZRANGE', KEYS[2], -1, -1, 'WITHSCORES')
          redis.call('PEXPIREAT', KEYS[2], last[2])
        end
        return 1
      `,
        {
          keys: [key, value.userId ? this.keys.userSessions(value.userId) : ''],
          arguments: [
            JSON.stringify(value),
            String(ttl),
            String(Date.now()),
            String(Date.now() + ttl * 1000),
          ],
        },
      );
      callback?.(null);
    } catch (error) {
      if (callback) callback(error);
      else throw error;
    }
  }
  async touch(sid, value, callback) {
    return this.set(sid, { ...value, lastSeenAt: Date.now() }, callback);
  }
  async destroy(sid, callback) {
    try {
      const key = this.prefix + sid;
      const value = await this.get(sid);
      const batch = this.client
        .multi()
        .set(key + ':revoked', '1', {
          expiration: {
            type: 'PX',
            value: value?.userId ? this.absoluteTtlMs : this.anonymousTtlMs,
          },
        })
        .del(key);
      if (value?.userId) batch.zRem(this.keys.userSessions(value.userId), key);
      await batch.exec();
      callback?.(null);
    } catch (error) {
      if (callback) callback(error);
      else throw error;
    }
  }
}
export async function revokeUserSessions(redis, settings, userId) {
  return redis.eval(
    `
    local sessions = redis.call('ZRANGE', KEYS[1], 0, -1)
    for _, key in ipairs(sessions) do redis.call('DEL', key) end
    redis.call('DEL', KEYS[1])
    return #sessions
  `,
    { keys: [authRedisKeys(settings).userSessions(userId)], arguments: [] },
  );
}
