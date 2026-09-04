import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function javascriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? javascriptFiles(path) : /\.m?js$/.test(entry.name) ? [path] : [];
  });
}

for (const file of [...javascriptFiles('src'), ...javascriptFiles('scripts')]) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '4000',
  MONGODB_URI: 'mongodb://localhost:27017/waandapp_build_check',
  MONGODB_CORE_DATABASE: 'waandapp_build_check',
  MONGODB_CMS_DATABASE: 'waandapp_build_check_cms',
  CMS_MEDIA_ROOT: 'apps/api/storage/cms-build-check',
  CMS_MEDIA_MAX_BYTES: '10485760',
  CMS_SCHEDULER_INTERVAL_MS: '60000',
  REDIS_URL: 'redis://localhost:6379',
  CORS_ORIGINS: 'http://localhost:3001,http://localhost:3039',
  AUTH_MUTATION_ORIGINS: 'http://localhost:3001',
  ADMIN_DASHBOARD_ORIGIN: 'http://localhost:3039',
  LOG_LEVEL: 'silent',
  RATE_LIMIT_WINDOW_MS: '60000',
  RATE_LIMIT_MAX: '100',
  TRUST_PROXY_HOPS: '0',
  SESSION_SECRET: 'build-check-session-secret-00000000000000000000000000000000',
  SESSION_COOKIE_NAME: 'waand.sid',
  SESSION_IDLE_TTL_MS: '3600000',
  SESSION_ABSOLUTE_TTL_MS: '86400000',
  ADMIN_SESSION_SECRET: 'build-check-admin-session-secret-0000000000000000000000000000',
  ADMIN_SESSION_COOKIE_NAME: 'waand_admin_sid',
  ADMIN_SESSION_IDLE_TTL_MS: '900000',
  ADMIN_SESSION_ABSOLUTE_TTL_MS: '28800000',
  AUTH_CODE_PEPPER: 'build-check-code-pepper-000000000000000000000000000000000',
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

await import('../src/server.js');
