import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(webDirectory, '../..');

loadEnvConfig(repositoryRoot, process.env.NODE_ENV !== 'production', console, true);

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required. Copy .env.example to .env.');
}

try {
  new URL(apiUrl);
} catch {
  throw new Error('NEXT_PUBLIC_API_URL must be a valid absolute URL.');
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
  output: 'standalone',
  outputFileTracingRoot: repositoryRoot,
};

export default nextConfig;
