import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(webDirectory, '../..');

loadEnvConfig(repositoryRoot, process.env.NODE_ENV !== 'production', console, true);

function publicHttpUrl(
  name: 'NEXT_PUBLIC_API_URL' | 'NEXT_PUBLIC_SITE_URL' | 'NEXT_PUBLIC_USER_DASHBOARD_URL',
) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required. Copy .env.example to .env.`);
  }

  try {
    const parsed = new URL(value);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error(`${name} must be an absolute HTTP(S) URL.`);
  }

  return value;
}

const apiUrl = publicHttpUrl('NEXT_PUBLIC_API_URL');
const siteUrl = publicHttpUrl('NEXT_PUBLIC_SITE_URL');
const userDashboardUrl = publicHttpUrl('NEXT_PUBLIC_USER_DASHBOARD_URL');

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_USER_DASHBOARD_URL: userDashboardUrl,
  },
  output: 'standalone',
  outputFileTracingRoot: repositoryRoot,
};

export default nextConfig;
